import dataclasses
import os
import typing
from datetime import timedelta

import requests
import structlog
from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from fastapi.encoders import jsonable_encoder
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, ValidationError
from starlette.responses import RedirectResponse

from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.service.auth import create_access_token
from jhub_apps.service.client import get_client
from jhub_apps.service.models import (
    AuthorizationError,
    HubApiError,
    ServerCreation,
    User,
)
from jhub_apps.service.security import get_current_user
from jhub_apps.service.utils import (
    get_conda_envs,
    get_jupyterhub_config,
    get_spawner_profiles,
    get_thumbnail_data_url,
)
from jhub_apps.spawner.types import FRAMEWORKS
from jhub_apps.version import get_version

app = FastAPI()

logger = structlog.get_logger(__name__)
templates = Jinja2Templates(directory="jhub_apps/templates")

# Expires in 7 days
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# APIRouter prefix cannot end in /
service_prefix = os.getenv("JUPYTERHUB_SERVICE_PREFIX", "").rstrip("/")
router = APIRouter(prefix=service_prefix)

# TODO: Add response models for all endpoints


@router.get("/oauth_callback", include_in_schema=False)
async def get_token(code: str):
    "Callback function for OAuth2AuthorizationCodeBearer scheme"
    # The only thing we need in this form post is the code
    # Everything else we can hardcode / pull from env
    logger.info(f"Getting token for code {code}")
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
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": resp.json()}, expires_delta=access_token_expires
    )
    ### resp.json() is {'access_token': <token>, 'token_type': 'Bearer'}
    response = RedirectResponse(
        os.environ["PUBLIC_HOST"] + "/hub/home", status_code=302
    )
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return response


@router.get("/jhub-login", description="Login via OAuth2")
async def login(request: Request):
    logger.info("Logging in", request=request)
    authorization_url = (
        os.environ["PUBLIC_HOST"]
        + "/hub/api/oauth2/authorize?response_type=code&client_id=service-japps"
    )
    return RedirectResponse(authorization_url, status_code=302)


def get_all_shared_servers(hub_users, current_hub_user):
    all_servers = []
    for hub_user in hub_users:
        if hub_user["name"] != current_hub_user["name"]:
            hub_user_servers = list(hub_user["servers"].values())
            hub_user_servers_with_name = [
                {"username": hub_user["name"], **server} for server in hub_user_servers
            ]
            all_servers.extend(hub_user_servers_with_name)
    # Filter default servers
    return list(filter(lambda server: server["name"] != "", all_servers))


@router.get("/server/", description="Get all servers")
@router.get("/server/{server_name}", description="Get a server by server name")
async def get_server(user: User = Depends(get_current_user), server_name=None):
    """Get servers for the authenticated user"""
    hub_client = HubClient()
    users = hub_client.get_users()
    current_hub_user = None
    for hub_user in users:
        if hub_user["name"] == user.name:
            current_hub_user = hub_user
            break
    if not current_hub_user:
        raise HTTPException(
            detail=f"Hub user '{user.name}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    user_servers = current_hub_user["servers"]
    if server_name:
        # Get a particular server
        for s_name, server_details in user_servers.items():
            if s_name == server_name:
                return server_details
        raise HTTPException(
            detail=f"server '{server_name}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    else:
        # Get all servers
        return {
            "shared_apps": get_all_shared_servers(
                hub_users=users, current_hub_user=current_hub_user
            ),
            "user_apps": list(user_servers.values()),
        }


class Checker:
    def __init__(self, model: BaseModel):
        self.model = model

    def __call__(self, data: str = Form(...)):
        try:
            return self.model.model_validate_json(data)
        except ValidationError as e:
            raise HTTPException(
                detail=jsonable_encoder(e.errors()),
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )


@router.post("/server")
async def create_server(
    server: ServerCreation = Depends(Checker(ServerCreation)),
    thumbnail: typing.Optional[UploadFile] = File(None),
    user: User = Depends(get_current_user),
):
    logger.info("Creating server", server_name=server.servername, user=user.name)
    server.user_options.thumbnail = await get_thumbnail_data_url(
        framework_name=server.user_options.framework, thumbnail=thumbnail
    )
    hub_client = HubClient()
    return hub_client.create_server(
        username=user.name,
        servername=server.servername,
        user_options=server.user_options,
    )


@router.post("/server/")
@router.post("/server/{server_name}")
async def start_server(
    server_name=None,
    user: User = Depends(get_current_user),
):
    """Start an already existing server."""
    logger.info("Starting server", server_name=server_name, user=user.name)
    hub_client = HubClient()
    try:
        response = hub_client.start_server(
            username=user.name,
            servername=server_name,
        )
    except requests.exceptions.HTTPError as e:
        raise HTTPException(
            detail=f"Probably server '{server_name}' is already running: {e}",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    if response is None:
        raise HTTPException(
            detail=f"server '{server_name}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    return response


@router.put("/server/{server_name}")
async def update_server(
    server: ServerCreation = Depends(Checker(ServerCreation)),
    thumbnail: typing.Optional[UploadFile] = File(None),
    thumbnail_data_url: typing.Optional[str] = Form(None),
    user: User = Depends(get_current_user),
    server_name=None,
):
    if thumbnail_data_url:
        server.user_options.thumbnail = thumbnail_data_url
    else:
        server.user_options.thumbnail = await get_thumbnail_data_url(
            framework_name=server.user_options.framework, thumbnail=thumbnail
        )
    hub_client = HubClient()
    logger.info("Updating server", server_name=server.servername, user=user.name)
    edit_server_response = hub_client.edit_server(
        username=user.name,
        servername=server_name,
        user_options=server.user_options,
    )
    logger.info(f"Edit server response: {edit_server_response}")
    return edit_server_response


@router.delete("/server/{server_name}")
@router.delete("/server/")
async def delete_server(
    user: User = Depends(get_current_user),
    server_name=None,
    remove: bool = False,
):
    """Delete or stop server. Delete if remove is True otherwise stop the server"""
    hub_client = HubClient()
    logger.info("Deleting server", server_name=server_name, user=user.name)
    return hub_client.delete_server(user.name, server_name=server_name, remove=remove)


@router.get(
    "/user",
    response_model=User,
    responses={401: {"model": AuthorizationError}, 400: {"model": HubApiError}},
)
async def me(user: User = Depends(get_current_user)):
    """Authenticated function that returns the User model"""
    return user


@router.get("/frameworks/", description="Get all frameworks")
async def get_frameworks(user: User = Depends(get_current_user)):
    logger.info("Getting all the frameworks")
    frameworks = []
    for framework in FRAMEWORKS:
        frameworks.append(dataclasses.asdict(framework))
    return frameworks


@router.get("/conda-environments/", description="Get all conda environments")
async def conda_environments(user: User = Depends(get_current_user)):
    logger.info("Getting conda environments", user=user.name)
    config = get_jupyterhub_config()
    hclient = HubClient()
    user_from_service = hclient.get_user(user.name)
    conda_envs = get_conda_envs(config, user_from_service)
    logger.info(f"Found conda environments: {conda_envs}")
    return conda_envs


@router.get("/spawner-profiles/", description="Get all spawner profiles")
async def spawner_profiles(user: User = Depends(get_current_user)):
    hclient = HubClient()
    user_from_service = hclient.get_user(user.name)
    auth_state = user_from_service.get("auth_state")
    logger.info("Getting spawner profiles", user=user.name)
    config = get_jupyterhub_config()
    spawner_profiles_ = await get_spawner_profiles(config, auth_state=auth_state)
    logger.debug(f"Loaded spawner profiles: {spawner_profiles_}")
    return spawner_profiles_


@router.get("/services/", description="Get all services")
async def hub_services(user: User = Depends(get_current_user)):
    logger.info(f"Getting hub services for user: {user}")
    hub_client = HubClient()
    return hub_client.get_services()


@router.get("/")
@router.get("/status")
async def status_endpoint():
    """Check API Status"""
    version = get_version()
    return {"status": "ok", "version": str(version)}
