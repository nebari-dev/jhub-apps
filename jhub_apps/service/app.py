import logging
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .routes import router

### When managed by Jupyterhub, the actual endpoints
### will be served out prefixed by /services/:name.
### One way to handle this with FastAPI is to use an APIRouter.
### All routes are defined in service.py

STATIC_DIR = Path(__file__).parent.parent / "static"


def setup_logging():
    # TODO: Use structlog
    logging_format = (
        "%(asctime)s %(levelname)9s %(lineno)4s %(module)s: %(message)s"
    )
    logging.basicConfig(
        level=logging.INFO, format=logging_format
    )


app = FastAPI(
    title="JApps Service",
    version="0.1",
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
)
static_files = StaticFiles(directory=STATIC_DIR)
app.mount(f"{router.prefix}/static", static_files, name="static")
app.include_router(router)
setup_logging()
