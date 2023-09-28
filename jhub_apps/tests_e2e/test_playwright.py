import pytest
import re
import time

from playwright.sync_api import Page, expect

from jhub_apps.spawner.types import Framework

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


@pytest.mark.parametrize(
    "framework,expected_title",
    [
        (Framework.panel.value, "Panel Test App"),
        (Framework.bokeh.value, "Hello World"),
        (Framework.streamlit.value, "streamlit_app · Streamlit"),
        (Framework.plotlydash.value, "Dash"),
        (Framework.voila.value, "voila_basic"),
        (Framework.gradio.value, "Gradio"),
        (Framework.jupyterlab.value, ".*JupyterLab"),
    ],
)
def test_panel_dashboard_creation(page: Page, framework, expected_title):
    url = f"{BASE_URL}/services/japps/create-app"
    page.goto(url)
    _fill_username_password(page)
    # Fill the Create App Form
    page.fill("text=Name >> xpath=../..//input", f"{framework}-example")
    page.fill("text=Filepath >> xpath=../..//input", "")
    page.fill(
        "text=Description >> xpath=../..//textarea", f"A sample {framework} dashboard"
    )
    page.select_option("text=Framework >> xpath=../..//select", framework)
    # Wait for a couple of seconds so that panel can read form input
    time.sleep(2)
    # Click on Create Dashboard
    page.get_by_role("button", name="Create App").click()
    # Wait for the dashboard to be created
    time.sleep(5)
    app_page_url = f"{BASE_URL}/services/japps/"
    page.goto(app_page_url)

    with page.expect_popup() as framework_page_info:
        page.get_by_role("button", name="Launch").click()
    framework_page = framework_page_info.value

    try:
        expect(framework_page).to_have_title(re.compile(expected_title))
    except AssertionError as e:
        # Go back to japps page
        page.goto(url)
        # Delete Dashboard
        page.click("text=Delete")
        raise e

    # Delete dashboard anyways
    # Go back to japps page
    page.goto(app_page_url)
    # Delete Dashboard
    page.click("text=Delete")
