from unittest.mock import patch

from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.tests.constants import MOCK_USER


@patch.object(HubClient, "create_server")
def test_api(create_server, client):
    from jhub_apps.service.models import UserOptions
    create_server_response = {
        "user": "aktech"
    }
    create_server.return_value = create_server_response
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
    }
    body = {
        "servername": "panel-app",
        "user_options": user_options
    }
    response = client.post("/server/", json=body)
    create_server.assert_called_once_with(
        username=MOCK_USER.name,
        servername='panel-app',
        user_options=UserOptions(**user_options)
    )
    assert response.json() == create_server_response

