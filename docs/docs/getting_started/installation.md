---
sidebar_position: 1
---

# Installation

```
pip install jhub-apps
```

or via conda

```bash
conda install -c conda-forge jhub-apps
```

## Usage

JHub Apps can be integrated with most JupyterHub (> 4) installations, but we officially support
the JupyterHub(s) with following Spawners:

- `KubeSpawner`
- `SimpleLocalProcessSpawner`
- `DockerSpawner`

To integrate `jhub-apps` into your JupyterHub installation, add the following to your
`jupyterhub_config.py`:

```python
c.JAppsConfig.jupyterhub_config_path = "jupyterhub_config.py"
c = install_jhub_apps(c, <YOUR-SPAWNER-CLASS>)
```
