from base64 import b64encode
from secrets import token_bytes

from traitlets.config import LazyConfigValue

from jhub_apps import JAppsConfig
from jhub_apps.spawner.spawner_creation import subclass_spawner


def _create_token_for_service():
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


def install_jhub_apps(c, spawner_to_subclass):
    c.JupyterHub.spawner_class = subclass_spawner(spawner_to_subclass)
    c.JupyterHub.allow_named_servers = True
    bind_url = c.JupyterHub.bind_url

    set_defaults_for_jhub_apps_config(c)
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
                "url": f"http://{c.JAppsConfig.hub_host}:10202",
                "command": [
                    c.JAppsConfig.python_exec,
                    "-m",
                    "uvicorn",
                    "jhub_apps.service.app:app",
                    "--port=10202",
                    "--host=0.0.0.0",
                    f"--workers={c.JAppsConfig.service_workers}",
                ],
                "environment": {
                    "PUBLIC_HOST": c.JupyterHub.bind_url,
                    "JHUB_APP_TITLE": c.JAppsConfig.app_title,
                    "JHUB_APP_ICON": c.JAppsConfig.app_icon,
                    "JHUB_JUPYTERHUB_CONFIG": c.JAppsConfig.jupyterhub_config_path,
                    "JHUB_APP_JWT_SECRET_KEY": _create_token_for_service(),

                    # Temp environment variables for Nebari Deployment
                    "PROXY_API_SERVICE_PORT": "*",
                    "HUB_SERVICE_PORT": "*",
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
                "admin:auth_state",
                "access:services",
                "list:services",
                "read:services",  # read service models
            ],
        },
        {
            "name": "user",
            # grant all users access to services
            "scopes": [
                "self",
                "access:services",
                "admin:auth_state"
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
