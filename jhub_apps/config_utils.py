from traitlets import Unicode, List, Union, Callable
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
        [
            List(trait=Unicode, default_value=[], minlen=0),
            Callable()
        ],
        help="""
        A list of Conda env names for the JupyterHub Apps Launcher.
        Default value is the empty list. Also accepts conda_envs to
        be a callable function which is evaluated for each render of
        the create app page.
        """
    ).tag(config=True)
