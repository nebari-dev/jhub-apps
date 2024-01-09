import base64
import logging
import os
from unittest.mock import Mock

import requests
from jupyterhub.app import JupyterHub
from traitlets.config import LazyConfigValue

from jhub_apps.spawner.types import FrameworkConf, FRAMEWORKS_MAPPING
from slugify import slugify


logger = logging.getLogger(__name__)


def get_jupyterhub_config():
    hub = JupyterHub()
    jhub_config_file_path = os.environ["JHUB_JUPYTERHUB_CONFIG"]
    logger.info(f"Getting JHub config from file: {jhub_config_file_path}")
    hub.load_config_file(jhub_config_file_path)
    config = hub.config
    logger.info(f"JApps config: {config.JAppsConfig}")
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
    thumbnail_url = framework.logo
    if thumbnail_url.startswith("/"):
        base_url = os.environ["PUBLIC_HOST"]
        thumbnail_url = f"{base_url}{thumbnail_url}"
    try:
        response = requests.get(thumbnail_url)
    except Exception as e:
        logger.info(f"Unable to fetch thumbnail from url: {thumbnail_url}:")
        logger.exception(e)
        return
    if response.status_code == 200:
        thumbnail_content = response.content
        thumbnail_filename = thumbnail_url.split("/")[-1]
        return encode_file_to_data_url(filename=thumbnail_filename, file_contents=thumbnail_content)


async def get_thumbnail_data_url(framework_name, thumbnail):
    if thumbnail:
        thumbnail_contents = await thumbnail.read()
        thumbnail_data_url = encode_file_to_data_url(
            thumbnail.filename, thumbnail_contents
        )
    else:
        thumbnail_data_url = get_default_thumbnail(framework_name)
    return thumbnail_data_url
