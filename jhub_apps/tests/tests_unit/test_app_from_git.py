import asyncio
import base64
import os
import shutil
import subprocess
import sys
import time
from unittest.mock import Mock, patch

import pytest
from fastapi import HTTPException

from jhub_apps.service.app_from_git import (
    MAX_THUMBNAIL_SIZE_BYTES,
    CloneLimitExceeded,
    _check_conda_project_config_directory_exists,
    _clone_repo,
    _extract_jhub_apps_config_from_conda_project_config,
    _get_app_configuration_from_git,
    _load_jhub_app_config_to_pydantic_model,
    _run_git_clone,
)
from jhub_apps.service.models import JHubAppConfig, Repository


def test_extract_jhub_apps_config_from_conda_project_config():
    conda_project_yaml = Mock(variables={
        "JHUB_APP_CONFIG_name": "My Panel App (Git)",
        "JHUB_APP_CONFIG_description": "This is a panel app created from git repository",
        "JHUB_APP_CONFIG_framework": "panel",
        "JHUB_APP_CONFIG_filepath": "panel_basic.py",
        "JHUB_APP_CONFIG_keep_alive": "false",
        "JHUB_APP_CONFIG_public": "false",
        "JHUB_APP_CONFIG_thumbnail_path": "panel.png",
        "SOMETHING_FOO": "bar",
        "SOMETHING_BAR": "beta",
    })
    jhub_apps_config = _extract_jhub_apps_config_from_conda_project_config(conda_project_yaml)
    assert jhub_apps_config == {
        "name": "My Panel App (Git)",
        "description": "This is a panel app created from git repository",
        "framework": "panel",
        "filepath": "panel_basic.py",
        "keep_alive": "false",
        "public": "false",
        "thumbnail_path": "panel.png",
        "environment": {
            "SOMETHING_FOO": "bar",
            "SOMETHING_BAR": "beta",
        }
    }


SECRET = b"hub-only secret"
PNG_BYTES = b"\x89PNG\r\n\x1a\n not really a png"


@pytest.fixture
def hub_and_repo(tmp_path):
    """A file outside the clone (standing in for one on the hub) and an empty clone dir"""
    outside = tmp_path / "hub"
    outside.mkdir()
    (outside / "secret.png").write_bytes(SECRET)
    (outside / "secret").write_bytes(SECRET)
    repo = tmp_path / "clone"
    repo.mkdir()
    return outside, repo


def _load_with_thumbnail(thumbnail_path, repo):
    return _load_jhub_app_config_to_pydantic_model(
        {
            "display_name": "App",
            "description": "description",
            "thumbnail_path": thumbnail_path,
            "environment": {},
        },
        Repository(url="https://example.com/org/repo.git"),
        str(repo),
    )


def test_thumbnail_from_repository(hub_and_repo):
    _, repo = hub_and_repo
    (repo / "images").mkdir()
    (repo / "images" / "thumb.png").write_bytes(PNG_BYTES)
    os.symlink("images/thumb.png", repo / "link.png")
    os.symlink("images/thumb.png", repo / "logo")
    os.symlink("logo", repo / "logo.png")

    for thumbnail_path in ("images/thumb.png", "link.png", "logo.png"):
        app_config = _load_with_thumbnail(thumbnail_path, repo)
        assert app_config.thumbnail == (
            f"data:image/png;base64,{base64.b64encode(PNG_BYTES).decode()}"
        )


@pytest.mark.parametrize("make_thumbnail_path", [
    pytest.param(lambda outside, repo: str(outside / "secret.png"), id="absolute"),
    pytest.param(lambda outside, repo: "../hub/secret.png", id="dotdot"),
    pytest.param(lambda outside, repo: "images/../../hub/secret.png", id="nested-dotdot"),
    pytest.param(
        lambda outside, repo: os.symlink(outside / "secret.png", repo / "thumb.png") or "thumb.png",
        id="symlink-out",
    ),
    pytest.param(
        lambda outside, repo: os.symlink(outside, repo / "images") or "images/secret.png",
        id="symlinked-dir-out",
    ),
    pytest.param(
        lambda outside, repo: os.symlink("loop.png", repo / "loop.png") or "loop.png",
        id="symlink-loop",
    ),
    pytest.param(lambda outside, repo: "thumb\x00.png", id="nul-byte"),
])
def test_thumbnail_outside_repository_is_refused(hub_and_repo, make_thumbnail_path):
    outside, repo = hub_and_repo
    thumbnail_path = make_thumbnail_path(outside, repo)
    with pytest.raises(HTTPException) as exc_info:
        _load_with_thumbnail(thumbnail_path, repo)
    assert exc_info.value.status_code == 400
    # Python 3.13+ resolves a symlink loop without raising, leaving a path that isn't a file
    assert (
        "must be inside the repository" in exc_info.value.detail
        or "must be an image file" in exc_info.value.detail
    )
    assert base64.b64encode(SECRET).decode() not in exc_info.value.detail


@pytest.mark.parametrize("thumbnail_path", [
    "missing.png",
    "notes.txt",
    "images",
    ".git/config",
])
def test_thumbnail_must_be_an_image_file(hub_and_repo, thumbnail_path):
    _, repo = hub_and_repo
    (repo / "notes.txt").write_text("not an image")
    (repo / "images").mkdir()
    (repo / ".git").mkdir()
    (repo / ".git" / "config").write_text("[core]")
    with pytest.raises(HTTPException) as exc_info:
        _load_with_thumbnail(thumbnail_path, repo)
    assert exc_info.value.status_code == 400
    assert "must be an image file" in exc_info.value.detail


def test_thumbnail_size_is_capped(hub_and_repo):
    _, repo = hub_and_repo
    with open(repo / "huge.png", "wb") as f:
        f.truncate(MAX_THUMBNAIL_SIZE_BYTES + 1)
    with pytest.raises(HTTPException) as exc_info:
        _load_with_thumbnail("huge.png", repo)
    assert exc_info.value.status_code == 400
    assert "is larger than" in exc_info.value.detail


@pytest.mark.parametrize("config_directory, detail", [
    ("/", "Path '/' must be inside the repository."),
    ("..", "Path '..' must be inside the repository."),
    ("a\x00b", "Path 'a\x00b' must be inside the repository."),
    ("missing", "Path 'missing' doesn't exists in the repository."),
])
def test_config_directory_must_be_inside_repository(hub_and_repo, config_directory, detail):
    _, repo = hub_and_repo
    repository = Repository(url="https://example.com/org/repo.git", config_directory=config_directory)
    with pytest.raises(HTTPException) as exc_info:
        _check_conda_project_config_directory_exists(repository, str(repo))
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == detail


@pytest.mark.parametrize("url", [
    "file:///srv/repo",
    "/srv/repo",
    "./repo",
    "git@github.com:org/repo.git",
    "ext::sh -c touch% /tmp/pwned",
    "https:///no-host",
    "https://@/org/repo",
    "https://:80/org/repo",
    "https://[::1/org/repo",
])
@patch("jhub_apps.service.app_from_git._run_git_clone")
def test_clone_refuses_non_network_urls(run_git_clone, url, tmp_path):
    with pytest.raises(HTTPException) as exc_info:
        _clone_repo(Repository(url=url), str(tmp_path))
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail.startswith("Repository URL must be a git://")
    run_git_clone.assert_not_called()


@pytest.mark.parametrize("url", [
    "https://github.com/nebari-dev/jhub-apps-from-git-repo-example.git",
    "http://git.example.com/org/repo",
    "git://10.0.0.1:9418/repo",
    "ssh://git@github.com/org/repo.git",
])
@patch("jhub_apps.service.app_from_git._run_git_clone")
def test_clone_allows_network_urls(run_git_clone, url, tmp_path):
    _clone_repo(Repository(url=url), str(tmp_path))
    run_git_clone.assert_called_once_with(
        ["git", "clone", "--depth=1", "--branch=main", "--", url, str(tmp_path)], str(tmp_path)
    )


@pytest.mark.parametrize("error, detail", [
    (CloneLimitExceeded("Repository is larger than 100 MB"),
     "Repository is larger than 100 MB: https://example.com/org/repo.git"),
    (RuntimeError("fatal: repository not found"),
     "Repository clone failed: https://example.com/org/repo.git"),
])
@patch("jhub_apps.service.app_from_git._run_git_clone")
def test_clone_errors_are_bad_requests(run_git_clone, error, detail, tmp_path):
    run_git_clone.side_effect = error
    with pytest.raises(HTTPException) as exc_info:
        _clone_repo(Repository(url="https://example.com/org/repo.git"), str(tmp_path))
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == detail


def test_run_git_clone_clones_the_branch(tmp_path):
    source = tmp_path / "source"
    source.mkdir()
    git = ["git", "-c", "user.name=test", "-c", "user.email=test@example.com", "-c", "commit.gpgsign=false"]
    subprocess.run(git + ["init", "-q", "-b", "main"], cwd=source, check=True)
    (source / "conda-project.yml").write_text("name: app\n")
    subprocess.run(git + ["add", "-A"], cwd=source, check=True)
    subprocess.run(git + ["commit", "-q", "-m", "app"], cwd=source, check=True)
    clone = tmp_path / "clone"
    clone.mkdir()
    _run_git_clone(
        ["git", "clone", "--depth=1", "--branch=main", "--", str(source), str(clone)], str(clone)
    )
    assert (clone / "conda-project.yml").read_text() == "name: app\n"


def test_run_git_clone_reports_git_errors(tmp_path):
    with pytest.raises(RuntimeError, match="no such repo"):
        _run_git_clone(
            [sys.executable, "-c", "import sys; sys.exit('no such repo')"], str(tmp_path)
        )


@patch("jhub_apps.service.app_from_git.CLONE_TIMEOUT_SECONDS", 0.5)
def test_run_git_clone_is_killed_after_the_timeout(tmp_path):
    """The clone and anything it started are killed, e.g. git's remote helpers"""
    child_pid_file = tmp_path / "child.pid"
    clone = tmp_path / "clone"
    clone.mkdir()
    script = (
        "import subprocess, sys, time;"
        "child = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(60)']);"
        "open(sys.argv[1], 'w').write(str(child.pid));"
        "time.sleep(60)"
    )
    started = time.monotonic()
    with pytest.raises(CloneLimitExceeded, match="took longer than 0.5 seconds"):
        _run_git_clone([sys.executable, "-c", script, str(child_pid_file)], str(clone))
    assert time.monotonic() - started < 10
    child_pid = int(child_pid_file.read_text())
    for _ in range(50):
        if not _process_running(child_pid):
            break
        time.sleep(0.1)
    assert not _process_running(child_pid)


def _process_running(pid):
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    # a killed child waits as a zombie until its new parent reaps it
    status = subprocess.run(["ps", "-o", "stat=", "-p", str(pid)], capture_output=True, text=True)
    return bool(status.stdout.strip()) and not status.stdout.strip().startswith("Z")


@pytest.mark.parametrize("then", ["time.sleep(60)", "pass"], ids=["still-running", "finished"])
@patch("jhub_apps.service.app_from_git.MAX_CLONE_SIZE_BYTES", 1024 * 1024)
def test_run_git_clone_is_refused_above_the_size_cap(tmp_path, then):
    script = f"import sys, time; open(sys.argv[1] + '/big', 'wb').write(bytes(2 * 1024 * 1024)); {then}"
    started = time.monotonic()
    with pytest.raises(CloneLimitExceeded, match="larger than 1 MB"):
        _run_git_clone([sys.executable, "-c", script, str(tmp_path)], str(tmp_path))
    assert time.monotonic() - started < 10


@patch("jhub_apps.service.routes._get_app_configuration_from_git")
def test_app_config_from_git_api_clones_off_the_event_loop(get_app_configuration_from_git, client):
    """A slow clone must not block the service's other requests"""
    def get_app_configuration(repo):
        try:
            asyncio.get_running_loop()
            on_event_loop = True
        except RuntimeError:
            on_event_loop = False
        assert not on_event_loop
        return JHubAppConfig(display_name="App", description="description")
    get_app_configuration_from_git.side_effect = get_app_configuration
    response = client.post(
        "/app-config-from-git/",
        json={"url": "https://example.com/org/repo.git", "config_directory": ".", "ref": "main"},
    )
    assert response.status_code == 200
    get_app_configuration_from_git.assert_called_once()


def _fake_clone_of(source):
    def run_git_clone(command, temp_dir):
        shutil.copytree(source, temp_dir, symlinks=True, dirs_exist_ok=True)
    return run_git_clone


@pytest.mark.parametrize("filename", ["conda-project.yml", "environment.yaml"])
@patch("jhub_apps.service.app_from_git._get_conda_project_config_yaml")
def test_conda_project_file_outside_repository_is_refused(
        get_conda_project_config_yaml, hub_and_repo, filename
):
    outside, repo = hub_and_repo
    os.symlink(outside / "secret", repo / filename)
    with patch("jhub_apps.service.app_from_git._run_git_clone", side_effect=_fake_clone_of(repo)):
        with pytest.raises(HTTPException) as exc_info:
            _get_app_configuration_from_git(Repository(url="https://example.com/org/repo.git"))
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == f"Path '{filename}' must be inside the repository."
    get_conda_project_config_yaml.assert_not_called()


@patch("jhub_apps.service.app_from_git._get_conda_project_config_yaml")
def test_app_config_from_git_api_does_not_read_hub_files(
        get_conda_project_config_yaml, hub_and_repo, client
):
    """The request from the advisory: a repository whose thumbnail_path points at a hub file"""
    outside, repo = hub_and_repo
    (repo / "conda-project.yml").write_text("name: app\nenvironments: {}\n")
    get_conda_project_config_yaml.return_value = Mock(variables={
        "JHUB_APP_CONFIG_display_name": "App",
        "JHUB_APP_CONFIG_description": "description",
        "JHUB_APP_CONFIG_thumbnail_path": str(outside / "secret.png"),
    })
    with patch("jhub_apps.service.app_from_git._run_git_clone", side_effect=_fake_clone_of(repo)):
        response = client.post(
            "/app-config-from-git/",
            json={"url": "https://example.com/org/repo.git", "config_directory": ".", "ref": "main"},
        )
    assert response.status_code == 400
    assert "must be inside the repository" in response.json()["detail"]
    assert base64.b64encode(SECRET).decode() not in response.text
