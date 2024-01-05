import os
from base64 import b64encode
from secrets import token_bytes

from jhub_apps import JAppsConfig
from jhub_apps.spawner.spawner_creation import subclass_spawner


def _create_token_for_service():
    return b64encode(token_bytes(32)).decode()


def install_jhub_apps(c, spawner_to_subclass):
    c.JupyterHub.spawner_class = subclass_spawner(spawner_to_subclass)
    c.JupyterHub.allow_named_servers = True
    bind_url = c.JupyterHub.bind_url

    if not isinstance(c.JAppsConfig.python_exec, str):
        c.JAppsConfig.python_exec = JAppsConfig.python_exec.default_value

    if not isinstance(c.JAppsConfig.apps_auth_type, str):
        c.JAppsConfig.apps_auth_type = JAppsConfig.apps_auth_type.default_value

    if not isinstance(c.JAppsConfig.app_title, str):
        c.JAppsConfig.app_title = JAppsConfig.app_title.default_value

    if not isinstance(c.JAppsConfig.app_icon, str):
        c.JAppsConfig.app_icon = JAppsConfig.app_icon.default_value

    if not isinstance(c.JAppsConfig.jupyterhub_config_path, str):
        c.JAppsConfig.jupyterhub_config_path = (
            JAppsConfig.jupyterhub_config_path.default_value
        )

    if not isinstance(bind_url, str):
        raise ValueError(f"c.JupyterHub.bind_url is not set: {c.JupyterHub.bind_url}")
    if not c.JupyterHub.services:
        c.JupyterHub.services = []
    public_host = c.JupyterHub.bind_url
    fast_api_service_name = "japps"
    oauth_redirect_uri = (
        f"{public_host}/services/{fast_api_service_name}/oauth_callback"
    )
    c.JupyterHub.services.extend(
        [
            {
                "name": fast_api_service_name,
                "url": "http://127.0.0.1:10202",
                "command": [
                    c.JAppsConfig.python_exec,
                    "-m",
                    "uvicorn",
                    "jhub_apps.service.app:app",
                    "--port",
                    "10202",
                ],
                "environment": {
                    "PUBLIC_HOST": c.JupyterHub.bind_url,
                    "JHUB_APP_TITLE": c.JAppsConfig.app_title,
                    "JHUB_APP_ICON": c.JAppsConfig.app_icon,
                    "JHUB_JUPYTERHUB_CONFIG": c.JAppsConfig.jupyterhub_config_path,
                    "JWT_SECRET_KEY": os.environ["JWT_SECRET_KEY"],
                },
                "oauth_redirect_uri": oauth_redirect_uri,
                "display": False,
            },
        ]
    )

    services_roles = [
        {
            "name": "japps-service-role",  # name the role
            "services": [
                "japps",  # assign the service to this role
            ],
            "scopes": [
                # declare what permissions the service should have
                "list:users",  # list users
                "read:users:activity",  # read user last-activity
                "read:users",  # read user last-activity
                "admin:servers",  # start/stop servers
                "admin:server_state",  # start/stop servers
                "admin:server_state",  # start/stop servers
                "access:services",
                "list:services",
            ],
        },
        {
            "name": "user",
            # grant all users access to services
            "scopes": ["self", "access:services"],
        },
    ]

    if not c.JupyterHub.load_roles:
        c.JupyterHub.load_roles = []

    if isinstance(c.JupyterHub.load_roles, list):
        c.JupyterHub.load_roles = c.JupyterHub.load_roles + services_roles
    else:
        c.JupyterHub.load_roles = services_roles
    return c
