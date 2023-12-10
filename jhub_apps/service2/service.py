import os

from fastapi import APIRouter, Depends, Form, status

from .client import get_client
from .models import AuthorizationError, HubApiError, User, ServerCreation
from .security import get_current_user

from bokeh.embed import server_document
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates

from ..hub_client.hub_client import HubClient

app = FastAPI()

templates = Jinja2Templates(directory="jhub_apps/templates")

# APIRouter prefix cannot end in /
service_prefix = os.getenv("JUPYTERHUB_SERVICE_PREFIX", "").rstrip("/")
router = APIRouter(prefix=service_prefix)


@router.post("/get_token", include_in_schema=False)
async def get_token(code: str = Form(...)):
    "Callback function for OAuth2AuthorizationCodeBearer scheme"
    # The only thing we need in this form post is the code
    # Everything else we can hardcode / pull from env
    async with get_client() as client:
        redirect_uri = (
            os.environ["PUBLIC_HOST"] + os.environ["JUPYTERHUB_OAUTH_CALLBACK_URL"],
        )
        data = {
            "client_id": os.environ["JUPYTERHUB_CLIENT_ID"],
            "client_secret": os.environ["JUPYTERHUB_API_TOKEN"],
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
        }
        resp = await client.post("/oauth2/token", data=data)
    ### resp.json() is {'access_token': <token>, 'token_type': 'Bearer'}
    return resp.json()


@router.get("/")
@router.get("/{subpath}")
async def index(
        request: Request,
        user: User = Depends(get_current_user),
        subpath=None
):
    request_args = dict(request.query_params)
    script = server_document(
        f"/services/launcher/{subpath}",
        arguments={"username": user.name, **request_args},
    )
    return templates.TemplateResponse(
        "launcher_base.html",
        {
            "request": request,
            "script": script,
            "jhub_api_title": os.environ.get("JHUB_APP_TITLE"),
            "jhub_api_icon": os.environ.get("JHUB_APP_ICON"),
        }
    )

@router.get("/server/{server_name}")
async def get_server(
        user: User = Depends(get_current_user),
        server_name=None
):
    hub_client = HubClient()
    user = hub_client.get_user(user.name)
    assert user
    user_servers = user["servers"]
    for s_name, server_details in user_servers.items():
        if s_name == server_name:
            return server_details
    return status.HTTP_404_NOT_FOUND


@router.post("/server/")
async def create_server(
        # request: Request,
        server: ServerCreation,
        user: User = Depends(get_current_user),
):
    hub_client = HubClient()
    return hub_client.create_server(
        username=user.name,
        servername=server.servername,
        user_options=server.user_options,
    )

@router.put("/server/{server_name}")
async def update_server(
        server: ServerCreation,
        user: User = Depends(get_current_user),
        server_name=None
):
    hub_client = HubClient()
    return hub_client.create_server(
        username=user.name,
        servername=server_name,
        edit=True,
        user_options=server.user_options,
    )


@router.delete("/server/{server_name}")
async def delete_server(
        user: User = Depends(get_current_user),
        server_name=None
):
    hub_client = HubClient()
    return hub_client.delete_server(
        user.name,
        server_name=server_name,
    )


# response_model and responses dict translate to OpenAPI (Swagger) hints
# compare and contrast what the /me endpoint looks like in Swagger vs /debug
@router.get(
    "/me",
    response_model=User,
    responses={401: {"model": AuthorizationError}, 400: {"model": HubApiError}},
)
async def me(user: User = Depends(get_current_user)):
    "Authenticated function that returns the User model"
    return user


@router.get("/debug")
async def debug(request: Request, user: User = Depends(get_current_user)):
    """
    Authenticated function that returns a few pieces of debug
     * Environ of the service process
     * Request headers
     * User model
    """
    return {
        "env": dict(os.environ),
        "headers": dict(request.headers),
        "user": user,
    }
