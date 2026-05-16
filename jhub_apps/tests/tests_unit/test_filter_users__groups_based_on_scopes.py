from unittest.mock import MagicMock

import pytest

from jhub_apps.hub_client.hub_client import _resolve_share_targets
from jhub_apps.hub_client.utils import is_jupyterhub_5


@pytest.mark.skipif(not is_jupyterhub_5(), reason="requires jupyterhub>=5")
@pytest.mark.parametrize(
    "scopes,kind,current_name,expected,expect_list_call,group_calls",
    [
        # Scope filters carry the names directly — no hub call needed.
        (
            ["read:users:name!user=user_b", "read:users:name!user=user_c"],
            "users",
            None,
            ["user_b", "user_c"],
            False,
            [],
        ),
        # Current user is filtered out of the result.
        (
            ["read:users:name!user=alice", "read:users:name!user=bob"],
            "users",
            "alice",
            ["bob"],
            False,
            [],
        ),
        # Group-scoped: one `GET /groups/{name}` per distinct group, no
        # `GET /users` list call.
        (
            ["read:users:name!group=team-x", "read:users:name!group=team-y"],
            "users",
            None,
            ["alice", "bob", "carol"],
            False,
            ["team-x", "team-y"],
        ),
        # Broad scope falls back to a single list call.
        (
            ["read:users:name"],
            "users",
            None,
            ["alice", "bob", "carol"],
            True,
            [],
        ),
        # No relevant scopes → empty, no calls.
        ([], "users", None, [], False, []),
        # Same logic for groups: explicit names, no list call.
        (
            ["read:groups:name!group=team-x", "read:groups:name!group=team-y"],
            "groups",
            None,
            ["team-x", "team-y"],
            False,
            [],
        ),
        # Broad groups scope → single list call.
        (
            ["read:groups:name"],
            "groups",
            None,
            ["team-x", "team-y"],
            True,
            [],
        ),
    ],
)
def test_resolve_share_targets(
    scopes, kind, current_name, expected, expect_list_call, group_calls
):
    hclient = MagicMock()
    hclient.get_users.return_value = [
        {"name": "alice"},
        {"name": "bob"},
        {"name": "carol"},
    ]
    hclient.get_groups.return_value = [
        {"name": "team-x"},
        {"name": "team-y"},
    ]
    members = {
        "team-x": {"name": "team-x", "users": ["alice", "bob"]},
        "team-y": {"name": "team-y", "users": ["bob", "carol"]},
    }
    hclient.get_group.side_effect = lambda name: members[name]

    result = _resolve_share_targets(hclient, scopes, kind, current_name)

    assert set(result) == set(expected)
    assert hclient.get_users.called is (expect_list_call and kind == "users")
    assert hclient.get_groups.called is (expect_list_call and kind == "groups")
    assert sorted(c.args[0] for c in hclient.get_group.call_args_list) == sorted(
        group_calls
    )
