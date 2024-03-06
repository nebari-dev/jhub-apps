import re
import uuid

import structlog
from playwright.sync_api import Playwright, expect

from jhub_apps.spawner.types import Framework

BASE_URL = "http://127.0.0.1:8000"
logger = structlog.get_logger(__name__)


def get_page(playwright: Playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        record_video_dir="videos/",
        record_video_size={"width": 1920, "height": 1080},
        viewport={"width": 1920, "height": 1080},
        ignore_https_errors=True,
    )
    page = context.new_page()
    return browser, context, page


def test_jupyterhub_loading(playwright: Playwright):
    browser, context, page = get_page(playwright)
    page.goto(BASE_URL)
    expect(page).to_have_title(re.compile("Welcome to Nebari"))
    context.close()


def test_panel_app_creation(playwright: Playwright) -> None:
    browser, context, page = get_page(playwright)
    framework = Framework.panel.value
    app_suffix = uuid.uuid4().hex[:6]
    # for searching app with unique name in the UI
    app_name = f"{framework} app {app_suffix}"
    app_page_title = "Panel Test App"
    wait_for_element_in_app = "div.bk-slider-title >> text=Slider:"
    try:
        page.goto(BASE_URL)
        logger.info("Signing in")
        page.get_by_label("Username:").click()
        page.get_by_label("Username:").fill(f"admin-{app_suffix}")
        page.get_by_label("Password:").fill("admin")
        logger.info("Pressing Sign in button")
        page.get_by_role("button", name="Sign in").click()
        logger.info("Click Authorize button")
        page.get_by_role("button", name="Authorize").click()
        logger.info("Creating App")
        page.get_by_role("button", name="Create App").click()
        logger.info("Fill App display Name")
        page.get_by_label("Name *").click()
        page.get_by_label("Name *").fill(app_name)
        logger.info("Select Framework")
        page.locator("id=framework").click()
        page.get_by_role("option", name="Panel").click()
        logger.info("Click Submit")
        page.get_by_role("button", name="Create App").click()
        slider_text_element = page.wait_for_selector(wait_for_element_in_app)
        assert slider_text_element is not None, "Slider text element not found!"
        logger.info("Checking page title")
        expect(page).to_have_title(re.compile(app_page_title))
    except Exception as e:
        # So that we save the video, before we exit
        context.close()
        browser.close()
        raise e
