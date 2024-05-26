import pytest

from jhub_apps.hub_client.hub_client import filter_entity_based_on_scopes


@pytest.mark.parametrize("scopes,entities,entity_key,expected_entities", [
    ([
         "read:users:name!user=car",
         "read:users:name!user=foo",
         "read:users:name!user=bar",
     ], ["car", "alice", "sumit", "joe"], "user", ["car"]),
])
def test_filter_users_based_on_scopes(scopes, entities, entity_key, expected_entities):
    assert filter_entity_based_on_scopes(
        scopes=scopes,
        entities=entities,
        entity_key=entity_key
    ) == expected_entities
