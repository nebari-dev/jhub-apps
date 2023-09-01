import re
from playwright.sync_api import Page, expect

BASE_URL = "http://127.0.0.1:8000"


def test_basic(page: Page):
    page.goto(BASE_URL)
    expect(page).to_have_title(re.compile("JupyterHub"))
