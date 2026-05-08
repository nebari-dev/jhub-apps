"""Tests for jhub_apps.service.security and auth helpers.

These tests exercise the dispatch logic that selects between three credential
sources (URL param, Authorization Bearer header, jhub-apps cookie) and the
behaviour of the HS256 wrapper-JWT decoder when the input isn't a wrapper.
"""

import asyncio
from datetime import datetime, timedelta, timezone

import jwt
import pytest


def _run(coro):
    """Driver for async functions; avoids needing pytest-asyncio."""
    return asyncio.get_event_loop_policy().new_event_loop().run_until_complete(coro)


# A 1024-bit RSA key generated solely for use in this test file.  Never used
# in production. Anyone with the corresponding private key can mint tokens, so
# we generate one per test run rather than committing one.
@pytest.fixture(scope="module")
def rsa_keypair():
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return private_pem, public_pem


@pytest.fixture(autouse=True)
def jhub_secret(monkeypatch):
    monkeypatch.setenv("JHUB_APP_JWT_SECRET_KEY", "test-jhub-app-secret")
    return "test-jhub-app-secret"


def _make_hs256_wrapper(inner_token: str, secret: str) -> str:
    """Mint a wrapper JWT in the same shape as service.auth._create_access_token."""
    payload = {
        "access_token_data": {"access_token": inner_token, "token_type": "Bearer"},
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def _make_rs256_kc_token(private_pem: bytes) -> str:
    """Mint an RS256 token shaped like a Keycloak access token."""
    payload = {
        "iss": "https://keycloak.example/realms/nebari",
        "sub": "abc-user-id",
        "aud": ["nebi-client", "account"],
        "azp": "jupyterhub-client",
        "exp": int((datetime.now(timezone.utc) + timedelta(minutes=5)).timestamp()),
        "preferred_username": "alice@example",
        "scope": "openid email groups profile",
    }
    return jwt.encode(payload, private_pem, algorithm="RS256")


# --- _get_jhub_token_from_jwt_token --------------------------------------


def test_decode_returns_inner_token_for_valid_wrapper(jhub_secret):
    """A valid HS256 wrapper JWT yields the inner access_token string."""
    from jhub_apps.service.auth import _get_jhub_token_from_jwt_token

    wrapper = _make_hs256_wrapper("hub-oauth-api-token-xyz", jhub_secret)
    assert _get_jhub_token_from_jwt_token(wrapper) == "hub-oauth-api-token-xyz"


def test_decode_returns_none_for_rs256_token(rsa_keypair):
    """An RS256 token (e.g. a Keycloak access token forwarded by Envoy
    Gateway with `forwardAccessToken: true`) is not a jhub-apps wrapper
    JWT.  The decoder should signal "not mine" by returning None instead
    of raising, so the caller can fall through to the cookie credential.
    """
    from jhub_apps.service.auth import _get_jhub_token_from_jwt_token

    private_pem, _ = rsa_keypair
    kc_token = _make_rs256_kc_token(private_pem)
    assert _get_jhub_token_from_jwt_token(kc_token) is None


def test_decode_returns_none_for_garbage_token():
    """A non-JWT string (random bearer) also returns None."""
    from jhub_apps.service.auth import _get_jhub_token_from_jwt_token

    assert _get_jhub_token_from_jwt_token("not-a-jwt-at-all") is None


def test_decode_returns_none_for_wrapper_signed_with_wrong_secret():
    """A wrapper JWT signed with the wrong HS256 secret is not ours."""
    from jhub_apps.service.auth import _get_jhub_token_from_jwt_token

    wrapper = _make_hs256_wrapper("inner", "some-other-secret")
    assert _get_jhub_token_from_jwt_token(wrapper) is None


# --- get_current_user dispatch ------------------------------------------


@pytest.fixture
def hub_env(monkeypatch):
    """Set the env vars get_client + access_scopes need."""
    monkeypatch.setenv("JUPYTERHUB_API_URL", "http://hub:8081/hub/api")
    monkeypatch.setenv("JUPYTERHUB_API_TOKEN", "service-token")
    monkeypatch.setenv("PUBLIC_HOST", "https://hub.example")
    monkeypatch.setenv(
        "JUPYTERHUB_OAUTH_SCOPES",
        '["access:services", "access:services!service=japps"]',
    )


def _patched_get_client(captured_headers):
    """Return a get_client() replacement whose AsyncClient records the
    Authorization header used for /user calls and returns a stub User.
    """
    import httpx

    def handler(request: httpx.Request) -> httpx.Response:
        # capture the auth header used for the upstream hub call
        captured_headers.append(request.headers.get("authorization"))
        if request.url.path.endswith("/user"):
            return httpx.Response(
                200,
                json={
                    "name": "alice@example",
                    "admin": False,
                    "groups": [],
                    "kind": "user",
                    "server": None,
                    "scopes": ["access:services"],
                },
            )
        return httpx.Response(404)

    transport = httpx.MockTransport(handler)

    def factory():
        return httpx.AsyncClient(transport=transport, base_url="http://hub")

    return factory


def test_get_current_user_uses_cookie_when_bearer_is_kc_token(
    hub_env, jhub_secret, rsa_keypair, monkeypatch
):
    """When Envoy injects an RS256 Keycloak token in Authorization: Bearer,
    get_current_user must fall through to the jhub-apps HS256 cookie and
    authenticate the user against the hub with the *cookie's* inner token,
    not the KC token (which the hub would reject)."""
    from jhub_apps.service import security

    private_pem, _ = rsa_keypair
    kc_bearer = _make_rs256_kc_token(private_pem)
    wrapper_cookie = _make_hs256_wrapper("hub-oauth-token-from-cookie", jhub_secret)

    captured = []
    monkeypatch.setattr(security, "get_client", _patched_get_client(captured))
    # is_jupyterhub_5() reads HUB env at import-time of HubClient; bypass it.
    monkeypatch.setattr(security, "is_jupyterhub_5", lambda: False)

    user = _run(
        security.get_current_user(
            auth_param=None,
            auth_header=kc_bearer,
            auth_cookie=wrapper_cookie,
        )
    )

    assert user.name == "alice@example"
    # The hub must have been called with the cookie's inner token, NOT the
    # KC RS256 token forwarded by Envoy.
    assert captured == ["Bearer hub-oauth-token-from-cookie"]


def test_get_current_user_uses_bearer_when_it_is_a_wrapper(
    hub_env, jhub_secret, monkeypatch
):
    """Existing behaviour: an HS256 wrapper in the Authorization Bearer
    header (e.g. a programmatic API client minting its own session) is the
    primary credential and is used directly."""
    from jhub_apps.service import security

    wrapper_bearer = _make_hs256_wrapper("hub-oauth-token-from-bearer", jhub_secret)
    other_cookie = _make_hs256_wrapper("hub-oauth-token-from-cookie", jhub_secret)

    captured = []
    monkeypatch.setattr(security, "get_client", _patched_get_client(captured))
    monkeypatch.setattr(security, "is_jupyterhub_5", lambda: False)

    user = _run(
        security.get_current_user(
            auth_param=None,
            auth_header=wrapper_bearer,
            auth_cookie=other_cookie,
        )
    )

    assert user.name == "alice@example"
    assert captured == ["Bearer hub-oauth-token-from-bearer"]


def test_get_current_user_401_when_kc_bearer_and_no_cookie(
    hub_env, jhub_secret, rsa_keypair, monkeypatch
):
    """RS256 Bearer with no fallback cookie/param leaves no usable credential.
    The endpoint must 401 (so the browser is redirected to /jhub-login)."""
    from fastapi import HTTPException
    from jhub_apps.service import security

    private_pem, _ = rsa_keypair
    kc_bearer = _make_rs256_kc_token(private_pem)
    captured = []
    monkeypatch.setattr(security, "get_client", _patched_get_client(captured))
    monkeypatch.setattr(security, "is_jupyterhub_5", lambda: False)

    with pytest.raises(HTTPException) as exc:
        _run(
            security.get_current_user(
                auth_param=None, auth_header=kc_bearer, auth_cookie=None
            )
        )
    assert exc.value.status_code == 401
    # Hub should not have been called — there was no token to call it with.
    assert captured == []
