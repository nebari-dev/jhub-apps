from unittest.mock import MagicMock

import pytest

from jhub_apps.hub_client.hub_client import _resolve_share_targets
from jhub_apps.hub_client.utils import is_jupyterhub_5


@pytest.mark.skipif(not is_jupyterhub_5(), reason="requires jupyterhub>=5")
@pytest.mark.parametrize(
    "scopes,kind,current_name,expected,expect_users_call,expect_groups_call",
    [
        # Scope filters carry the names directly — no hub call needed.
        (
            ["read:users:name!user=user_b", "read:users:name!user=user_c"],
            "users",
            None,
            ["user_b", "user_c"],
            False,
            False,
        ),
        # Current user is filtered out of the result.
        (
            ["read:users:name!user=alice", "read:users:name!user=bob"],
            "users",
            "alice",
            ["bob"],
            False,
            False,
        ),
        # Group-scoped: ONE `GET /users` call covers any number of
        # `!group=` filters; we filter users by their `groups` field
        # client-side. Avoids `GET /groups/{name}` which the service
        # token lacks `read:groups` scope to call.
        (
            ["read:users:name!group=team-x", "read:users:name!group=team-y"],
            "users",
            None,
            ["alice", "bob", "carol"],
            True,
            False,
        ),
        # Mixed: explicit `!user=` UNION `!group=` membership.
        (
            ["read:users:name!user=dave", "read:users:name!group=team-x"],
            "users",
            None,
            ["alice", "bob", "dave"],
            True,
            False,
        ),
        # Broad scope falls back to a single list call.
        (
            ["read:users:name"],
            "users",
            None,
            ["alice", "bob", "carol", "dave"],
            True,
            False,
        ),
        # No relevant scopes → empty, no calls.
        ([], "users", None, [], False, False),
        # Same logic for groups: explicit names, no list call.
        (
            ["read:groups:name!group=team-x", "read:groups:name!group=team-y"],
            "groups",
            None,
            ["team-x", "team-y"],
            False,
            False,
        ),
        # Broad groups scope → single list call.
        (
            ["read:groups:name"],
            "groups",
            None,
            ["team-x", "team-y"],
            False,
            True,
        ),
    ],
)
def test_resolve_share_targets(
    scopes, kind, current_name, expected, expect_users_call, expect_groups_call
):
    hclient = MagicMock()
    hclient.get_users.return_value = [
        {"name": "alice", "groups": ["team-x"]},
        {"name": "bob", "groups": ["team-x", "team-y"]},
        {"name": "carol", "groups": ["team-y"]},
        {"name": "dave", "groups": []},
    ]
    hclient.get_groups.return_value = [
        {"name": "team-x"},
        {"name": "team-y"},
    ]

    result = _resolve_share_targets(hclient, scopes, kind, current_name)

    assert set(result) == set(expected)
    assert hclient.get_users.called is expect_users_call
    assert hclient.get_groups.called is expect_groups_call
