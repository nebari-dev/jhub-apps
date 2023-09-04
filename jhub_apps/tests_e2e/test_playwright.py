import re
from playwright.sync_api import Page, expect

BASE_URL = "http://127.0.0.1:8000"


def test_jupyterhub_loading(page: Page):
    page.goto(BASE_URL)
    expect(page).to_have_title(re.compile("JupyterHub"))


def _fill_username_password(page: Page):
    # Fill username and password
    page.locator("input#username_input").fill("admin")
    page.locator("input#password_input").fill("admin")
    # Submit, then login
    page.locator("input#login_submit").click()
    # Click on Authorize service
    button = page.query_selector(".btn-jupyter")
    if button:
        page.click(".btn-jupyter")


def test_japps_service(page: Page):
    url = f"{BASE_URL}/services/japps/"
    page.goto(url)
    _fill_username_password(page)
    expect(page).to_have_title(re.compile("JupyterHub Apps"))
