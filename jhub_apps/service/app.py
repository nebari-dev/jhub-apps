from contextlib import asynccontextmanager
import json
import os
from pathlib import Path
import pprint
from itertools import groupby
from operator import itemgetter

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from typing import Any

from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.service.japps_routes import router as japps_router
from jhub_apps.service.logging_utils import setup_logging
from jhub_apps.service.middlewares import create_middlewares
from jhub_apps.service.models import UserOptions
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
    user_options_list = config['JAppsConfig']['startup_apps']
    # group user options by username
    
    grouped_user_options_list = groupby(user_options_list, itemgetter('username'))
    for username, user_options_list in grouped_user_options_list:
        instantiate_startup_apps(user_options_list, username=username)
    
    yield

def instantiate_startup_apps(server_creation_list: list[dict[str, Any]], username: str):
        hub_client = HubClient(username=username)
        
        existing_servers = hub_client.get_server(username=username)
        
        for server_creation_dict in server_creation_list:
            user_options = UserOptions(**server_creation_dict)
            servername = server_creation_dict['servername']
            if server_creation_dict['servername'] in existing_servers:
                # update the server
                logger.info(f"{'='*50}Updating server: {server_creation_dict['servername']}")
                hub_client.edit_server(username, servername, user_options)
            else:
                # create the server
                logger.info(f"{'='*50}Instantiating app with user_options: {pprint.pformat(server_creation_dict)}")  # TODO: Remove
                # user_options = UserOptions(**server_creation_dict)
                
                hub_client.create_server(
                    username=username,
                    servername=servername,
                    user_options=user_options,
                )        
        logger.info('Done instantiating apps')

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
