from secrets import token_bytes
from base64 import b64encode

from jhub_apps.spawner.spawner_creation import subclass_spawner
import os

from jhub_apps.spawner.utils import get_origin_host


def _create_token_for_service():
    return b64encode(token_bytes(32)).decode()


def install_jhub_apps(c, spawner_to_subclass):
    c.JupyterHub.spawner_class = subclass_spawner(spawner_to_subclass)
    c.JupyterHub.allow_named_servers = True
    bind_url = c.JupyterHub.bind_url

    if not isinstance(c.JAppsConfig.python_exec, str):
        c.JAppsConfig.python_exec = "python"

    if not isinstance(c.JAppsConfig.apps_auth_type, str):
        c.JAppsConfig.apps_auth_type = "oauth"

    if not isinstance(bind_url, str):
        raise ValueError(f"c.JupyterHub.bind_url is not set: {c.JupyterHub.bind_url}")
    if not c.JupyterHub.services:
        c.JupyterHub.services = []
    c.JupyterHub.services.extend(
        [
            {
                "name": "japps",
                "url": "http://127.0.0.1:10202",
                # TODO: Run flask app behind gunicorn
                "command": [
                    c.JAppsConfig.python_exec,
                    "-m",
                    "flask",
                    "run",
                    "--port=10202",
                ],
                "environment": {"FLASK_APP": "jhub_apps.service.app"},
            },
            {
                "name": "launcher",
                "url": "http://127.0.0.1:5000",
                "command": [
                    c.JAppsConfig.python_exec,
                    "-m",
                    "jhub_apps.launcher.main",
                    f"--origin-host={get_origin_host(c.JupyterHub.bind_url)}",
                ],
                # Remove this get, set environment properly
                "api_token": os.environ.get(
                    "JHUB_APP_LAUNCHER_TOKEN", _create_token_for_service()
                ),
            },
        ]
    )

    if not c.JupyterHub.load_roles:
        c.JupyterHub.load_roles = []

    c.JupyterHub.load_roles = [
        {
            "name": "japps-service-role",  # name the role
            "services": [
                "japps",  # assign the service to this role
                "launcher",
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
    return c
