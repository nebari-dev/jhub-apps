import structlog
import os
import typing
from datetime import timedelta, datetime

import jwt

logger = structlog.get_logger(__name__)


def _create_access_token(data: dict, expires_delta: typing.Optional[timedelta] = None):
    logger.info("Creating access token")
    to_encode = {"access_token_data": data.get("sub", data)}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    secret_key = os.environ["JHUB_APP_JWT_SECRET_KEY"]
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm="HS256")
    return encoded_jwt


def _get_jhub_token_from_jwt_token(token):
    """Unwrap a jhub-apps HS256 wrapper JWT and return the inner Hub OAuth token.

    Returns None when ``token`` is not a jhub-apps wrapper — for example when
    Envoy Gateway forwards a Keycloak RS256 access token via
    ``forwardAccessToken: true`` and that token lands in the same
    ``Authorization: Bearer …`` header.  Returning None lets callers fall
    through to the next credential source instead of failing the request.
    """
    logger.info("Trying to get JHub Apps token from JWT Token")
    try:
        payload = jwt.decode(token, os.environ["JHUB_APP_JWT_SECRET_KEY"], algorithms=["HS256"])
    except jwt.PyJWTError as e:
        logger.debug("Token is not a jhub-apps HS256 wrapper: %s", e)
        return None
    access_token_data = payload.get("access_token_data")
    if not isinstance(access_token_data, dict) or "access_token" not in access_token_data:
        logger.debug("HS256-decoded payload missing access_token_data.access_token")
        return None
    logger.info("Fetched access token from JWT Token")
    return access_token_data["access_token"]
