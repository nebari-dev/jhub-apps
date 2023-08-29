"""Sample jupyterhub config file for testing

configures jupyterhub with dummyauthenticator and simplespawner
to enable testing without administrative privileges.
"""
import os
import warnings

c = get_config()  # noqa

from jupyterhub.auth import DummyAuthenticator

c.JupyterHub.authenticator_class = DummyAuthenticator

from jhub_apps.spawner.spawner import JHubSpawner

c.JupyterHub.spawner_class = JHubSpawner
c.JupyterHub.log_level = 10


# only listen on localhost for testing
c.JupyterHub.bind_url = "http://127.0.0.1:8000"
c.JupyterHub.allow_named_servers = True


# When Swagger performs OAuth2 in the browser, it will set
# the request host + relative path as the redirect uri, causing a
# uri mismatch if the oauth_redirect_uri is just the relative path
# is set in the c.JupyterHub.services entry (as per default).
# Therefore need to know the request host ahead of time.
if "PUBLIC_HOST" not in os.environ:
    msg = (
        "env PUBLIC_HOST is not set, defaulting to http://127.0.0.1:8000.  "
        "This can cause problems with OAuth.  "
        "Set PUBLIC_HOST to your public (browser accessible) host."
    )
    warnings.warn(msg)
    public_host = "http://127.0.0.1:8000"
else:
    public_host = os.environ["PUBLIC_HOST"].rstrip("/")
service_name = "japps"
oauth_redirect_uri = f"{public_host}/services/{service_name}/oauth_callback"


c.JupyterHub.services = [
    {
        "name": "japps",
        "url": "http://127.0.0.1:10202",
        "command": ["uvicorn", "jhub_apps.service.app:app", "--port", "10202"],
        "oauth_redirect_uri": oauth_redirect_uri,
        "environment": {"PUBLIC_HOST": public_host},
    },
    {
        "name": "launcher",
        "url": "http://127.0.0.1:5000",
        "command": ["python", "-m", "jhub_apps.launcher.main"],
        # Remove this get, set environment properly
        "api_token": os.environ.get("JHUB_APP_LAUNCHER_TOKEN", "super-secret"),
    },
]

c.JupyterHub.load_roles = [
    {
        "name": "japps-service-role",  # name the role
        "services": [
            "japps",  # assign the service to this role
            "launcher",
        ],
        "scopes": [
            # declare what permissions the service should have
            "list:users",  # list users
            "read:users:activity",  # read user last-activity
            "read:users",  # read user last-activity
            "admin:servers",  # start/stop servers
            "admin:server_state",  # start/stop servers
            "admin:server_state",  # start/stop servers
            "access:services",
            "list:services",
        ],
    },
    {
        "name": "user",
        # grant all users access to services
        "scopes": ["self", "access:services"],
    },
]
