from traitlets import Unicode, Union, List, Callable, Integer
from traitlets.config import SingletonConfigurable, Enum


class JAppsConfig(SingletonConfigurable):
    apps_auth_type = Enum(
        values=["oauth", "none"],
        default_value="oauth",
        help="Authentication for deployed apps, either",
    ).tag(config=True)

    python_exec = Unicode(
        "python", help="Python executable to use for running all the commands"
    ).tag(config=True)

    app_title = Unicode(
        "JHub Apps Launcher",
        help="Title to display on the Home Page of JHub Apps Launcher",
    ).tag(config=True)

    app_icon = Unicode(
        "https://jupyter.org/assets/homepage/main-logo.svg",
        help="Icon to display on the Home Page of JHub Apps Launcher",
    ).tag(config=True)

    conda_envs = Union(
        [List(trait=Unicode, default_value=[], minlen=0), Callable()],
        help="""
        A list of conda environment names for the app creator to display as dropdown to select.
        Default value is the empty list. Also accepts conda_envs to be a callable function
        which is evaluated for each render of the create app page.
        """,
    ).tag(config=True)

    # This is to make sure that JupyterHub config is accessible inside services
    # There is no way to get JupyterHub config inside services otherwise.
    jupyterhub_config_path = Unicode(
        "jupyterhub_config.py",
        help="Path to JupyterHub config file.",
    ).tag(config=True)

    hub_host = Unicode(
        "127.0.0.1",
        help="Hub Host name, in k8s environment it would be the container name, e.g. 'hub'",
    ).tag(config=True)

    service_workers = Integer(
        2,
        help="The number of workers to create for the JHub Apps FastAPI service",
    ).tag(config=True)
