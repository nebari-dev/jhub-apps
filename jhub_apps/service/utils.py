import base64
import itertools

import structlog
import os

from cachetools import cached, TTLCache
from unittest.mock import Mock

from fastapi import HTTPException, status
from jupyterhub.app import JupyterHub
from traitlets.config import LazyConfigValue

from jhub_apps.config_utils import JAppsConfig
from jhub_apps.hub_client.hub_client import HubClient
from jhub_apps.service.models import UserOptions
from jhub_apps.spawner.types import FrameworkConf, FRAMEWORKS_MAPPING, FRAMEWORKS
from jhub_apps import themes
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
        return {**themes.DEFAULT_THEME, **config.JupyterHub.template_vars}
    return themes.DEFAULT_THEME


THEME_CSS_VARIABLES = {
    "font_family": ["--app-font-family", "--base-font-family", "--headings-font-family"],
    "h1_color": ["--heading-color"],
    "h2_color": ["--h2-color"],
    "text_color": ["--text-color", "--link-text-color"],
    "primary_color": ["--primary-color"],
    "primary_color_dark": ["--primary-color-dark"],
    "primary_color_light": ["--primary-color-light", "--primary-light"],
    "secondary_color": ["--secondary-color"],
    "secondary_color_dark": ["--secondary-color-dark", "--secondary-dark"],
    "accent_color": ["--accent-color", "--link-hover-color"],
    "accent_color_dark": ["--accent-color-dark"],
    "accent_text_color": ["--accent-text-color"],
    "navbar_color": ["--navbar-background-color"],
    "navbar_text_color": ["--navbar-text-color"],
    "navbar_hover_color": ["--navbar-hover-color"],
}

DEFAULT_CSS_VARIABLES = {
    "--font-size-base": "100%",
    "--line-height-base": "1.65",
    "--headings-line-height": "1.25",
    "--h1-font-size": "2rem",
    "--h2-font-size": "1.25rem",
    "--h3-font-size": "1rem",
    "--h4-font-size": "0.875rem",
    "--h5-font-size": "0.85rem",
    "--h6-font-size": "0.825rem",
    "--light-text-color": "#f1f1f6",
    "--danger-color": "#e60f66",
    "--danger-color-dark": "#b81a53",
    "--gray-color": "#EEEEEE",
    "--gray-color-dark": "#E0E0E0",
    "--blue-link-color": "#276BE9",
    "--button-hover-shadow": "0 3px 0 var(--text-color)",
    "--focus-width": "2px",
    "--focus-shadow": "5px 5px 7px rgba(0, 0, 0, 0.1)",
    "--outline-offset": "0.25rem",
    "--outline-reset": "1px solid transparent",
    "--text-decoration-thickness": "2px",
}


def get_theme_css_variables(theme):
    css_variables = dict(DEFAULT_CSS_VARIABLES)
    for theme_key, css_variable_names in THEME_CSS_VARIABLES.items():
        value = theme.get(theme_key)
        if value is None:
            continue
        for css_variable_name in css_variable_names:
            css_variables[css_variable_name] = str(value)
    return css_variables


def get_runtime_config(config):
    theme = get_theme(config)
    return {
        "theme": {
            "logo": theme.get("logo"),
            "favicon": theme.get("favicon"),
            "font": {
                "family": theme.get("font_family"),
                "url": theme.get("font_url"),
            },
            "colors": {
                "primary": theme.get("primary_color"),
                "primaryLight": theme.get("primary_color_light"),
                "primaryDark": theme.get("primary_color_dark"),
                "secondary": theme.get("secondary_color"),
                "secondaryDark": theme.get("secondary_color_dark"),
                "accent": theme.get("accent_color"),
                "accentDark": theme.get("accent_color_dark"),
                "text": theme.get("text_color"),
                "heading": theme.get("h1_color"),
                "heading2": theme.get("h2_color"),
                "navbar": theme.get("navbar_color"),
                "navbarText": theme.get("navbar_text_color"),
                "navbarHover": theme.get("navbar_hover_color"),
            },
            "cssVariables": get_theme_css_variables(theme),
        },
        "version": str(theme.get("version", "")),
    }


def get_theme_css(config):
    """Render the runtime theme as a CSS stylesheet for server-rendered pages.

    The React app applies theme variables at runtime (ui/src/utils/theme.ts),
    but JupyterHub's server-rendered pages (admin, tokens, spawn, login) never
    load React. This emits the same theme as a plain stylesheet — a font
    @import plus a :root block of CSS custom properties — served at
    /services/japps/theme.css and consumed by jhub_apps/static/css/hub.css.
    """
    theme = get_theme(config)
    css_variables = get_theme_css_variables(theme)
    lines = []
    font_url = theme.get("font_url")
    if font_url:
        # @import must precede all other rules in a stylesheet.
        lines.append(f"@import url('{font_url}');")
    lines.append(":root {")
    for name, value in css_variables.items():
        lines.append(f"    {name}: {value};")
    lines.append("}")
    return "\n".join(lines) + "\n"


def get_shared_servers(current_hub_user):
    # Filter servers shared with the user
    hub_client_service = HubClient()
    all_users_servers = list(itertools.chain.from_iterable([
        list(user['servers'].values()) for user in hub_client_service.get_users()
    ]))
    user_servers_without_default_jlab = list(filter(lambda server: server["name"] != "", all_users_servers))
    hub_client_user = HubClient(username=current_hub_user['name'])
    shared_servers = hub_client_user.get_shared_servers()
    shared_server_names = {
        shared_server["server"]["name"] for shared_server in shared_servers
        # remove shared apps by current user
        if shared_server["server"]["user"]["name"] != current_hub_user['name']
    }
    shared_servers_rich = [
        server for server in user_servers_without_default_jlab
        if server["name"] in shared_server_names
    ]
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
