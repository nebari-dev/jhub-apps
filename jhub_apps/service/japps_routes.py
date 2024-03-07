from datetime import datetime

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from jhub_apps import TEMPLATE_PATH

app = FastAPI()

templates = Jinja2Templates(directory=TEMPLATE_PATH)
router = APIRouter(prefix="/services/japps")


@router.get("/create-app", response_class=HTMLResponse)
@router.get("/edit-app", response_class=HTMLResponse)
@router.get("/server-types", response_class=HTMLResponse)
async def handle_apps(request: Request):
    now = datetime.now()
    return templates.TemplateResponse(
        "japps_home.html",
        {"request": request, "version_hash": now.strftime("%Y%m%d%H%M%S")},
    )
