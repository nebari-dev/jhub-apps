from traitlets import Unicode
from traitlets.config import SingletonConfigurable, Enum
from traitlets.config import Config, Enum


class JAppsConfig(SingletonConfigurable):
    apps_auth_type = Enum(
        values=["oauth", "none"],
        default_value="oauth",
        help="Authentication for deployed apps, either",
    ).tag(config=True)

    python_exec = Unicode(
        "python", help="Python executable to use for running all the commands"
    ).tag(config=True)
    origin_host = Unicode(
        default_value="",
        help="Host ip and port currently being used. Required for Bokeh to allow access."
    ).tag(config=True)
