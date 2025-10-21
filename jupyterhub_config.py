from jupyterhub.spawner import SimpleLocalProcessSpawner

from jhub_apps import theme_template_paths, themes
from jhub_apps.configuration import install_jhub_apps
from jhub_apps.hub_client.utils import is_jupyterhub_5

c = get_config()  # noqa

from jupyterhub.auth import DummyAuthenticator  # noqa: E402

c.Authenticator.admin_users = {"admin"}
c.JupyterHub.authenticator_class = DummyAuthenticator
c.JupyterHub.log_level = 10

hub_url = "http://127.0.0.1:8000"
c.JupyterHub.bind_url = hub_url
c.JAppsConfig.jupyterhub_config_path = "jupyterhub_config.py"
c.JAppsConfig.conda_envs = []
c.JAppsConfig.service_workers = 1

# Configure pinned services via JAppsConfig
c.JAppsConfig.pinned_services = [
    {
        "name": "Argo",
        "url": "/argo",
        "pinned": True,
        "thumbnail": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC",
    },
    {
        "name": "Users",
        "url": "/auth/admin/nebari/console/",
    },
    {
        "name": "Environments",
        "url": "/conda-store",
        "description": "This is conda-store, your environments manager.",
        "pinned": True,
        "thumbnail": "https://raw.githubusercontent.com/conda-incubator/conda-store/main/docusaurus-docs/community/assets/logos/conda-store-logo-vertical-lockup.svg",
    },
    {
        "name": "Monitoring",
        "url": "/monitoring",
    },
]

c.JAppsConfig.startup_apps = [
    {
        "username": "admin",
        "servername": "admin's-startup-server",
        "user_options": {
            "display_name": "Admin's Panel App",
            "description": "description",
            "thumbnail": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC",
            "filepath": "",
            "framework": "panel",
            "custom_command": "",
            "public": False,
            "keep_alive": False,
            "env": {"ENV_VAR_KEY_1": "ENV_VAR_KEY_1"},
            "repository": None,
            "conda_env": "",
            "profile": "",
            "share_with": {"users": ["admin"], "groups": ["class-A"]},
        },
    },
    {
        "username": "admin",
        "servername": "admin's-2nd-startup-server",
        "user_options": {
            "display_name": "Admin's 2nd App",
            "description": "description",
            "thumbnail": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC",
            "filepath": "panel_basic.py",
            "framework": "panel",
            "public": False,
            "keep_alive": False,
            "repository": {
                "url": "https://github.com/nebari-dev/jhub-apps-from-git-repo-example.git"
            },
            "conda_env": "",
            "profile": "",
            "share_with": {"users": ["admin"], "groups": ["class-A"]},
        },
    },
]
c.JupyterHub.default_url = "/hub/home"

c = install_jhub_apps(
    c, spawner_to_subclass=SimpleLocalProcessSpawner, oauth_no_confirm=True
)

c.JupyterHub.template_paths = theme_template_paths

# NOTE: Pinned services are now configured via c.JAppsConfig.pinned_services above.
# The old approach was to use c.JupyterHub.services.extend() with service_for_jhub_apps() helper.
# You can still use that approach if needed:
#
# from jhub_apps import service_for_jhub_apps
# c.JupyterHub.services.extend([
#     service_for_jhub_apps(name="Custom Service", url="/custom", pinned=True),
# ])

# nebari will control these as ways to customize the template
c.JupyterHub.template_vars = {
    "hub_title": "Welcome to Nebari",
    "hub_subtitle": "your open source data science platform",
    "welcome": "Running in dev mode",
    "display_version": True,
    **themes.DEFAULT_THEME,
}

c.JupyterHub.load_groups = {
    "class-A": {"users": ["john", "alice"]},
    "class-B": {"users": ["john", "alice"]},
}

# Add permission to share servers/apps
# This should be handled by the users of jhub-apps,
# jhub-apps won't make this decision for the users, so that
# they can define permissions as per their preferences
for role in c.JupyterHub.load_roles:
    if role["name"] == "user":
        role["scopes"].extend(
            [
                # Need scope 'read:users:name' to share with users by name
                "read:users:name",
                # Need scope 'read:groups:name' to share with groups by name
                "read:groups:name",
            ]
            + ["shares!user"]
            if is_jupyterhub_5()
            else []
        )
        break

c.JupyterHub.load_roles = c.JupyterHub.load_roles + [
    {
        "name": "allow-access-to-start-shared-server",
        "description": "Allows users to start shared server",
        "scopes": [
            "servers",
        ],
        "users": ["user-with-permission-to-start-shared"],
    }
]

# Uncomment to add a profile to the spawner
# c.KubeSpawner.profile_list = [
#     {
#         "description": "Stable environment with 0.5-1 cpu / 0.5-1 GB ram",
#         "display_name": "Small Instance",
#         "slug": "small-instance",
#     },
# ]
