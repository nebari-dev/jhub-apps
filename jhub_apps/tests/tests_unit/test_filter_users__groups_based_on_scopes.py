import pytest

from jhub_apps.hub_client.hub_client import filter_entity_based_on_scopes
from jhub_apps.hub_client.utils import is_jupyterhub_5


@pytest.mark.skipif(not is_jupyterhub_5(), reason="requires jupyterhub>=5")
@pytest.mark.parametrize("name,entity_key,scopes,entities,expected_entities", [
    (
            "permissions-for-some-users", "user",
            [
                "read:users:name!user=user_b",
                "read:users:name!user=user_c",
                "read:users:name!user=user_d",
                "read:users:name!user=user_f",
            ],
            ["user_a", "user_c", "user_d", "user_e"],
            ["user_c", "user_d"]
    ),
    (
            "generic-permission-for-all-users", "user",
            [
                "read:users:name",
            ],
            ["user_c", "user_a", "user_e", "user_d"],
            ["user_c", "user_a", "user_e", "user_d"]
    ),
    (
            "no-permissions-for-users", "user",
            [],
            ["user_a", "user_b"],
            []
    ),
    (
            "permissions-for-some-groups", "group",
            [
                "read:groups:name!group=group-x",
                "read:groups:name!group=group-b",
                "read:groups:name!group=group-c",
                "read:groups:name!group=group-y",
            ],
            ["group-a", "group-b", "group-c", "group-d"],
            ["group-b", "group-c"]
    ),
    (
            "permissions-for-no-groups", "group",
            [],
            ["group-a", "group-b", "group-c", "group-d"],
            []
    ),
])
def test_filter_users_based_on_scopes(name, entity_key, scopes, entities, expected_entities):
    filtered_entities = filter_entity_based_on_scopes(
        scopes=scopes,
        entities=entities,
        entity_key=entity_key
    )
    assert set(filtered_entities) == set(expected_entities)
