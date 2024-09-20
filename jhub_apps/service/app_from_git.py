import os
import pathlib
import tempfile
from pathlib import Path

import git
from fastapi import HTTPException, status
from pydantic import ValidationError

from jhub_apps.service.models import Repository, JHubAppConfig
from jhub_apps.service.utils import logger, encode_file_to_data_url


def _clone_repo(repository: Repository, temp_dir):
    """Clone repository to the given tem_dir"""
    try:
        logger.info("Trying to clone repository", repo_url=repository.url)
        git.Repo.clone_from(repository.url, temp_dir, depth=1, branch=repository.ref)
    except Exception as e:
        message = f"Repository clone failed: {repository.url}"
        logger.error(message, repo_url=repository.url)
        logger.error(e)
        raise HTTPException(
            detail=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


def _get_app_configuration_from_git(
        repository: Repository
) -> JHubAppConfig:
    """Clones the git directory into a temporary path and extracts all the metadata
    about the app from conda-project's config yaml.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        _clone_repo(repository, temp_dir)
        _check_conda_project_config_directory_exists(repository, temp_dir)
        conda_project_yaml = _get_conda_project_config_yaml(temp_dir)
        jhub_apps_config_dict = _extract_jhub_apps_config_from_conda_project_config(conda_project_yaml)
        app_config = _load_jhub_app_config_to_pydantic_model(
            jhub_apps_config_dict,
            repository,
            temp_dir
        )
        return app_config


def _load_jhub_app_config_to_pydantic_model(
        jhub_apps_config_dict: dict, repository: Repository, temp_dir: str
):
    """Load the parsed jhub-apps config into pydantic model for validation"""
    thumbnail_base64 = ""
    thumbnail_path_from_config = jhub_apps_config_dict.get("thumbnail_path")
    if thumbnail_path_from_config:
        thumbnail_path = Path(os.path.join(temp_dir, thumbnail_path_from_config))
        thumbnail_base64 = encode_file_to_data_url(
            filename=thumbnail_path.name, file_contents=thumbnail_path.read_bytes()
        )
    try:
        # Load YAML content into the Pydantic model
        app_config = JHubAppConfig(**{
            **jhub_apps_config_dict,
            "repository": repository,
            "thumbnail": thumbnail_base64,
            "env": jhub_apps_config_dict.get("environment", {})
        })
    except ValidationError as e:
        message = f"Validation error: {e}"
        logger.error(message)
        raise HTTPException(
            detail=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    return app_config


def _extract_jhub_apps_config_from_conda_project_config(conda_project_yaml):
    """Extracts jhub-apps app config from conda project yaml's config"""
    jhub_apps_variables = {
        k.split("JHUB_APP_CONFIG_")[-1]: v for k, v in conda_project_yaml.variables.items()
        if k.startswith("JHUB_APP_CONFIG_")
    }
    environment_variables = {
        k: v for k, v in conda_project_yaml.variables.items()
        if not k.startswith("JHUB_APP_CONFIG_")
    }
    return {
        **jhub_apps_variables,
        "environment": environment_variables
    }


def _get_conda_project_config_yaml(directory: str):
    """Given the directory, get conda project config object"""
    # Moving this to top level import causes this problem:
    # https://github.com/jupyter/jupyter_events/issues/99
    from conda_project import CondaProject, CondaProjectError
    from conda_project.project_file import CondaProjectYaml
    try:
        conda_project = CondaProject(directory)
        # This is a private attribute, ideally we shouldn't access it,
        # but I haven't found an alternative way to get this
        conda_project_yaml: CondaProjectYaml = conda_project._project_file
    except CondaProjectError as e:
        message = "Invalid conda-project"
        logger.error(message)
        logger.exception(e)
        raise HTTPException(
            detail=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    return conda_project_yaml


def _check_conda_project_config_directory_exists(repository: Repository, temp_dir: str):
    """Check if the conda project config directory provided by the user exists"""
    temp_dir_path = pathlib.Path(temp_dir)
    conda_project_dir = temp_dir_path / repository.config_directory
    if not conda_project_dir.exists():
        message = f"Path '{repository.config_directory}' doesn't exists in the repository."
        logger.error(message, repo_url=repository.url)
        raise HTTPException(
            detail=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )
