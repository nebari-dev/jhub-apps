import re
import time

from playwright.sync_api import Playwright, expect

BASE_URL = "http://127.0.0.1:8000"


def get_page(playwright: Playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        record_video_dir="videos/",
        record_video_size={"width": 1920, "height": 1080}
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
    page.goto(BASE_URL)
    print("Signing in")
    page.get_by_label("Username:").click()
    page.get_by_label("Username:").fill("admin")
    page.get_by_label("Password:").fill("admin")
    page.get_by_role("button", name="Sign in").click()
    page.get_by_role("button", name="Authorize").click()
    print("Creating App")
    page.get_by_role("button", name="Create App").click()
    page.get_by_label("Display Name *").click()
    page.get_by_label("Display Name *").fill("panel app")
    page.get_by_label("Framework *").select_option("panel")
    page.get_by_role("button", name="Submit").click()
    time.sleep(2)
    print("Checking out the created panel app")
    page.goto(BASE_URL)
    page.get_by_role("link", name="panel app").click()
    expect(page).to_have_title(re.compile("Panel Test App"))
    time.sleep(2)
    # ---------------------
    context.close()
    browser.close()
