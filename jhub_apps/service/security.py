import json
import os

from fastapi import HTTPException, Security, status
from fastapi.security import OAuth2AuthorizationCodeBearer, APIKeyCookie
from fastapi.security.api_key import APIKeyQuery

from jhub_apps.hub_client.hub_client import get_users_and_group_allowed_to_share_with, is_jupyterhub_5
from .auth import get_jhub_token_from_jwt_token
from .client import get_client
from .models import User

### Endpoints can require authentication using Depends(get_current_user)
### get_current_user will look for a token in url params or
### Authorization: bearer token (header).
### Hub technically supports cookie auth too, but it is deprecated so
### not being included here.
auth_by_param = APIKeyQuery(name="token", auto_error=False)

auth_by_cookie = APIKeyCookie(name="access_token")
auth_url = os.environ["PUBLIC_HOST"] + "/hub/api/oauth2/authorize"
auth_by_header = OAuth2AuthorizationCodeBearer(
    authorizationUrl=auth_url, tokenUrl="oauth_callback", auto_error=False
)
### ^^ The flow for OAuth2 in Swagger is that the "authorize" button
### will redirect user (browser) to "auth_url", which is the Hub login page.
### After logging in, the browser will POST to our internal /get_token endpoint
### with the auth code.  That endpoint POST's to Hub /oauth2/token with
### our client_secret (JUPYTERHUB_API_TOKEN) and that code to get an
### access_token, which it returns to browser, which places in Authorization header.

if os.environ.get("JUPYTERHUB_OAUTH_SCOPES"):
    # typically ["access:services", "access:services!service=$service_name"]
    access_scopes = json.loads(os.environ["JUPYTERHUB_OAUTH_SCOPES"])
else:
    access_scopes = ["access:services"]


### For consideration: optimize performance with a cache instead of
### always hitting the Hub api?
async def get_current_user(
    auth_param: str = Security(auth_by_param),
    auth_header: str = Security(auth_by_header),
    auth_cookie: str = Security(auth_by_cookie)
):
    token = auth_param or auth_header or auth_cookie
    if token is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Must login with token parameter or Authorization bearer header",
        )

    token = get_jhub_token_from_jwt_token(token)

    async with get_client() as client:
        endpoint = "/user"
        # normally we auth to Hub API with service api token,
        # but this time auth as the user token to get user model
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get(endpoint, headers=headers)
        if resp.is_error:
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                detail={
                    "msg": "Error getting user info from token",
                    "request_url": str(resp.request.url),
                    "token": token,
                    "response_code": resp.status_code,
                    "hub_response": resp.json(),
                },
            )
    user = User(**resp.json())
    if is_jupyterhub_5():
        user.share_permissions = get_users_and_group_allowed_to_share_with(user)
    if any(scope in user.scopes for scope in access_scopes):
        return user
    else:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail={
                "msg": f"User not authorized: {user.name}",
                "request_url": str(resp.request.url),
                "token": token,
                "user": resp.json(),
            },
        )
