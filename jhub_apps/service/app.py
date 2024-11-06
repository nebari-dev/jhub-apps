from contextlib import asynccontextmanager
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.service.japps_routes import router as japps_router
from jhub_apps.service.logging_utils import setup_logging
from jhub_apps.service.middlewares import create_middlewares
from jhub_apps.service.models import UserOptions
from jhub_apps.service.routes import router
from jhub_apps.version import get_version

### When managed by Jupyterhub, the actual endpoints
### will be served out prefixed by /services/:name.
### One way to handle this with FastAPI is to use an APIRouter.
### All routes are defined in routes.py

STATIC_DIR = Path(__file__).parent.parent / "static"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # TODO: Not sure how to get access to c.JAppsConfig.startup_apps here
    user_options_dict = {'display_name': 'My Startup App', 'description': 'description', 'thumbnail': 'data:image/jpeg;base64,Y29udGVudHMgb2YgdGh1bWJuYWls', 'filepath': '', 'framework': 'panel', 'custom_command': '', 'public': False, 'keep_alive': False, 'env': {'ENV_VAR_KEY_1': 'ENV_VAR_KEY_1', 'ENV_VAR_KEY_2': 'ENV_VAR_KEY_2'}, 'repository': None, 'jhub_app': True, 'conda_env': '', 'profile': '', 'share_with': {'users': ['alice', 'john'], 'groups': ['alpha', 'beta']}}
    instantiate_startup_apps(user_options_dict, 'admin')
    
    yield

def instantiate_startup_apps(user_options_dict, username):
        # instantiate custom apps
        user_options = UserOptions(**user_options_dict)
        hub_client = HubClient(username=username)
        hub_client.create_server(
            username=username,
            servername='my-startup-server',
            user_options=user_options,
        )

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
