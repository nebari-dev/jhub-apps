import base64
import os
from concurrent.futures import ThreadPoolExecutor

import structlog

from cachetools import cached, TTLCache
from unittest.mock import Mock

from fastapi import HTTPException, status
from jupyterhub.app import JupyterHub
from traitlets.config import LazyConfigValue

from jhub_apps.config_utils import JAppsConfig
from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.service.models import UserOptions
from jhub_apps.spawner.types import FrameworkConf, FRAMEWORKS_MAPPING, FRAMEWORKS
from slugify import slugify


CACHE_JUPYTERHUB_CONFIG_TIMEOUT = 180
logger = structlog.get_logger(__name__)

def _replace_JAppsConfig_config_with_validated_config(config, validated_config):
    """Replace config attributes with instantiated/validated attributes.
    
    This is a hack. Instead we could use JHubAppsConfig.instance() whenever 
    JHubAppsConfig is needed except for code which runs in the same process 
    as JupyterHub (e.g. spawner_creation.py, install_jhub_apps fn).
    
    Args:
        config: Original config object
        validated_config: Config object with validated attributes
    """
    trait_names = validated_config.trait_names()
    for trait_name in trait_names:
        setattr(config, trait_name, getattr(validated_config, trait_name))


# Cache JupyterHub config as it might be an expensive operation
@cached(cache=TTLCache(maxsize=1024, ttl=CACHE_JUPYTERHUB_CONFIG_TIMEOUT))
def get_jupyterhub_config():
    hub = JupyterHub()
    jhub_config_file_path = os.environ["JHUB_JUPYTERHUB_CONFIG"]
    logger.info(f"Getting JHub config from file: {jhub_config_file_path}")
    hub.load_config_file(jhub_config_file_path)
    japps_config = JAppsConfig.instance(config=hub.config)
    _replace_JAppsConfig_config_with_validated_config(hub.config.JAppsConfig, japps_config)
    config = hub.config
    logger.debug(f"JHub Apps config: {config.JAppsConfig}")
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


def encode_file_to_data_url(filename, file_contents) -> str:
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


def get_default_thumbnail(framework_name) -> str:
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
    """Return the full server records for servers shared with the current user.

    The hub's `GET /users/{me}/shared` returns a Share-shaped object that
    only carries a `SharedServer` subset (name, url, ready, owner.name) —
    not the `user_options` the UI needs to render an app card. To enrich,
    we fetch each *unique grantor's* user record (which includes their
    rich Server records) in parallel, then filter to the shared names.

    Previously this function called `HubClient.get_users()`, which fetches
    every user on the cluster with `include_stopped_servers=True`. On a
    typical Nebari deployment that's an O(users * servers) JSON payload
    pulled on every /server/ GET. This version scales with the number of
    distinct people who have shared something with you (usually <10),
    not with cluster size.
    """
    hub_client_user = HubClient(username=current_hub_user["name"])
    shares = hub_client_user.get_shared_servers()

    # Group shared server names by owner, excluding any shares whose owner
    # is the current user (those are returned via `user_apps` already).
    owner_to_servernames: dict[str, set[str]] = {}
    for share in shares:
        owner = share["server"]["user"]["name"]
        if owner == current_hub_user["name"]:
            continue
        owner_to_servernames.setdefault(owner, set()).add(share["server"]["name"])

    if not owner_to_servernames:
        return []

    # Fan out one `GET /users/{owner}` per unique grantor. The service token
    # already has `read:users` so we don't mint anything per call. Bounded
    # to 10 workers so we don't stampede the hub if a user is in many shares.
    owners = list(owner_to_servernames)
    with ThreadPoolExecutor(max_workers=min(10, len(owners))) as ex:
        owner_users = list(ex.map(hub_client_user.get_user, owners))

    shared_servers_rich = []
    for owner_user in owner_users:
        wanted = owner_to_servernames.get(owner_user["name"], set())
        for server in owner_user["servers"].values():
            if server["name"] in wanted:
                shared_servers_rich.append(server)
    return shared_servers_rich


def _check_if_framework_allowed(user_options: UserOptions):
    """Checks if spinning up apps via the provided framework is allowed.
    """
    config = get_jupyterhub_config()
    allowed_frameworks = _get_allowed_frameworks(config)
    if user_options.framework not in allowed_frameworks:
        raise HTTPException(
            detail=f'Given framework "{user_options.framework}" is not allowed on this deployment, '
                   f"please contact admin.",
            status_code=status.HTTP_403_FORBIDDEN,
        )


def _get_allowed_frameworks(config):
    """Given the JupyterHub config, find out allowed frameworks."""
    all_frameworks = {framework.name for framework in FRAMEWORKS}
    allowed_frameworks = all_frameworks
    if config.JAppsConfig.allowed_frameworks is not None:
        allowed_frameworks_by_admin = set(config.JAppsConfig.allowed_frameworks)
        allowed_frameworks = all_frameworks.intersection(allowed_frameworks_by_admin)
    if config.JAppsConfig.blocked_frameworks is not None:
        blocked_frameworks_by_admin = set(config.JAppsConfig.blocked_frameworks)
        allowed_frameworks -= blocked_frameworks_by_admin
    return allowed_frameworks
