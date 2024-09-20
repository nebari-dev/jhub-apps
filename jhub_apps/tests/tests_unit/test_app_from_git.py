from unittest.mock import Mock

from jhub_apps.service.app_from_git import _extract_jhub_apps_config_from_conda_project_config


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
