from jhub_apps.hub_client.hub_client import HubClient


def test_normalize_server_name():
    hub_client = HubClient()
    # test escaping
    assert hub_client.normalize_server_name("../../another-endpoint") == "another-endpoint"
    # Test long server name
    assert hub_client.normalize_server_name("x"*1000) == "x"*240
    # Test all special characters
    assert hub_client.normalize_server_name("server!@£$%^&*<>:~`±") == "server"
    # Replace space with dash
    assert hub_client.normalize_server_name("some server name") == "some-server-name"
    # lowercase
    assert hub_client.normalize_server_name("SOMESERVERNAME") == "someservername"
