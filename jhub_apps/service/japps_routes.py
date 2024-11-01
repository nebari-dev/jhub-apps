from datetime import datetime, timezone

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from jhub_apps import TEMPLATE_PATH, themes
from jhub_apps.service.utils import get_jupyterhub_config, get_theme

app = FastAPI()

templates = Jinja2Templates(directory=TEMPLATE_PATH)
router = APIRouter(prefix="/services/japps")


@router.get("/create-app", response_class=HTMLResponse)
@router.get("/edit-app", response_class=HTMLResponse)
@router.get("/server-types", response_class=HTMLResponse)
@router.get("/success", response_class=HTMLResponse)
async def handle_apps(request: Request):
    now = datetime.now(timezone.utc)
    config = get_jupyterhub_config()
    theme = get_theme(config)
    if not theme:
        theme = themes.DEFAULT_THEME
    return templates.TemplateResponse(
        "japps_custom.html",
        {
            "request": request,
            "version_hash": now.strftime("%Y%m%d%H%M%S"),
            "hub_title": config.get("hub_title", "JupyterHub"),
            "favicon": theme.get("favicon", "/service/japps/static/favicon.ico"),
            **theme,
        },
    )
