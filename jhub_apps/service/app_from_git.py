import os
import signal
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.parse import urlparse

from fastapi import HTTPException, status
from pydantic import ValidationError

from jhub_apps.service.models import Repository, JHubAppConfig
from jhub_apps.service.utils import logger, encode_file_to_data_url

# The clone runs inside the hub, so only network remotes are allowed:
# file:// and local paths would clone repositories from the hub's own filesystem.
ALLOWED_REPOSITORY_URL_SCHEMES = ("git", "http", "https", "ssh")

# Limits for the clone, which holds a worker thread and the hub's disk while it runs.
# The service only needs the repository's config and thumbnail.
CLONE_TIMEOUT_SECONDS = 60
MAX_CLONE_SIZE_BYTES = 100 * 1024 * 1024
CLONE_POLL_INTERVAL_SECONDS = 0.1

# conda-project reads one of these from the repository root.
CONDA_PROJECT_FILENAMES = (
    "conda-project.yml",
    "conda-project.yaml",
    "environment.yml",
    "environment.yaml",
)

ALLOWED_THUMBNAIL_EXTENSIONS = (
    ".avif", ".bmp", ".gif", ".ico", ".jpeg", ".jpg", ".png", ".svg", ".webp"
)
# Same limit as a thumbnail uploaded through the UI
MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024


def _bad_request(message: str, repository: Repository):
    logger.error(message, repo_url=repository.url)
    return HTTPException(detail=message, status_code=status.HTTP_400_BAD_REQUEST)


def _resolve_path_in_repository(
        path: str, repository: Repository, temp_dir: str
) -> Path:
    """Resolve a repository-supplied path inside the clone, following symlinks.

    Absolute paths, `..` and symlinks that lead out of the clone are refused,
    so the repository can't make the service read files from the hub.
    """
    repo_root = Path(temp_dir).resolve()
    try:
        resolved = (repo_root / path).resolve()
    except (OSError, RuntimeError, ValueError):
        # a symlink loop on Python < 3.13, or a NUL byte in the path
        resolved = None
    if resolved is None or not resolved.is_relative_to(repo_root):
        raise _bad_request(f"Path '{path}' must be inside the repository.", repository)
    return resolved


def _check_repository_url(repository: Repository):
    try:
        parsed_url = urlparse(repository.url)
        valid = parsed_url.scheme in ALLOWED_REPOSITORY_URL_SCHEMES and bool(parsed_url.hostname)
    except ValueError:
        valid = False
    if not valid:
        schemes = ", ".join(f"{scheme}://" for scheme in ALLOWED_REPOSITORY_URL_SCHEMES)
        raise _bad_request(f"Repository URL must be a {schemes} URL with a host.", repository)


class CloneLimitExceeded(Exception):
    pass


def _directory_size(path: str) -> int:
    size = 0
    for root, _, files in os.walk(path):
        for name in files:
            try:
                size += os.lstat(os.path.join(root, name)).st_size
            except OSError:
                # git removed or renamed it since the walk listed it
                pass
    return size


def _run_git_clone(command: list, temp_dir: str):
    """Run a `git clone` into temp_dir, killing it if it exceeds the time or size limit"""
    deadline = time.monotonic() + CLONE_TIMEOUT_SECONDS
    with tempfile.TemporaryFile() as stderr:
        process = subprocess.Popen(
            command,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=stderr,
            env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
            # own process group, so a kill also stops git's helpers (remote-https, index-pack)
            start_new_session=True,
        )
        try:
            while True:
                finished = process.poll() is not None
                if _directory_size(temp_dir) > MAX_CLONE_SIZE_BYTES:
                    raise CloneLimitExceeded(
                        f"Repository is larger than {MAX_CLONE_SIZE_BYTES // (1024 * 1024)} MB"
                    )
                if finished:
                    break
                if time.monotonic() > deadline:
                    raise CloneLimitExceeded(
                        f"Repository clone took longer than {CLONE_TIMEOUT_SECONDS} seconds"
                    )
                time.sleep(CLONE_POLL_INTERVAL_SECONDS)
        finally:
            if process.poll() is None:
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                process.wait()
        if process.returncode != 0:
            stderr.seek(0)
            raise RuntimeError(stderr.read().decode(errors="replace").strip())


def _clone_repo(repository: Repository, temp_dir):
    """Clone repository to the given tem_dir"""
    _check_repository_url(repository)
    command = [
        "git", "clone", "--depth=1", f"--branch={repository.ref}", "--", repository.url, temp_dir
    ]
    try:
        logger.info("Trying to clone repository", repo_url=repository.url)
        _run_git_clone(command, temp_dir)
    except CloneLimitExceeded as e:
        raise _bad_request(f"{e}: {repository.url}", repository)
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
        for filename in CONDA_PROJECT_FILENAMES:
            _resolve_path_in_repository(filename, repository, temp_dir)
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
        thumbnail_base64 = _read_thumbnail_from_repository(
            thumbnail_path_from_config, repository, temp_dir
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


def _read_thumbnail_from_repository(
        thumbnail_path: str, repository: Repository, temp_dir: str
) -> str:
    """Read the thumbnail image from the cloned repository as a data url"""
    path = _resolve_path_in_repository(thumbnail_path, repository, temp_dir)
    filename = Path(thumbnail_path).name
    if not path.is_file() or Path(filename).suffix.lower() not in ALLOWED_THUMBNAIL_EXTENSIONS:
        raise _bad_request(
            f"Thumbnail '{thumbnail_path}' must be an image file in the repository "
            f"({', '.join(ALLOWED_THUMBNAIL_EXTENSIONS)}).",
            repository,
        )
    if path.stat().st_size > MAX_THUMBNAIL_SIZE_BYTES:
        raise _bad_request(
            f"Thumbnail '{thumbnail_path}' is larger than "
            f"{MAX_THUMBNAIL_SIZE_BYTES // (1024 * 1024)} MB.",
            repository,
        )
    return encode_file_to_data_url(filename=filename, file_contents=path.read_bytes())


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
    conda_project_dir = _resolve_path_in_repository(
        repository.config_directory, repository, temp_dir
    )
    if not conda_project_dir.exists():
        message = f"Path '{repository.config_directory}' doesn't exists in the repository."
        logger.error(message, repo_url=repository.url)
        raise HTTPException(
            detail=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )
