import pytest

from jhub_apps.hub_client.hub_client import filter_entity_based_on_scopes
from jhub_apps.hub_client.utils import is_jupyterhub_5


@pytest.mark.skipif(not is_jupyterhub_5(), reason="requires jupyterhub>=5")
@pytest.mark.parametrize("scopes,entities,entity_key,expected_entities", [
    (
            [
                "read:users:name!user=car",
                "read:users:name!user=foo",
                "read:users:name!user=bar",
                "read:users:name!user=joe",
            ],
            ["car", "alice", "sumit", "joe"],
            "user",
            ["car", "joe"]
    ),
    (
            [
                "read:groups:name!group=group-x",
                "read:groups:name!group=group-b",
                "read:groups:name!group=group-c",
                "read:groups:name!group=group-y",
            ],
            ["group-a", "group-b", "group-c", "group-d"],
            "group",
            ["group-b", "group-c"]
    ),
])
def test_filter_users_based_on_scopes(scopes, entities, entity_key, expected_entities):
    filtered_entities = filter_entity_based_on_scopes(
        scopes=scopes,
        entities=entities,
        entity_key=entity_key
    )
    assert set(filtered_entities) == set(expected_entities)
