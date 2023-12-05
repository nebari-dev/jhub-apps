from jupyterhub.spawner import SimpleLocalProcessSpawner

from jhub_apps import theme_template_paths
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
c.JupyterHub.default_url = "/hub/home"

c = install_jhub_apps(c, spawner_to_subclass=SimpleLocalProcessSpawner)

c.JupyterHub.template_paths = theme_template_paths
c.JupyterHub.services.extend(
    [
        {
            "name": "JuypterLab",
            "url": hub_url,
            "display": True,
            "info": {
                "name": "JupyterLab",
                "url": "/user/[USER]/lab",
                "external": True,
            },
            "oauth_no_confirm": True,
        },
        {
            "name": "Argo",
            "url": hub_url,
            "display": True,
            "info": {
                "name": "Argo Workflows",
                "url": "/hub/argo",
                "external": True,
            },
            "oauth_no_confirm": True,
        },
        {
            "name": "Users",
            "url": hub_url,
            "display": True,
            "info": {
                "name": "User Management",
                "url": "/auth/admin/nebari/console/",
                "external": True,
            },
            "oauth_no_confirm": True,
        },
        {
            "name": "Environments",
            "url": hub_url,
            "display": True,
            "info": {
                "name": "Environments",
                "url": "/hub/conda-store",
                "external": True,
            },
            "oauth_no_confirm": True,
        },
        {
            "name": "Monitoring",
            "url": hub_url,
            "display": True,
            "info": {
                "name": "Monitoring",
                "url": "/hub/monitoring",
                "external": True,
            },
            "oauth_no_confirm": True,
        },
        {
            "name": "MLflow",
            "url": "http://mlflow.mlflow:5000",
            "display": True,
            "info": {
                "name": "MLflow",
                "url": "http://mlflow.mlflow:5000",
                "external": True,
            },
            "oauth_no_confirm": True,
        },
    ]
)

# nebari will control these as ways to customize the template
c.JupyterHub.template_vars = {
    "hub_title": "Welcome to Nebari",
    "hub_subtitle": "your open source data science platform",
    "welcome": "Running in dev mode",
    "logo": "/services/japps/static/img/Nebari-Logo-Horizontal-Lockup-White-text.svg",
    "primary_color": "#C316E9",
    "primary_color_dark": "#79158a",
    "secondary_color": "#18817A",
    "secondary_color_dark": "#12635E",
    "accent_color": "#eda61d",
    "accent_color_dark": "#a16d14",
    "text_color": "#1c1d26",
    "h1_color": "#0f1015",
    "h2_color": "#0f1015",
    "navbar_text_color": "#ffffff",
    "navbar_hover_color": "#20b1a8",
    "navbar_color": "#1c1d26",
}
