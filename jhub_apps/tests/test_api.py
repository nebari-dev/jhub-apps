import dataclasses
from unittest.mock import patch

from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.spawner.types import FRAMEWORKS
from jhub_apps.tests.constants import MOCK_USER


def mock_user_options():
    user_options = {
        "jhub_app": True,
        "display_name": "Panel App",
        "description": "description",
        "thumbnail": "",
        "filepath": "",
        "framework": "panel",
        "custom_command": "",
        "conda_env": "",
        "profile": "",
        "public": False
    }
    return user_options


@patch.object(HubClient, "get_user")
def test_api_get_server(get_user, client):
    server_data = {"panel-app": {}}
    create_server_response = {"user": "aktech", "servers": server_data}
    get_user.return_value = create_server_response
    response = client.get("/server/panel-app")
    get_user.assert_called_once_with(MOCK_USER.name)
    assert response.json() == server_data["panel-app"]


@patch.object(HubClient, "create_server")
def test_api_create_server(create_server, client):
    from jhub_apps.service.models import UserOptions

    create_server_response = {"user": "aktech"}
    create_server.return_value = create_server_response
    user_options = mock_user_options()
    body = {"servername": "panel-app", "user_options": user_options}
    response = client.post("/server/", json=body)
    create_server.assert_called_once_with(
        username=MOCK_USER.name,
        servername="panel-app",
        user_options=UserOptions(**user_options),
    )
    assert response.json() == create_server_response


@patch.object(HubClient, "delete_server")
def test_api_delete_server(delete_server, client):
    create_server_response = {"user": "aktech"}
    delete_server.return_value = create_server_response
    response = client.delete("/server/panel-app")
    delete_server.assert_called_once_with(
        MOCK_USER.name,
        server_name="panel-app",
    )
    assert response.json() == create_server_response


@patch.object(HubClient, "create_server")
def test_api_update_server(create_server, client):
    from jhub_apps.service.models import UserOptions

    create_server_response = {"user": "aktech"}
    create_server.return_value = create_server_response
    user_options = mock_user_options()
    body = {"servername": "panel-app", "user_options": user_options}
    response = client.put("/server/panel-app", json=body)
    create_server.assert_called_once_with(
        username=MOCK_USER.name,
        servername="panel-app",
        edit=True,
        user_options=UserOptions(**user_options),
    )
    assert response.json() == create_server_response


def test_api_frameworks(client):
    response = client.get(
        "/frameworks",
    )
    frameworks = []
    for framework in FRAMEWORKS:
        frameworks.append(dataclasses.asdict(framework))
    assert response.json() == frameworks


def test_api_status(client):
    response = client.get(
        "/status",
    )
    assert response.json() == {"status": "ok"}
