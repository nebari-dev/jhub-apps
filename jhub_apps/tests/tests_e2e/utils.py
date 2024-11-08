import time

import pytest
import requests

from jhub_apps.hub_client.utils import is_jupyterhub_5
from jhub_apps.service.models import ServerCreation, UserOptions
from jhub_apps.tests.common import constants
from jhub_apps.tests.common.constants import JHUB_APPS_API_BASE_URL


def get_jhub_apps_session(username=None):
    """Get jhub-apps session with authenticated cookies to be able to call jhub-apps API"""
    session = requests.Session()
    session.cookies.clear()
    if username:
        # Since we're using jupyterhub.auth.DummyAuthenticator,
        # any pair of username/password will work fine.
        login_username = username
        login_password = username
    else:
        login_username = constants.JUPYTERHUB_USERNAME
        login_password = constants.JUPYTERHUB_PASSWORD
    try:
        response = session.get(
            f"http://{constants.JUPYTERHUB_HOSTNAME}/hub/login", verify=False
        )
        response.raise_for_status()
        auth_data = {
            "_xsrf": session.cookies['_xsrf'],
            "username": login_username,
            "password": login_password,
        }
        response = session.post(
            f"http://{constants.JUPYTERHUB_HOSTNAME}/hub/login?next=",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data=auth_data,
            verify=False,
        )
        response.raise_for_status()

    except requests.RequestException as e:
        raise ValueError(f"An error occurred during authentication: {e}")

    response_login = session.get(
        f"http://{constants.JUPYTERHUB_HOSTNAME}/services/japps/jhub-login",
    )
    response_login.raise_for_status()
    response_user = session.get(
        f"http://{constants.JUPYTERHUB_HOSTNAME}/services/japps/user",
        verify=False
    )
    response_user.raise_for_status()
    return session


def fetch_url_until_title_found(
        session, url, expected_title, timeout=10, interval=2
):
    """Fetches url until the expected title is found."""
    start_time = time.time()
    while True:
        try:
            response = session.get(url)
            assert response.status_code == 200
            if expected_title in str(response.content):
                return
        except (requests.RequestException, ValueError, AssertionError) as e:
            time_elapsed = time.time() - start_time
            if time_elapsed > timeout:
                raise TimeoutError(f"Failed to get the title {expected_title} within {timeout} seconds") from e
            time.sleep(interval)


def skip_if_jupyterhub_less_than_5():
    """Skip test if JupyterHub < 5"""
    return pytest.mark.skipif(not is_jupyterhub_5(), reason="Skipping test because JupyterHub<5")


def create_server(user_session: requests.Session, user_options: UserOptions) -> str:
    """Create server from given user's session and user options"""
    server_data = ServerCreation(
        servername="test server sharing",
        user_options=user_options
    )
    data = {"data": server_data.model_dump_json()}
    response = user_session.post(
        f"{JHUB_APPS_API_BASE_URL}/server",
        verify=False,
        data=data,
    )
    assert response.status_code == 200
    server_name = response.json()[-1]
    return server_name


def stop_server(user_session: requests.Session, server_name: str) -> requests.Response:
    """Stop the given server's name via given user's session."""
    response = user_session.delete(
        f"{JHUB_APPS_API_BASE_URL}/server/{server_name}",
        verify=False,
    )
    return response


def start_server(user_session: requests.Session, server_name: str) -> requests.Response:
    """Start the given server via given user's session."""
    response = user_session.post(
        f"{JHUB_APPS_API_BASE_URL}/server/{server_name}",
        verify=False,
    )
    return response
