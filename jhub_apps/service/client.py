import os

import httpx
import structlog


logger = structlog.get_logger(__name__)


# a minimal alternative to using HubOAuth class
def get_client():
    base_url = os.environ["JUPYTERHUB_API_URL"]
    token = os.environ["JUPYTERHUB_API_TOKEN"]
    headers = {"Authorization": "Bearer %s" % token}
    # Increase timeout to handle hairpin NAT delays in local clusters (kind/k3d)
    timeout = httpx.Timeout(30.0, connect=30.0)
    logger.info("Creating httpx client", base_url=base_url, timeout=str(timeout))
    return httpx.AsyncClient(base_url=base_url, headers=headers, timeout=timeout)
