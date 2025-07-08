import functools
import time
import logging

logger = logging.getLogger(__name__)

def retry_test(max_attempts=5, delay=1):
    def decorator(test_func):
        @functools.wraps(test_func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    logger.info(f"Attempt {attempt + 1}/{max_attempts} for {test_func.__name__}")
                    result = test_func(*args, **kwargs)
                    return result
                except AssertionError as e:
                    last_exception = e
                    logger.warning(f"Attempt {attempt + 1} failed: {e}")
                    if attempt < max_attempts - 1:
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator


def test_startup_apps(jupyterhub_manager):
    from jhub_apps.hub_client.hub_client import HubClient

    # get admin servers
    hc = HubClient(username="admin")

    expected_servernames = [hc.normalize_server_name(name) for name in["admin's-startup-server", "admin's-2nd-startup-server"]]

    # retry is a hack since we don't have a way to tell when the startup servers are ready at the moment
    @retry_test()
    def check_for_servernames(hc, expected_servernames):
        admin_servers = hc.get_server("admin")

        for servername in expected_servernames:
            assert servername in admin_servers

    check_for_servernames(hc, expected_servernames)
