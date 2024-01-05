import base64
import os

from jupyterhub.app import JupyterHub
from traitlets.config import LazyConfigValue


def get_jupyterhub_config():
    hub = JupyterHub()
    jhub_config_file_path = os.environ["JHUB_JUPYTERHUB_CONFIG"]
    print(f"Getting JHub config from file: {jhub_config_file_path}")
    hub.load_config_file(jhub_config_file_path)
    config = hub.config
    print(f"JHub config from file: {config}")
    print(f"JApps config: {config.JAppsConfig}")
    return config


def get_conda_envs(config):
    """This will extract conda environment from the JupyterHub config"""
    if isinstance(config.JAppsConfig.conda_envs, list):
        return config.JAppsConfig.conda_envs
    elif isinstance(config.JAppsConfig.conda_envs, LazyConfigValue):
        return []
    elif callable(config.JAppsConfig.conda_envs):
        return config.JAppsConfig.conda_envs()
    else:
        raise ValueError(
            f"Invalid value for config.JAppsConfig.conda_envs: {config.JAppsConfig.conda_envs}"
        )


def get_spawner_profiles(config):
    """This will extract spawner profiles from the JupyterHub config
    If the Spawner is KubeSpawner
    """
    profile_list = config.KubeSpawner.profile_list
    if isinstance(profile_list, list):
        return config.KubeSpawner.profile_list
    elif isinstance(profile_list, LazyConfigValue):
        return []
    elif callable(profile_list):
        return profile_list()
    else:
        raise ValueError(
            f"Invalid value for config.KubeSpawner.profile_list: {profile_list}"
        )


def encode_file_to_data_url(filename, file_contents):
    """Converts image file to data url to display in browser."""
    base64_encoded = base64.b64encode(file_contents)
    filename_ = filename.lower()
    mime_type = "image/png"
    if filename_.endswith(".jpg") or filename_.endswith(".jpeg"):
        mime_type = "image/jpeg"
    data_url = f"data:{mime_type};base64,{base64_encoded.decode('utf-8')}"
    return data_url
