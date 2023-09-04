import pytest
import re
import time

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


@pytest.mark.parametrize("framework,", ["Panel"])
def test_panel_dashboard_creation(page: Page, framework):
    url = f"{BASE_URL}/services/japps/"
    page.goto(url)
    _fill_username_password(page)
    # Fill the Create App Form
    page.fill("text=Name >> xpath=../..//input", "panel-example")
    page.fill("text=Filepath >> xpath=../..//input", "")
    page.fill("text=Description >> xpath=../..//textarea", "A sample panel dashboard")
    page.select_option("text=Framework >> xpath=../..//select", framework)
    # Wait for a couple of seconds so that panel can read form input
    time.sleep(2)
    # Click on Create Dashboard
    page.click(".bk-btn.bk-btn-primary")
    # Wait for the dashboard to be created
    time.sleep(10)
    # Click on View Dashboard
    page.click("text=View")
    expect(page).to_have_title(re.compile("Panel Test App"))
