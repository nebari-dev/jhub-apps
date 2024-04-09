---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Install and setup

JHub Apps can be integrated with most JupyterHub (> 4) installations, but we officially support JupyterHub(s) with following Spawners:

- `KubeSpawner`
- `SimpleLocalProcessSpawner`
- `DockerSpawner`

## Installation

Pre-requisites: Python >= 3.8

<Tabs>
<TabItem value="pip" label="pip" default>

```bash
pip install jhub-apps
```

</TabItem>

<TabItem value="conda" label="conda">

```bash
conda install -c conda-forge jhub-apps
```

</TabItem>
</Tabs>

## Usage

To integrate `jhub-apps` into your JupyterHub installation, add the following to your
`jupyterhub_config.py`:

```python
c.JAppsConfig.jupyterhub_config_path = "jupyterhub_config.py"
c = install_jhub_apps(c, <YOUR-SPAWNER-CLASS>)
```
