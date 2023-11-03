from jupyterhub.spawner import SimpleLocalProcessSpawner

from jhub_apps.configuration import install_jhub_apps

c = get_config()  # noqa

from jupyterhub.auth import DummyAuthenticator  # noqa: E402

c.JupyterHub.authenticator_class = DummyAuthenticator
c.JupyterHub.log_level = 10

c.JupyterHub.bind_url = "http://127.0.0.1:8000"


def get_environments():
    return ['base', 'jhub-apps-dev', "nebari"]


c.JAppsConfig.conda_envs = get_environments
c = install_jhub_apps(c, spawner_to_subclass=SimpleLocalProcessSpawner)
