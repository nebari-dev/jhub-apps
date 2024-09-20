from unittest.mock import Mock

MOCK_USER = Mock()
MOCK_USER.name = "jovyan"

JUPYTERHUB_HOSTNAME = "127.0.0.1:8000"
JUPYTERHUB_USERNAME = "admin"
JUPYTERHUB_PASSWORD = "admin"
JHUB_APPS_API_BASE_URL = f"http://{JUPYTERHUB_HOSTNAME}/services/japps"
