import os
from unittest.mock import patch, MagicMock
from jhub_apps.service.routes import HubClient


PATCH_ENV = {"JUPYTERHUB_API_TOKEN": "secret-token"}


@patch.dict(os.environ, PATCH_ENV, clear=True)
@patch.object(HubClient, "get_user")
@patch("jhub_apps.service.routes.get_hub_oauth")
def test_api_server(get_hub_oauth, get_user, client):
    user_for_token = MagicMock()
    auth = MagicMock()
    user_for_token.return_value = {"name": "username"}
    get_hub_oauth.return_value = auth
    auth.user_for_token = user_for_token
    returned_user_from_get_user = {"servers": [{"name": "server-name"}]}
    get_user.return_value = returned_user_from_get_user
    response = client.get("/server")
    assert response.json == returned_user_from_get_user
