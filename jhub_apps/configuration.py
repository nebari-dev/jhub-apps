import os
from base64 import b64encode
from secrets import token_bytes

from traitlets.config import LazyConfigValue

from jhub_apps import JAppsConfig
from jhub_apps.hub_client.utils import is_jupyterhub_5
from jhub_apps.spawner.spawner_creation import subclass_spawner

FASTAPI_SERVICE_NAME = "japps"
STARTUP_APPS_SERVICE_NAME = f"{FASTAPI_SERVICE_NAME}-initialize-startup-apps"


def _create_token_for_service():
    # Use the one from environment if available
    if os.environ.get("JHUB_APP_JWT_SECRET_KEY"):
        return os.environ["JHUB_APP_JWT_SECRET_KEY"]
    return b64encode(token_bytes(32)).decode()


def set_defaults_for_jhub_apps_config(c):
    """Set default values for configuration items which are not set by the user"""
    trait_names = JAppsConfig().trait_names()
    trait_names.remove('parent')
    trait_names.remove('log')
    trait_names.remove('config')
    defaults = JAppsConfig().trait_defaults()
    for trait_name in trait_names:
        if isinstance(getattr(c.JAppsConfig, trait_name), LazyConfigValue):
            setattr(c.JAppsConfig, trait_name, defaults.get(trait_name))


def install_jhub_apps(c, spawner_to_subclass, *, oauth_no_confirm=False):
    """Install jhub-apps into JupyterHub configuration object (`c`).

    When `oauth_no_confirm` is set to True, the "Authorize access"
    screen is not shown and jhub-apps is always granted access to
    read the identity of the visiting JupyterHub user.
    """
    c.JupyterHub.spawner_class = subclass_spawner(spawner_to_subclass)
    c.JupyterHub.allow_named_servers = True
    bind_url = c.JupyterHub.bind_url

    japps_config = JAppsConfig(config=c)  # validate inputs
    set_defaults_for_jhub_apps_config(c)
    if not isinstance(bind_url, str):
        raise ValueError(f"c.JupyterHub.bind_url is not set: {c.JupyterHub.bind_url}")
    if not c.JupyterHub.services:
        c.JupyterHub.services = []
    public_host = c.JupyterHub.bind_url
    oauth_redirect_uri = (
        f"{public_host}/services/{FASTAPI_SERVICE_NAME}/oauth_callback"
    )
    c.JupyterHub.services.extend(
        [
            {
                "name": FASTAPI_SERVICE_NAME,
                "url": f"http://{japps_config.hub_host}:10202",
                "command": [
                    japps_config.python_exec,
                    "-m",
                    "uvicorn",
                    "jhub_apps.service.app:app",
                    "--port=10202",
                    "--host=0.0.0.0",
                    f"--workers={japps_config.service_workers}",
                ],
                "environment": {
                    "PUBLIC_HOST": c.JupyterHub.bind_url,
                    "JHUB_APP_TITLE": japps_config.app_title,
                    "JHUB_APP_ICON": japps_config.app_icon,
                    "JHUB_JUPYTERHUB_CONFIG": japps_config.jupyterhub_config_path,
                    "JHUB_APP_JWT_SECRET_KEY": _create_token_for_service(),

                    # Temp environment variables for Nebari Deployment
                    "PROXY_API_SERVICE_PORT": "*",
                    "HUB_SERVICE_PORT": "*",
                },
                "oauth_redirect_uri": oauth_redirect_uri,
                "oauth_no_confirm": oauth_no_confirm,
                "display": False,
            },
            {
                "name": STARTUP_APPS_SERVICE_NAME,
                "command": [
                    "/bin/sh",
                    "-c",
                    f"{japps_config.python_exec} -m jhub_apps.tasks.commands.initialize_startup_apps && tail -f /dev/null",
                ],
                "environment": {
                    "PUBLIC_HOST": c.JupyterHub.bind_url,
                    "JHUB_JUPYTERHUB_CONFIG": japps_config.jupyterhub_config_path,

                    # Temp environment variables for Nebari Deployment
                    "PROXY_API_SERVICE_PORT": "*",
                    "HUB_SERVICE_PORT": "*",
                },
            },
        ]
    )

    services_roles = [
        {
            "name": "japps-service-role",  # name the role
            "services": [
                # assign the services to this role,
                FASTAPI_SERVICE_NAME,  
                STARTUP_APPS_SERVICE_NAME,
            ],
            "scopes": [
                # declare what permissions the service should have
                "list:users",  # list users
                "list:groups",  # list groups
                "read:users:activity",  # read user last-activity
                "read:users",  # read user last-activity
                "admin:servers",  # start/stop servers
                "admin:server_state",  # start/stop servers
                "admin:server_state",  # start/stop servers
                "admin:auth_state",
                "access:services",
                "list:services",
                "read:services",  # read service models,
                "tokens",  # ability to generate tokens for users to act as user
            ] + ([
                "shares"
            ] if is_jupyterhub_5() else []),
        },
        {
            "name": "user",
            # grant all users access to services
            "scopes": [
                "self",
                "access:services",
                "list:services",
                "admin:auth_state",
            ],
        },
    ]

    if not c.JupyterHub.load_roles:
        c.JupyterHub.load_roles = []

    if isinstance(c.JupyterHub.load_roles, list):
        c.JupyterHub.load_roles = c.JupyterHub.load_roles + services_roles
    else:
        c.JupyterHub.load_roles = services_roles
    return c
