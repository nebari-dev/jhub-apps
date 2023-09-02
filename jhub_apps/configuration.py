from urllib.parse import urlparse

from jhub_apps.spawner.spawner import JHubSpawner
import os


def install_jhub_apps(c):
    c.JupyterHub.spawner_class = JHubSpawner
    c.JupyterHub.allow_named_servers = True
    bind_url = c.JupyterHub.bind_url
    if not isinstance(bind_url, str):
        raise ValueError(f"c.JupyterHub.bind_url is not set: {c.JupyterHub.bind_url}")
    parsed_url = urlparse(c.JupyterHub.bind_url)
    if not c.JupyterHub.services:
        c.JupyterHub.services = []
    c.JupyterHub.services.extend(
        [
            {
                "name": "japps",
                "url": "http://127.0.0.1:10202",
                "command": ["python", "-m", "flask", "run", "--port=10202"],
                "environment": {"FLASK_APP": "jhub_apps.service.app"},
            },
            {
                "name": "launcher",
                "url": "http://127.0.0.1:5000",
                "command": [
                    "python",
                    "-m",
                    "jhub_apps.launcher.main",
                    f"--origin-host={parsed_url.netloc}",
                ],
                # Remove this get, set environment properly
                "api_token": os.environ.get("JHUB_APP_LAUNCHER_TOKEN", "super-secret"),
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
