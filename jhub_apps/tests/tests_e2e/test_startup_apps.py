def test_startup_apps(jupyterhub_manager):
    from jhub_apps.hub_client.hub_client import HubClient

    # get admin servers
    hc = HubClient(username="admin")
    admin_servers = hc.get_server("admin")

    expected_servernames = ["admin's-startup-server", "admin's-2nd-startup-server"]

    for servername in expected_servernames:
        normalized_servername = hc.normalize_server_name(servername)
        assert normalized_servername in admin_servers
