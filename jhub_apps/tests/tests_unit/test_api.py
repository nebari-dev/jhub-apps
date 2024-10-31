import io
import json
from unittest.mock import patch, Mock

import pytest

from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.service.models import UserOptions, ServerCreation, Repository
from jhub_apps.service.utils import get_shared_servers
from jhub_apps.spawner.types import FRAMEWORKS
from jhub_apps.tests.common.constants import MOCK_USER


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
        "public": False,
        "keep_alive": False,
        "share_with": {
            "users": ["alice", "john"],
            "groups": ["alpha", "beta"]
        }
    }
    return user_options


@patch.object(HubClient, "get_user")
def test_api_get_server(get_user, client):
    server_data = {"panel-app": {}}
    get_users_response = {'name': 'jovyan', 'servers': server_data}
    get_user.return_value = get_users_response
    response = client.get("/server/panel-app")
    get_user.assert_called_once_with()
    assert response.status_code == 200
    assert response.json() == server_data["panel-app"]


@patch.object(HubClient, "get_user")
def test_api_get_server_not_found(get_user, client):
    server_data = {"panel-app": {}}
    get_users_response = {'name': 'jovyan', 'servers': server_data}
    get_user.return_value = get_users_response
    response = client.get("/server/panel-app-not-found")
    get_user.assert_called_once_with()
    assert response.status_code == 404
    assert response.json() == {
        'detail': "server 'panel-app-not-found' not found",
    }


@patch.object(HubClient, "create_server")
def test_api_create_server(create_server, client):
    from jhub_apps.service.models import UserOptions
    create_server_response = {"user": "jovyan"}
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
    start_server_response = Mock(status_code=200)
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


@patch.object(HubClient, "start_server")
def test_api_start_server_404(start_server, client):
    start_server_response = Mock(status_code=404)
    start_server.return_value = start_server_response
    server_name = "server-name"
    response = client.post(
        f"/server/{server_name}",
    )
    start_server.assert_called_once_with(
        username=MOCK_USER.name,
        servername=server_name,
    )
    assert response.status_code == 403


@pytest.mark.parametrize("name,remove", [
    ('delete', True,),
    ('stop', False,),
])
@patch.object(HubClient, "delete_server")
def test_api_delete_server(delete_server, name, remove, client):
    create_server_response = {"user": "jovyan"}
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

    create_server_response = {"user": "jovyan"}
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


@patch.object(HubClient, "get_users")
@patch.object(HubClient, "get_shared_servers")
def test_shared_server_filtering(hub_get_shared_servers, get_users):
    current_hub_user = {"name": "fakeuser"}
    get_users.return_value = [
        {
            "servers": {
                '': {'name': ''},
                "panel-12": {"name": "panel-12"}
            }
        },
        {
            "servers": {
                '': {'name': ''},
                "panel-34": {"name": "panel-34", "fullname": "panel shared 34"}
            }
        },
        {
            "servers": {
                '': {'name': ''},
                "panel-56": {"name": "panel-56", "fullname": "panel shared server"}
            }
        }
    ]
    hub_get_shared_servers.return_value = [
        {"server": {"name": "panel-56", "user": {"name": "another-user"}}},
        {"server": {"name": "panel-34", "user": {"name": "another-user"}}},
        {"server": {"name": "panel-23", "user": {"name": "fakeuser"}}},
        {"server": {"name": "panel-42", "user": {"name": "fakeuser"}}},
    ]
    shared_servers = get_shared_servers(current_hub_user)
    assert shared_servers == [
        {"name": "panel-34", "fullname": "panel shared 34"},
        {"name": "panel-56", "fullname": "panel shared server"}
    ]
    hub_get_shared_servers.assert_called_once_with()
    get_users.assert_called_once_with()


def test_api_frameworks(client):
    response = client.get(
        "/frameworks",
    )
    frameworks = []
    for framework in FRAMEWORKS:
        frameworks.append(framework.json())
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


@patch.object(HubClient, "create_server")
def test_create_server_with_git_repository(
        hub_create_server,
        client,
):
    user_options = UserOptions(
        jhub_app=True,
        display_name="Test Application",
        description="App description",
        framework="panel",
        thumbnail="data:image/png;base64,ZHVtbXkgaW1hZ2UgZGF0YQ==",
        filepath="panel_basic.py",
        repository=Repository(
            url="https://github.com/nebari-dev/jhub-apps-from-git-repo-example.git",
        )
    )
    server_data = ServerCreation(servername="test server", user_options=user_options)
    files = {"thumbnail": ("test.png", b"dummy image data", "image/png")}
    data = {"data": server_data.model_dump_json()}
    hub_create_server.return_value = (201, 'test-server-abcdef')
    response = client.post("/server", data=data, files=files)
    assert response.status_code == 200
    assert response.json() == [201, 'test-server-abcdef']
    hub_create_server.assert_called_once_with(
        username="jovyan", servername=server_data.servername,
        user_options=user_options
    )
