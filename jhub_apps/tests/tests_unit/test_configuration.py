import pytest
from jupyterhub import orm, scopes
from jupyterhub.spawner import SimpleLocalProcessSpawner
from traitlets.config import Config

from jhub_apps.configuration import install_jhub_apps


@pytest.fixture
def load_roles():
    c = Config()
    c.JupyterHub.bind_url = "http://127.0.0.1:8000"
    c = install_jhub_apps(c, SimpleLocalProcessSpawner)
    return {role["name"]: role for role in c.JupyterHub.load_roles}


def _auth_state_access(role, username):
    """Which users' auth_state a member of the role can read, as JupyterHub expands it"""
    expanded = scopes.expand_scopes(role["scopes"], owner=orm.User(name=username))
    return scopes.parse_scopes(expanded).get("admin:auth_state")


def test_users_can_only_read_their_own_auth_state(load_roles):
    user_role = load_roles["user"]
    assert "admin:auth_state" not in user_role["scopes"]
    assert _auth_state_access(user_role, "alice") == {"user": {"alice"}}
    assert _auth_state_access(user_role, "bob") == {"user": {"bob"}}


def test_service_can_read_all_auth_state(load_roles):
    assert "admin:auth_state" in load_roles["japps-service-role"]["scopes"]
