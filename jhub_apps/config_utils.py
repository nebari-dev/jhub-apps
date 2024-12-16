from traitlets import Any, Instance, Unicode, Union, List, Callable, Integer, Bool
from traitlets.config import SingletonConfigurable, Enum

from jhub_apps.service.models import JHubAppConfig


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

    allowed_frameworks = Bool(
        None,
        help="Allow only a specific set of frameworks to spun up apps.",
    ).tag(config=True)

    blocked_frameworks = Bool(
        None,
        help="Disallow a set of frameworks to avoid spinning up apps using those frameworks",
    ).tag(config=True)

    startup_apps = List(
        trait=Any,  # TODO: Change this, use Instance() maybe or define a new type - https://traitlets.readthedocs.io/en/stable/defining_traits.html
        default_value=[{
            'display_name': 'Adam\'s App', 
            'description': 'description', 
            'thumbnail': 'data:image/jpeg;base64,Y29udGVudHMgb2YgdGh1bWJuYWls', 
            'filepath': '', 
            'framework': 'panel', 
            'custom_command': '',
            'public': False, 
            'keep_alive': False, 
            'env': {'ENV_VAR_KEY_1': 'ENV_VAR_KEY_1', 
                'ENV_VAR_KEY_2': 'ENV_VAR_KEY_2'}, 
            'repository': None, 
            'jhub_app': True, 
            'conda_env': '', 
            'profile': '', 
            'share_with': 
                {'users': ['alice', 'john'],      'groups': ['alpha', 'beta']}
            }],
        help="List of apps to start on JHub Apps Launcher startup",
    ).tag(config=True)
