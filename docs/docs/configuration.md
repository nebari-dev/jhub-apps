---
sidebar_position: 3
---

# Configuration

JHub Apps (JupyterHub Apps) allows for flexible configuration to suit different deployment needs. The configurations
are defined in the `jupyterhub_config.py` file, setting various attributes via:

```python
c.JAppsConfig.<CONFIG> = <CONFIG_VALUE>
```

### `bind_url`

The URL where JupyterHub binds the service.

- **Example**:
  ```python
  c.JupyterHub.bind_url = "http://127.0.0.1:8000"
  ```
- **Notes**: It sets the main address JupyterHub listens on for incoming requests.

### `jupyterhub_config_path`

Specifies the path to the `jupyterhub_config.py` file. This is used internally by JHub Apps for
accessing configurations.

- **Example**:
  ```python
  c.JAppsConfig.jupyterhub_config_path = "jupyterhub_config.py"
  ```

### `conda_envs`

A list of conda environments that JHub Apps can access or use. This can either be a static list
or a callable.

- **Example**:
  ```python
  c.JAppsConfig.conda_envs = ["env1", "env2"]
  ```
- **Notes**: Define any necessary environments for apps that rely on specific dependencies.

### `service_workers`

Sets the number of service worker processes to be created for handling user requests.

- **Example**:
  ```python
  c.JAppsConfig.service_workers = 1
  ```

### `default_url`

The default URL users are directed to after login.

- **Example**:
  ```python
  c.JupyterHub.default_url = "/hub/home"
  ```

### `allowed_frameworks`

A list of frameworks that are permitted to be launched through JHub Apps.

- **Example**:
  ```python
  c.JupyterHub.allowed_frameworks = ["jupyterlab", "bokeh"]
  ```
- **Notes**:
  - Supports the following values for frameworks:
    - `panel`
    - `bokeh`
    - `streamlit`
    - `plotlydash`
    - `voila`
    - `gradio`
    - `jupyterlab`
    - `custom`
  - Allowing JupyterLab can potentially expose user to sharing their entire filesystem, if the created JupyterLab
    app is accidentally shared. It also allows the user to swap JupyterLab runtime, which could disable
    system extensions and let them run arbitrary and potentially dangerous extensions.

### `blocked_frameworks`

Specifies frameworks that users are restricted from launching.

- **Example**:
  ```python
  c.JupyterHub.blocked_frameworks = ["voila"]
  ```

### `startup_apps`

A list of apps to automatically create or update when JHub Apps service starts.  Apps can be created from a local file or from a git repo.

Servers will be created or modified if already existing to match the config. Removing items from this list won't delete any servers.

- **Example**:
  ```python
  c.JAppsConfig.startup_apps = [
      # define app from git repo
      {
        "username": "my-user",  # app will be created by this user
        "servername": "my-startup-server",  # specify a unique server name
        "user_options": {
            "display_name": "My Startup Server",
            "description": "description",
            "thumbnail": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC",  # base64 encoded image data to use for thumbnail
            "filepath": "panel_basic.py",  # local file or path within git repo
            "framework": "panel",
            "public": False,  # Whether or not app is publicly accessible without authentication
            "keep_alive": False,  # Whether or not to shut down app after a period of idleness
            "env": {"MY_ENV_VAR": "MY_VALUE"},
            "repository": {"url": "https://github.com/nebari-dev/jhub-apps-from-git-repo-example.git"},  # specify if pulling app from git repo
            "conda_env": "my-conda-env",
            "profile": "my-compute-profile",
            "share_with": {"users": ["my-other-user"], "groups": ["group1", "group2"]},
        },
    },
    # Define a startup app from local files
    {
        "username": "my-other-user",
        "servername": "another-startup-server",
        "user_options": {
            "filepath": "panel_basic.py",
            "repository": None
            ...  # other fields as above
        },
    }
  ]
  ```

### `jhub_app_proxy_version`

Specifies the version of `jhub-app-proxy` to install when deploying apps.

- **Example**:
  ```python
  c.JAppsConfig.jhub_app_proxy_version = "v0.6"
  ```
- **Notes**:
  - This sets the default version globally for all apps
  - Can be overridden per-app by setting the `JHUB_APP_PROXY_VERSION` environment variable in the app's configuration
  - Priority: App-specific `JHUB_APP_PROXY_VERSION` env var > Global config > Default

### `additional_services`

List of additional external services to display in JupyterHub's services menu. Services with `pinned=True`
will also appear in the quick access section for easy access.

- **Example**:
  ```python
  c.JAppsConfig.additional_services = [
      {
          "name": "Monitoring",
          "url": "/grafana",
          "description": "System monitoring dashboard",
          "pinned": True,
          "thumbnail": "https://example.com/grafana-logo.svg",
      },
      {
          "name": "Argo",
          "url": "/argo",
      },
      {
          "name": "Environments",
          "url": "/conda-store",
          "description": "Conda environment manager",
          "pinned": True,
      },
  ]
  ```
- **Fields**:
  - `name` (required): Display name of the service
  - `url` (required): URL path for the service
  - `description` (optional): Description of the service shown in the UI
  - `pinned` (optional): Whether the service should appear in the quick access section (default: `False`)
  - `thumbnail` (optional): URL or data URL for the service icon
- **Notes**:
  - This replaces the older approach of manually extending `c.JupyterHub.services` with custom service dictionaries
  - For advanced use cases, you can still use the programmatic approach with the `service_for_jhub_apps` helper:
    ```python
    from jhub_apps import service_for_jhub_apps
    c.JupyterHub.services.extend([
        service_for_jhub_apps(
            name="Custom Service",
            url="/custom",
            description="My custom service",
            pinned=True,
        ),
    ])
    ```
