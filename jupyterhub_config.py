from jupyterhub.spawner import SimpleLocalProcessSpawner

from jhub_apps.configuration import install_jhub_apps

c = get_config()  # noqa

from jupyterhub.auth import DummyAuthenticator  # noqa: E402

c.JupyterHub.authenticator_class = DummyAuthenticator
c.JupyterHub.log_level = 10

c.JupyterHub.bind_url = "http://127.0.0.1:8000"
c = install_jhub_apps(c, spawner_to_subclass=SimpleLocalProcessSpawner)
