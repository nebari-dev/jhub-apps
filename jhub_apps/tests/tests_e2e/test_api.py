import hashlib

import pytest


EXAMPLE_TEST_REPO = "https://github.com/nebari-dev/jhub-apps-from-git-repo-example.git"


def test_api_status(client):
    response = client.get("/status")
    assert response.status_code == 200
    assert set(response.json().keys()) == {"version", "status"}


def test_app_config_from_git_api(
        client,
):
    response = client.post(
        '/app-config-from-git/',
        json={
            "url": EXAMPLE_TEST_REPO,
            "config_directory": ".",
            "ref": "main"
        }
    )
    assert response.status_code == 200
    response_json = response.json()
    assert response_json
    assert set(response_json.keys()) == {
        'url', 'name', 'description', 'framework', 'filepath',
        'environment', 'keep_alive', 'public', 'thumbnail_path', 'thumbnail'
    }
    assert response_json["name"] == "My Panel App (Git)"
    assert response_json["description"] == "This is a panel app created from git repository"
    assert response_json["framework"] == "panel"
    assert response_json["filepath"] == "panel_basic.py"
    assert response_json["environment"] == {
        "SOMETHING_FOO": "bar",
        "SOMETHING_BAR": "beta",
    }
    assert response_json["keep_alive"] is False
    assert response_json["public"] is False
    assert response_json["thumbnail_path"] == "panel.png"

    assert isinstance(response_json["thumbnail"], str)
    expected_thumbnail_sha = "a8104b2482360eee525dc696dafcd2a17864687891dc1b6c9e21520518a5ea89"
    assert hashlib.sha256(response_json["thumbnail"].encode('utf-8')).hexdigest() == expected_thumbnail_sha


@pytest.mark.parametrize("repo_url, config_directory, response_status_code,detail", [
    (EXAMPLE_TEST_REPO, "non-existent-path", 400,
     "Path 'non-existent-path' doesn't exists in the repository."),
    ("http://invalid-repo/", ".", 400,
     "Repository clone failed: http://invalid-repo/"),
])
def test_app_config_from_git_api_invalid(
        client,
        repo_url,
        config_directory,
        response_status_code,
        detail
):
    response = client.post(
        '/app-config-from-git/',
        json={
            "url": repo_url,
            "config_directory": config_directory,
            "ref": "main"
        }
    )
    assert response.status_code == response_status_code
    response_json = response.json()
    assert "detail" in response_json
    assert response_json["detail"] == detail
