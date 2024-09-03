import time

import requests

from jhub_apps.tests.common.constants import JUPYTERHUB_HOSTNAME, JUPYTERHUB_USERNAME, JUPYTERHUB_PASSWORD


def get_jhub_apps_session():
    """Get jhub-apps session with authenticated cookies to be able to call jhub-apps API"""
    session = requests.Session()
    session.cookies.clear()
    try:
        response = session.get(
            f"http://{JUPYTERHUB_HOSTNAME}/hub/login", verify=False
        )
        response.raise_for_status()
        auth_data = {
            "_xsrf": session.cookies['_xsrf'],
            "username": JUPYTERHUB_USERNAME,
            "password": JUPYTERHUB_PASSWORD,
        }
        response = session.post(
            f"http://{JUPYTERHUB_HOSTNAME}/hub/login?next=",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data=auth_data,
            verify=False,
        )
        response.raise_for_status()

    except requests.RequestException as e:
        raise ValueError(f"An error occurred during authentication: {e}")

    response_login = session.get(
        f"http://{JUPYTERHUB_HOSTNAME}/services/japps/jhub-login",
    )
    response_login.raise_for_status()
    response_user = session.get(
        f"http://{JUPYTERHUB_HOSTNAME}/services/japps/user",
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
