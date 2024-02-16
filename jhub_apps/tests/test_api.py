import dataclasses
import io
import json
from unittest.mock import patch

import pytest

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
        "env": {
            "ENV_VAR_KEY_1": "ENV_VAR_KEY_1",
            "ENV_VAR_KEY_2": "ENV_VAR_KEY_2",
        },
        "profile": "",
        "public": False
    }
    return user_options


@patch.object(HubClient, "get_users")
def test_api_get_server(get_users, client):
    server_data = {"panel-app": {}}
    get_users_response = [
        {'name': 'aktech', 'servers': server_data}
    ]
    get_users.return_value = get_users_response
    response = client.get("/server/panel-app")
    get_users.assert_called_once_with()
    assert response.status_code == 200
    assert response.json() == server_data["panel-app"]


@patch.object(HubClient, "create_server")
def test_api_create_server(create_server, client):
    from jhub_apps.service.models import UserOptions
    create_server_response = {"user": "aktech"}
    create_server.return_value = create_server_response
    user_options = mock_user_options()
    thumbnail = b"contents of thumbnail"
    in_memory_file = io.BytesIO(thumbnail)
    response = client.post(
        "/server",
        data={'data': json.dumps({"servername": "panel-app", "user_options": user_options})},
        files={'thumbnail': ('image.jpeg', in_memory_file)}
    )
    final_user_options = UserOptions(**user_options)
    final_user_options.thumbnail = "data:image/jpeg;base64,Y29udGVudHMgb2YgdGh1bWJuYWls"
    create_server.assert_called_once_with(
        username=MOCK_USER.name,
        servername="panel-app",
        user_options=final_user_options,
    )
    assert response.status_code == 200
    assert response.json() == create_server_response


@patch.object(HubClient, "start_server")
def test_api_start_server(create_server, client):
    start_server_response = {"user": "aktech"}
    create_server.return_value = start_server_response
    server_name = "server-name"
    response = client.post(
        f"/server/{server_name}",
    )
    create_server.assert_called_once_with(
        username=MOCK_USER.name,
        servername=server_name,
    )
    assert response.status_code == 200
    assert response.json() == start_server_response


@patch.object(HubClient, "start_server")
def test_api_start_server_404(start_server, client):
    start_server_response = None
    start_server.return_value = start_server_response
    server_name = "server-name"
    response = client.post(
        f"/server/{server_name}",
    )
    start_server.assert_called_once_with(
        username=MOCK_USER.name,
        servername=server_name,
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "server 'server-name' not found"}


@pytest.mark.parametrize("name,remove", [
    ('delete', True,),
    ('stop', False,),
])
@patch.object(HubClient, "delete_server")
def test_api_delete_server(delete_server, name, remove, client):
    create_server_response = {"user": "aktech"}
    delete_server.return_value = create_server_response
    response = client.delete("/server/panel-app", params={"remove": remove})
    delete_server.assert_called_once_with(
        MOCK_USER.name,
        server_name="panel-app",
        remove=remove
    )
    assert response.status_code == 200
    assert response.json() == create_server_response


@patch.object(HubClient, "edit_server")
def test_api_update_server(edit_server, client):
    from jhub_apps.service.models import UserOptions

    create_server_response = {"user": "aktech"}
    edit_server.return_value = create_server_response
    user_options = mock_user_options()
    thumbnail = b"contents of thumbnail"
    in_memory_file = io.BytesIO(thumbnail)
    response = client.put(
        "/server/panel-app",
        data={'data': json.dumps({"servername": "panel-app", "user_options": user_options})},
        files={'thumbnail': ('image.jpeg', in_memory_file)}
    )
    final_user_options = UserOptions(**user_options)
    final_user_options.thumbnail = "data:image/jpeg;base64,Y29udGVudHMgb2YgdGh1bWJuYWls"
    edit_server.assert_called_once_with(
        username=MOCK_USER.name,
        servername="panel-app",
        user_options=final_user_options,
    )
    assert response.status_code == 200
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
    assert response.status_code == 200
    rjson = response.json()
    assert rjson["status"] == "ok"
    assert "version" in rjson


def test_open_api_docs(client):
    response = client.get(
        "/openapi.json",
    )
    assert response.status_code == 200
    rjson = response.json()
    assert rjson['info']['version']
