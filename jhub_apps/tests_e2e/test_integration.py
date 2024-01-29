import re
import time

from playwright.sync_api import Page, Playwright, expect

BASE_URL = "http://127.0.0.1:8000"


def test_jupyterhub_loading(page: Page):
    page.goto(BASE_URL)
    expect(page).to_have_title(re.compile("Welcome to Nebari"))


def test_panel_app_creation(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
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
