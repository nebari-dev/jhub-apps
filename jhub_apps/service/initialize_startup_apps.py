import asyncio
from itertools import groupby
import signal

import httpx
import structlog

from jhub_apps.configuration import FASTAPI_SERVICE_NAME
from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.service.models import StartupApp
from jhub_apps.service.utils import get_jupyterhub_config

logger = structlog.get_logger(__name__)


async def async_main():
    """
    Asynchronous main function.
    """
    try: 
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, lambda s=sig: asyncio.create_task(shutdown(s)))
  
        config = get_jupyterhub_config()
        startup_apps_list = config.JAppsConfig.startup_apps

        # Group user options by username
        grouped_user_options_list = groupby(startup_apps_list, lambda x: x.username)

        # wait til jhub app is ready with timeout
        jhub_apps_ready = False
        try:
            async with asyncio.timeout(15), httpx.AsyncClient() as client:
                while not jhub_apps_ready:
                    r = await client.get(f"http://{config.JAppsConfig.hub_host}:10202/services/{FASTAPI_SERVICE_NAME}/status")
                    if r.status_code == 200 and r.json()['status'] == 'ok':
                        jhub_apps_ready = True
                    await asyncio.sleep(0.5)
        except TimeoutError:
            logger.error("Timeout waiting for JHub Apps service to be ready")
        
        tasks = {}
        for username, user_apps_list in grouped_user_options_list:
            tasks[username] = asyncio.create_task(
                instantiate_startup_apps(
                    user_apps_list=list(user_apps_list), username=username
                )
            )

        # Await all tasks
        await asyncio.gather(*tasks.values())

        # check if all tasks are successful
        errors = []
        for username, task in tasks.items():
            if task.exception():
                e = task.exception()
                errors.append(e)
                logger.error(f"Error while instantiating startup apps for user \"{username}\": {e}")
        if errors:
            logger.error("Errors occurred while instantiating startup apps")
        
        logger.info("Finished instantiating startup apps")

        # run eternal sleep so jupyterhub doesn't restart the service
        while True: 
            await asyncio.sleep(60*60*24)
    except asyncio.CancelledError:
        logger.info("Shutdown requested")


async def instantiate_startup_apps(
    user_apps_list: list[StartupApp], username: str,
):
    # Let FastAPI continue to set up
    await asyncio.sleep(1)

    hub_client = HubClient(username=username)
    existing_servers = hub_client.get_server(username=username)
    for startup_app in user_apps_list:
        user_options = startup_app.user_options
        normalized_servername = startup_app.normalized_servername

        # delete server if it exists
        while normalized_servername in existing_servers:
            logger.info(f"Deleting server {normalized_servername}")
            status_code = hub_client.delete_server(
                username, normalized_servername, remove=True
            )
            await asyncio.sleep(1)
            existing_servers = hub_client.get_server(username=username)

        # create the server
        logger.info(f"Creating server {normalized_servername}")
        while normalized_servername not in existing_servers:
            status_code, servername = hub_client.create_server(
                username=username,
                servername=normalized_servername,
                user_options=user_options,
            )
            await asyncio.sleep(1)
            existing_servers = hub_client.get_server(username=username)

        # turn off the server
        logger.info(f"Stopping server {normalized_servername}")
        while not existing_servers[normalized_servername]["stopped"]:
            status_code = hub_client.delete_server(
                username, normalized_servername, remove=False
            )
            if status_code == 204:
                # server stopped successfully
                break
            await asyncio.sleep(1)
            existing_servers = hub_client.get_server(username=username)


async def shutdown(sig):
    logger.info(f"Received signal {sig.name}")
    for task in [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]:
        task.cancel()

if __name__ == "__main__":
    try:
        asyncio.run(async_main())
    except KeyboardInterrupt:
        pass