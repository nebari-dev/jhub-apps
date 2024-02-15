import logging
import os

import pytest

from fastapi.testclient import TestClient

from jhub_apps.tests.constants import MOCK_USER


@pytest.fixture
def client():
    logging_format = (
        "%(asctime)s %(levelname)9s %(name)s:%(lineno)4s: %(message)s"
    )
    logging.basicConfig(
        level=logging.INFO, format=logging_format
    )
    os.environ["JUPYTERHUB_API_URL"] = "/"
    os.environ["JUPYTERHUB_API_TOKEN"] = "token"
    os.environ["PUBLIC_HOST"] = "/"
    os.environ["JUPYTERHUB_CLIENT_ID"] = "test-client-id"
    os.environ["JUPYTERHUB_OAUTH_CALLBACK_URL"] = "/"
    from jhub_apps.service import app
    from jhub_apps.service.security import get_current_user

    async def mock_get_user_name():
        return MOCK_USER

    app.dependency_overrides[get_current_user] = mock_get_user_name
    return TestClient(app)
