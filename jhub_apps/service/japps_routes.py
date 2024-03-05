from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

app = FastAPI()
templates = Jinja2Templates(directory="jhub_apps/templates")
router = APIRouter(prefix="/services/japps")


@router.get("/create-app", response_class=HTMLResponse)
@router.get("/edit-app", response_class=HTMLResponse)
@router.get("/server-types", response_class=HTMLResponse)
async def handle_apps(request: Request):
    return templates.TemplateResponse("japps_home.html", {"request": request})
