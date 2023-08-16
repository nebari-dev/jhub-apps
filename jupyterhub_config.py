"""Sample jupyterhub config file for testing

configures jupyterhub with dummyauthenticator and simplespawner
to enable testing without administrative privileges.
"""

c = get_config()  # noqa

from jupyterhub.auth import DummyAuthenticator

c.JupyterHub.authenticator_class = DummyAuthenticator

from jhub_apps.spawner import JHubSpawner

c.JupyterHub.spawner_class = JHubSpawner
c.JupyterHub.log_level = 10


# only listen on localhost for testing
c.JupyterHub.bind_url = 'http://127.0.0.1:8000'

c.JupyterHub.services = [
    {
        'name': 'jhub-apps',
        'command': ['japps'],
    }
]

c.JupyterHub.load_roles = [
    {
        "name": "jupyterhub-apps",  # name the role
        "services": [
            "jhub-apps",  # assign the service to this role
        ],
        "scopes": [
            # declare what permissions the service should have
            "list:users",  # list users
            "read:users:activity",  # read user last-activity
            "admin:servers",  # start/stop servers
        ],
    }
]
