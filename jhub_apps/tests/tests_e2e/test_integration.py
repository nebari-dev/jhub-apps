import re
import uuid

import pytest # type: ignore
import structlog # type: ignore
from playwright.sync_api import Playwright, expect # type: ignore

from jhub_apps.hub_client.utils import is_jupyterhub_5
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


@pytest.mark.parametrize(
    ("with_server_options", ), [
        pytest.param(True, marks=pytest.mark.with_server_options),
        pytest.param(False),
    ]
)
def test_panel_app_creation(playwright: Playwright, with_server_options) -> None:
    browser, context, page = get_page(playwright)
    framework = Framework.panel.value
    app_suffix = uuid.uuid4().hex[:6]
    # for searching app with unique name in the UI
    app_name = f"{framework} app {app_suffix}"
    try:
        page.goto(BASE_URL)
        share_with_user = f"admin-{uuid.uuid4().hex[:6]}"
        create_users(page, users=[share_with_user])
        page.goto(BASE_URL)
        sign_in_and_authorize(page, username=f"admin-{app_suffix}", password="password")
        create_app(
            app_name, page, with_server_options, share_with_users=[share_with_user]
        )
        assert_working_panel_app(page)
        app_url = page.url
        logger.info(f"Access panel app from shared user: {share_with_user}: {app_url}")
        page.goto(BASE_URL)
        sign_out(page)
        sign_in_and_authorize(page, username=share_with_user, password="password")
        page.goto(app_url)
        if is_jupyterhub_5():
            logger.info("Click Authorize button for accessing the shared app")
            page.get_by_role("button", name="Authorize").click()
            assert_working_panel_app(page)
    except Exception as e:
        # So that we save the video, before we exit
        context.close()
        browser.close()
        raise e


def assert_working_panel_app(page):
    wait_for_element_in_app = "div.bk-slider-title >> text=Slider:"
    slider_text_element = page.wait_for_selector(wait_for_element_in_app)
    assert slider_text_element is not None, "Slider text element not found!"
    logger.info("Checking page title")
    app_page_title = "Panel Test App"
    expect(page).to_have_title(re.compile(app_page_title))


def create_app(
        app_name,
        page,
        with_server_options=True,
        share_with_users=None,
        share_with_groups=None,
):
    logger.info("Creating App")
    deploy_button = page.get_by_role("button", name="Deploy App")
    expect(deploy_button).to_be_visible()
    deploy_button.click()
    logger.info("Fill App display Name")
    display_name_field = page.get_by_label("*Name")
    expect(display_name_field).to_be_visible()
    display_name_field.click()
    display_name_field.fill(app_name)
    logger.info("Select Framework")
    page.locator("id=framework").click()
    page.get_by_role("option", name="Panel").click()
    if is_jupyterhub_5():
        select_share_options(page, users=share_with_users, groups=share_with_groups)
    if with_server_options:
        next_page_locator = page.locator("id=submit-btn")
        logger.info("Select Next Page for Server options")
        expect(next_page_locator).to_be_visible()
        next_page_locator.click()
        assert page.url.endswith('server-types')
        small_instance_radio_button = page.get_by_label("Small Instance")
        logger.info("Expect Small Instance to be visible")
        expect(small_instance_radio_button).to_be_visible()
        small_instance_radio_button.check()
    create_app_locator = page.get_by_role("button", name="Deploy App")
    logger.info("Expect Deploy App button to be visible")
    expect(create_app_locator).to_be_visible()
    logger.info("Click Deploy App")
    create_app_locator.click()


def select_share_options(page, users=None, groups=None):
    logger.info("Selecting share form")
    share_locator = page.locator("id=share-permissions-autocomplete")
    expect(share_locator).to_be_visible()

    users = users or []
    groups = groups or []
    for user in users:
        logger.info(f"Fill user: {user} in share")
        share_locator.fill(user)
        logger.info(f"Select user: {user} in share")
        page.get_by_role("option", name=user).click()

    for group in groups:
        logger.info(f"Fill group: {group} in share")
        share_locator.fill(group)
        logger.info(f"Select group: {group} in share")
        page.get_by_role("option", name=f"{group} (Group)").click()
    page.get_by_role("button", name="Share").click()


def create_users(page, users):
    """Create users by logging in"""
    for user in users:
        sign_in_and_authorize(page, user, password="password")
        sign_out(page)


def sign_in_and_authorize(page, username, password):
    logger.info("Signing in")
    page.get_by_label("Username:").click()
    page.get_by_label("Username:").fill(username)
    page.get_by_label("Password:").fill(password)
    logger.info("Pressing Sign in button")
    page.get_by_role("button", name="Sign in").click()


def sign_out(page):
    logger.info("Click on profile menu")
    profile_top_corner_locator = page.locator("id=profile-menu-btn")
    expect(profile_top_corner_locator).to_be_visible()
    profile_top_corner_locator.click()
    logger.info("Click on Logout button")
    logout_button = page.get_by_role("menuitem").filter(has_text="Logout")
    expect(logout_button).to_be_visible()
    logout_button.click()
    logger.info("Logged out")
