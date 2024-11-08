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
