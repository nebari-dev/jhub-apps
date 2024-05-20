import base64
import itertools

import structlog
import os

from cachetools import cached, TTLCache
from unittest.mock import Mock

from jupyterhub.app import JupyterHub
from traitlets.config import LazyConfigValue

from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.spawner.types import FrameworkConf, FRAMEWORKS_MAPPING
from slugify import slugify


CACHE_JUPYTERHUB_CONFIG_TIMEOUT = 180
logger = structlog.get_logger(__name__)


# Cache JupyterHub config as it might be an expensive operation
@cached(cache=TTLCache(maxsize=1024, ttl=CACHE_JUPYTERHUB_CONFIG_TIMEOUT))
def get_jupyterhub_config():
    hub = JupyterHub()
    jhub_config_file_path = os.environ["JHUB_JUPYTERHUB_CONFIG"]
    logger.info(f"Getting JHub config from file: {jhub_config_file_path}")
    hub.load_config_file(jhub_config_file_path)
    config = hub.config
    logger.info(f"JHub Apps config: {config.JAppsConfig}")
    return config


def get_conda_envs(config, user):
    """This will extract conda environment from the JupyterHub config"""
    if isinstance(config.JAppsConfig.conda_envs, list):
        return config.JAppsConfig.conda_envs
    elif isinstance(config.JAppsConfig.conda_envs, LazyConfigValue):
        return []
    elif callable(config.JAppsConfig.conda_envs):
        try:
            logger.info("JAppsConfig.conda_envs is a callable, calling now..")
            return config.JAppsConfig.conda_envs(user)
        except Exception as e:
            logger.exception(e)
            return []
    else:
        raise ValueError(
            f"Invalid value for config.JAppsConfig.conda_envs: {config.JAppsConfig.conda_envs}"
        )


def get_fake_spawner_object(auth_state):
    fake_spawner = Mock()

    async def get_auth_state():
        return auth_state

    fake_spawner.user.get_auth_state = get_auth_state
    fake_spawner.log = logger
    return fake_spawner


def _slugify_profile_list(profile_list):
    # This is replicating the following:
    # https://github.com/jupyterhub/kubespawner/blob/a4b9b190f0335406c33c6de11b5d1b687842dd89/kubespawner/spawner.py#L3279
    # Since we are not inside spawner yet, the profiles might not be slugified yet
    if not profile_list:
        # empty profile lists are just returned
        return profile_list

    for profile in profile_list:
        # generate missing slug fields from display_name
        if 'slug' not in profile:
            profile['slug'] = slugify(profile['display_name'])
    return profile_list


async def get_spawner_profiles(config, auth_state=None):
    """This will extract spawner profiles from the JupyterHub config
    If the Spawner is KubeSpawner
    # See: https://jupyterhub-kubespawner.readthedocs.io/en/latest/spawner.html#kubespawner.KubeSpawner.profile_list
    """
    profile_list = config.KubeSpawner.profile_list
    if isinstance(profile_list, list):
        return config.KubeSpawner.profile_list
    elif isinstance(profile_list, LazyConfigValue):
        return []
    elif callable(profile_list):
        try:
            logger.info("config.KubeSpawner.profile_list is a callable, calling now..")
            profile_list = await profile_list(get_fake_spawner_object(auth_state))
            return _slugify_profile_list(profile_list)
        except Exception as e:
            logger.exception(e)
            return []
    else:
        raise ValueError(
            f"Invalid value for config.KubeSpawner.profile_list: {profile_list}"
        )


def encode_file_to_data_url(filename, file_contents):
    """Converts image file to data url to display in browser."""
    base64_encoded = base64.b64encode(file_contents)
    filename_ = filename.lower()
    if filename_.endswith(".jpg") or filename_.endswith(".jpeg"):
        mime_type = "image/jpeg"
    elif filename_.endswith('.svg'):
        mime_type = "image/svg+xml"
    else:
        file_extension = filename_.split('.')[-1]
        mime_type = f"image/{file_extension}"
    data_url = f"data:{mime_type};base64,{base64_encoded.decode('utf-8')}"
    return data_url


def get_default_thumbnail(framework_name):
    framework: FrameworkConf = FRAMEWORKS_MAPPING.get(framework_name)
    thumbnail_path = framework.logo_path
    return encode_file_to_data_url(
        filename=thumbnail_path.name, file_contents=thumbnail_path.read_bytes()
    )


async def get_thumbnail_data_url(framework_name, thumbnail):
    logger.info("Getting thumbnail data url", framework=framework_name)
    if thumbnail:
        logger.info("Got user provided thumbnail")
        thumbnail_contents = await thumbnail.read()
        thumbnail_data_url = encode_file_to_data_url(
            thumbnail.filename, thumbnail_contents
        )
    else:
        logger.info("Getting default thumbnail")
        framework: FrameworkConf = FRAMEWORKS_MAPPING.get(framework_name)
        thumbnail_path = framework.logo_path
        thumbnail_data_url = encode_file_to_data_url(
            filename=thumbnail_path.name, file_contents=thumbnail_path.read_bytes()
        )
    return thumbnail_data_url


def get_theme(config):
    """This will extract theme variables from the JupyterHub config"""
    if isinstance(config.JupyterHub.template_vars, dict):
        return config.JupyterHub.template_vars
    else:
        return None


def get_shared_servers(current_hub_user):
    # Filter servers shared with the user
    hub_client_service = HubClient()
    all_users_servers = list(itertools.chain.from_iterable([
        list(user['servers'].values()) for user in hub_client_service.get_users()
    ]))
    user_servers_without_default_jlab = list(filter(lambda server: server["name"] != "", all_users_servers))
    hub_client_user = HubClient(username=current_hub_user['name'])
    shared_servers = hub_client_user.get_shared_servers()
    shared_server_names = {shared_server["server"]["name"] for shared_server in shared_servers}
    shared_servers_rich = [
        server for server in user_servers_without_default_jlab
        if server["name"] in shared_server_names
    ]
    return shared_servers_rich
