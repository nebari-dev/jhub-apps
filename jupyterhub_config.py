from jupyterhub.spawner import SimpleLocalProcessSpawner

from jhub_apps import theme_template_paths, themes
from jhub_apps.configuration import install_jhub_apps

c = get_config()  # noqa

from jupyterhub.auth import DummyAuthenticator  # noqa: E402

c.Authenticator.admin_users = {"admin"}
c.JupyterHub.authenticator_class = DummyAuthenticator
c.JupyterHub.log_level = 10

hub_url = "http://127.0.0.1:8000"
c.JupyterHub.bind_url = hub_url
c.JAppsConfig.jupyterhub_config_path = "jupyterhub_config.py"
c.JAppsConfig.conda_envs = []
c.JAppsConfig.service_workers = 4
c.JupyterHub.default_url = "/hub/home"

c = install_jhub_apps(c, spawner_to_subclass=SimpleLocalProcessSpawner)

c.JupyterHub.template_paths = theme_template_paths


def service_for_jhub_apps(name, url):
    return {
        "name": name,
        "display": True,
        "info": {
            "name": name,
            "url": url,
            "external": True,
        },
        "oauth_no_confirm": True,
    }


c.JupyterHub.services.extend(
    [
        service_for_jhub_apps(name="Argo", url="/argo"),
        service_for_jhub_apps(name="Users", url="/auth/admin/nebari/console/"),
        service_for_jhub_apps(name="Environments", url="/conda-store"),
        service_for_jhub_apps(name="Monitoring", url="/monitoring"),
    ]
)

# nebari will control these as ways to customize the template
c.JupyterHub.template_vars = {
    "hub_title": "Welcome to Nebari",
    "hub_subtitle": "your open source data science platform",
    "welcome": "Running in dev mode",
    "display_version": True,
    **themes.DEFAULT_THEME
}
