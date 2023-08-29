from jhub_apps.configuration import install_jhub_apps

c = get_config()  # noqa

from jupyterhub.auth import DummyAuthenticator

c.JupyterHub.authenticator_class = DummyAuthenticator
c.JupyterHub.log_level = 10

c = install_jhub_apps(c)
