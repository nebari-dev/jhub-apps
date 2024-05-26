from jhub_apps.hub_client.hub_client import filter_entity_based_on_scopes


def test_filter_users_based_on_scopes():
    user_scopes = [
        "read:users:name!user=car",
        "read:users:name!user=foo",
        "read:users:name!user=bar",
    ]
    assert filter_entity_based_on_scopes(
        scopes=user_scopes,
        entities=["car", "alice", "sumit", "joe"]
    ) == ["car"]
