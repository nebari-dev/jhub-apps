from traitlets import Unicode
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
        "https://jupyter.org/assets/logos/rectanglelogo-greytext-orangebody-greymoons.svg",
        help="Icon to display on the Home Page of JHub Apps Launcher",
    ).tag(config=True)
