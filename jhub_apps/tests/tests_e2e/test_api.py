import hashlib
import uuid

import pytest

from jhub_apps.service.models import Repository, UserOptions, ServerCreation, SharePermissions
from jhub_apps.spawner.types import Framework
from jhub_apps.tests.common.constants import JHUB_APPS_API_BASE_URL, JUPYTERHUB_HOSTNAME
from jhub_apps.tests.tests_e2e.utils import get_jhub_apps_session, fetch_url_until_title_found, \
    skip_if_jupyterhub_less_than_5, create_server, stop_server, start_server

EXAMPLE_TEST_REPO = "https://github.com/nebari-dev/jhub-apps-from-git-repo-example.git"


def test_api_status(client):
    response = client.get("/status")
    assert response.status_code == 200
    assert set(response.json().keys()) == {"version", "status"}


def test_app_config_from_git_api(
        client,
):
    response = client.post(
        '/app-config-from-git/',
        json={
            "url": EXAMPLE_TEST_REPO,
            "config_directory": ".",
            "ref": "main"
        }
    )
    assert response.status_code == 200
    response_json = response.json()
    assert response_json
    assert set(response_json.keys()) == {
        "display_name", "description", "framework", "filepath",
        "env", "keep_alive", "public", "thumbnail",
        "custom_command", "repository"
    }
    assert response_json["display_name"] == "My Panel App (Git)"
    assert response_json["description"] == "This is a panel app created from git repository"
    assert response_json["framework"] == "panel"
    assert response_json["filepath"] == "panel_basic.py"
    assert response_json["env"] == {
        "SOMETHING_FOO": "bar",
        "SOMETHING_BAR": "beta",
    }
    assert response_json["keep_alive"] is False
    assert response_json["public"] is False

    assert isinstance(response_json["thumbnail"], str)
    expected_thumbnail_sha = "a8104b2482360eee525dc696dafcd2a17864687891dc1b6c9e21520518a5ea89"
    assert hashlib.sha256(response_json["thumbnail"].encode('utf-8')).hexdigest() == expected_thumbnail_sha


@pytest.mark.parametrize("repo_url, config_directory, response_status_code,detail", [
    (EXAMPLE_TEST_REPO, "non-existent-path", 400,
     "Path 'non-existent-path' doesn't exists in the repository."),
    ("http://invalid-repo/", ".", 400,
     "Repository clone failed: http://invalid-repo/"),
])
def test_app_config_from_git_api_invalid(
        client,
        repo_url,
        config_directory,
        response_status_code,
        detail
):
    response = client.post(
        '/app-config-from-git/',
        json={
            "url": repo_url,
            "config_directory": config_directory,
            "ref": "main"
        }
    )
    assert response.status_code == response_status_code
    response_json = response.json()
    assert "detail" in response_json
    assert response_json["detail"] == detail


def test_create_server_with_git_repository():
    user_options = UserOptions(
        jhub_app=True,
        display_name="Test Application",
        description="App description",
        framework=Framework.panel.value,
        thumbnail="data:image/png;base64,ZHVtbXkgaW1hZ2UgZGF0YQ==",
        filepath="panel_basic.py",
        repository=Repository(
            url="https://github.com/nebari-dev/jhub-apps-from-git-repo-example.git",
        )
    )
    files = {"thumbnail": ("test.png", b"dummy image data", "image/png")}
    server_data = ServerCreation(
        servername="test server from git repo",
        user_options=user_options
    )
    data = {"data": server_data.model_dump_json()}
    session = get_jhub_apps_session()
    response = session.post(
        f"{JHUB_APPS_API_BASE_URL}/server",
        verify=False,
        data=data,
        files=files
    )
    assert response.status_code == 200
    server_name = response.json()[-1]
    created_app_url = f"http://{JUPYTERHUB_HOSTNAME}/user/admin/{server_name}/"
    fetch_url_until_title_found(
        session, url=created_app_url, expected_title="Panel Test App from Git Repository"
    )


@skip_if_jupyterhub_less_than_5()
@pytest.mark.parametrize("framework, response_status_code,", [
    (Framework.panel.value, 200),
    (Framework.jupyterlab.value, 403),
])
def test_server_sharing(framework, response_status_code):
    share_with_user = f"share-username-{uuid.uuid4().hex[:6]}"
    shared_user_session = get_jhub_apps_session(username=share_with_user)
    user_options = UserOptions(
        jhub_app=True,
        display_name="Test Application",
        description="App description",
        framework=framework,
        thumbnail="data:image/png;base64,ZHVtbXkgaW1hZ2UgZGF0YQ==",
        filepath="",
        share_with=SharePermissions(
            users=[share_with_user],
            groups=[]
        )
    )
    server_data = ServerCreation(
        servername="test server sharing",
        user_options=user_options
    )
    data = {"data": server_data.model_dump_json()}
    session = get_jhub_apps_session()
    response = session.post(
        f"{JHUB_APPS_API_BASE_URL}/server",
        verify=False,
        data=data,
    )
    assert response.status_code == 200
    server_name = response.json()[-1]
    created_app_url = f"http://{JUPYTERHUB_HOSTNAME}/user/admin/{server_name}/"
    response = shared_user_session.get(created_app_url)
    assert response.status_code == response_status_code


@skip_if_jupyterhub_less_than_5()
@pytest.mark.parametrize("shared_username, response_status_code,", [
    # This user has been given special permission to start shared server
    # in jupyterhub_config.py
    ("user-with-permission-to-start-shared", 200),
    ("user-without-permission-to-start-shared", 403),
])
def test_starting_stopped_server(shared_username, response_status_code):
    app_author_user = f"app-author-user-{uuid.uuid4().hex[:6]}"
    share_with_user = shared_username
    app_author_user_session = get_jhub_apps_session(username=app_author_user)
    share_with_user_session = get_jhub_apps_session(username=share_with_user)
    user_options = UserOptions(
        jhub_app=True,
        display_name="Test Application",
        description="App description",
        framework="panel",
        thumbnail="data:image/png;base64,ZHVtbXkgaW1hZ2UgZGF0YQ==",
        filepath="",
        share_with=SharePermissions(
            users=[share_with_user],
            groups=[]
        )
    )
    # create server
    server_name = create_server(app_author_user_session, user_options)

    # stop server
    stop_server_response = stop_server(app_author_user_session, server_name)
    assert stop_server_response.status_code == 200

    # Start server from shared user's session
    start_server_response = start_server(share_with_user_session, server_name)
    assert start_server_response.status_code == response_status_code
