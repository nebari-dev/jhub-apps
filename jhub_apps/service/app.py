import asyncio
from contextlib import asynccontextmanager
import os
from pathlib import Path
from itertools import groupby

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from typing import Any
from filelock import FileLock, Timeout

from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.service.japps_routes import router as japps_router
from jhub_apps.service.logging_utils import setup_logging
from jhub_apps.service.middlewares import create_middlewares
from jhub_apps.service.models import StartupApp
from jhub_apps.service.routes import router
from jhub_apps.service.utils import get_jupyterhub_config
from jhub_apps.version import get_version
import structlog

logger = structlog.get_logger(__name__)

### When managed by Jupyterhub, the actual endpoints
### will be served out prefixed by /services/:name.
### One way to handle this with FastAPI is to use an APIRouter.
### All routes are defined in routes.py

STATIC_DIR = Path(__file__).parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    config = get_jupyterhub_config()

    # Have 1 uvicorn worker start the Startup Apps
    lock_path = os.environ["JHUB_APP_LOCK_FILE"]

    lock = FileLock(lock_path)
    try:
        # raises Timeout if lock is not acquired
        lock.acquire(blocking=False)

        startup_apps_list = config.JAppsConfig.startup_apps

        # group user options by username
        grouped_user_options_list = groupby(startup_apps_list, lambda x: x.username)
        for username, user_apps_list in grouped_user_options_list:
            asyncio.create_task(
                instantiate_startup_apps(
                    user_apps_list=list(user_apps_list), username=username,
                )
            )
    except Timeout:
        pass
    
    yield    
    # release the lock on shutdown
    FileLock(lock_path).release()


async def instantiate_startup_apps(
    user_apps_list: list[StartupApp], username: str,
):
    # Let FastAPI continue to set up
    await asyncio.sleep(1)

    hub_client = HubClient(username=username)
    existing_servers = hub_client.get_server(username=username)
    for startup_app in user_apps_list:
        user_options = startup_app.user_options
        normalized_servername = startup_app.normalized_servername

        # delete server if it exists
        while normalized_servername in existing_servers:
            logger.info(f"Deleting server {normalized_servername}")
            status_code = hub_client.delete_server(
                username, normalized_servername, remove=True
            )
            await asyncio.sleep(1)
            existing_servers = hub_client.get_server(username=username)

        # create the server
        logger.info(f"Creating server {normalized_servername}")
        while normalized_servername not in existing_servers:
            status_code, servername = hub_client.create_server(
                username=username,
                servername=normalized_servername,
                user_options=user_options,
            )
            await asyncio.sleep(1)
            existing_servers = hub_client.get_server(username=username)

        # turn off the server
        logger.info(f"Stopping server {normalized_servername}")
        while not existing_servers[normalized_servername]["stopped"]:
            status_code = hub_client.delete_server(
                username, normalized_servername, remove=False
            )
            if status_code == 204:
                # server stopped successfully
                break
            await asyncio.sleep(1)
            existing_servers = hub_client.get_server(username=username)
    logger.info("Done instantiating apps")


app = FastAPI(
    title="JApps Service",
    version=str(get_version()),
    ### Serve out Swagger from the service prefix (<hub>/services/:name/docs)
    openapi_url=router.prefix + "/openapi.json",
    docs_url=router.prefix + "/docs",
    redoc_url=router.prefix + "/redoc",
    ### Add our service client id to the /docs Authorize form automatically
    swagger_ui_init_oauth={"clientId": os.environ["JUPYTERHUB_CLIENT_ID"]},
    swagger_ui_parameters={"persistAuthorization": True},
    ### Default /docs/oauth2 redirect will cause Hub
    ### to raise oauth2 redirect uri mismatch errors
    # swagger_ui_oauth2_redirect_url=os.environ["JUPYTERHUB_OAUTH_CALLBACK_URL"],
    lifespan=lifespan,
)
static_files = StaticFiles(directory=STATIC_DIR)
app.mount(f"{router.prefix}/static", static_files, name="static")
app.include_router(router)
app.include_router(japps_router)
create_middlewares(app)
setup_logging()
