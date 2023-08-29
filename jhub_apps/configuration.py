from jhub_apps.spawner.spawner import JHubSpawner
import os


def install_jhub_apps(c):
    # only listen on localhost for testing
    BASE_URL = os.environ.get("JHUB_APP_BASE_URL", "http://127.0.0.1:8000")
    c.JupyterHub.bind_url = BASE_URL

    c.JupyterHub.spawner_class = JHubSpawner
    c.JupyterHub.allow_named_servers = True

    if not c.JupyterHub.services:
        c.JupyterHub.services = []
    c.JupyterHub.services.extend(
        [
            {
                "name": "japps",
                "url": "http://127.0.0.1:10202",
                "command": ["flask", "run", "--port=10202"],
                "environment": {"FLASK_APP": "jhub_apps.service.app"},
            },
            {
                "name": "launcher",
                "url": "http://127.0.0.1:5000",
                "command": ["python", "-m", "jhub_apps.launcher.main"],
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
