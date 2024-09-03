import os
import pathlib
import tempfile
import typing
from pathlib import Path

import git
from pydantic import ValidationError
from starlette import status

from jhub_apps.service.models import Repository, InternalError, AppConfigFromGit
from jhub_apps.service.utils import logger, encode_file_to_data_url


def get_app_configuration_from_git(
        repository: Repository
) -> typing.Union[InternalError, AppConfigFromGit]:
    """Clones the git directory into a temporary path and extracts all the metadata
    about the app
    """
    # Moving this to top level import causes this problem:
    # https://github.com/jupyter/jupyter_events/issues/99
    from conda_project import CondaProject, CondaProjectError
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            logger.info("Trying to clone repository", repo_url=repository.url)
            git.Repo.clone_from(repository.url, temp_dir, depth=1, branch=repository.ref)
        except Exception as e:
            message = f"Repository clone failed: {repository.url}"
            logger.error(message, repo_url=repository.url)
            logger.error(e)
            return InternalError(status_code=status.HTTP_400_BAD_REQUEST, message=message)

        temp_dir_path = pathlib.Path(temp_dir)
        conda_project_dir = temp_dir_path / repository.config_directory

        if not conda_project_dir.exists():
            message = f"Path '{repository.config_directory}' doesn't exists in the repository."
            logger.error(message, repo_url=repository.url)
            return InternalError(status_code=status.HTTP_400_BAD_REQUEST, message=message)
        try:
            conda_project = CondaProject(temp_dir)
            # This is a private attribute, ideally we shouldn't access it,
            # but I haven't found an alternative way to get this
            conda_project_yaml = conda_project._project_file
        except CondaProjectError as e:
            message = "Invalid conda-project"
            logger.error(message)
            logger.exception(e)
            return InternalError(status_code=status.HTTP_400_BAD_REQUEST, message=message)

        jhub_apps_variables = {
            k.split("JHUB_APP_CONFIG_")[-1]: v for k, v in conda_project_yaml.variables.items()
            if k.startswith("JHUB_APP_CONFIG_")
        }
        environment_variables = {
            k: v for k, v in conda_project_yaml.variables.items()
            if not k.startswith("JHUB_APP_CONFIG_")
        }
        try:
            # Load YAML content into the Pydantic model
            app_config = AppConfigFromGit(**{
                **jhub_apps_variables,
                "environment": environment_variables,
                "url": repository.url
            })
        except ValidationError as e:
            message = f"Validation error: {e}"
            logger.error(message)
            return InternalError(status_code=status.HTTP_400_BAD_REQUEST, message=message)

        if app_config.thumbnail_path:
            thumbnail_path = Path(os.path.join(temp_dir, app_config.thumbnail_path))
            app_config.thumbnail = encode_file_to_data_url(
                filename=thumbnail_path.name, file_contents=thumbnail_path.read_bytes()
            )
        return app_config
