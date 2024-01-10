# JupyterHub Apps Launcher

[![Lint](https://github.com/nebari-dev/jhub-apps/actions/workflows/lint.yml/badge.svg)](https://github.com/nebari-dev/jhub-apps/actions/workflows/lint.yml)
[![Test](https://github.com/nebari-dev/jhub-apps/actions/workflows/test.yml/badge.svg)](https://github.com/nebari-dev/jhub-apps/actions/workflows/test.yml)

JupyterHub Apps Launcher is a generalized server launcher. The goal of this project is to support
launching anything like say a Flask Server, FastAPI server or a Panel Dashboard via a user supplied
command. Currently, the following frameworks are supported:

- [x] Panel
- [x] Bokeh
- [x] Streamlit
- [x] Plotly Dash
- [x] Voila
- [x] Gradio
- [x] JupyterLab
- [x] Generic Python Command

![JHub Apps Demo](https://raw.githubusercontent.com/nebari-dev/jhub-apps/main/demo.gif)

## Installation

```
pip install jhub-apps
```

or via conda

```bash
conda install -c conda-forge jhub-apps
```

## Development Installation

### Install Dependencies

```bash
conda env create -f environment-dev.yml
pip install -e .
```

## Starting JupyterHub

Set the following environment variable:

```bash
export JHUB_APP_JWT_SECRET_KEY=$(openssl rand -hex 32)
```


```bash
jupyterhub -f jupyterhub_config.py
```

Now go to http://127.0.0.1:8000/services/japps/ to access JHub Apps Launcher

## API Endpoints

The Hub service is exposed via FastAPI endpoints. The documentation for the same can be accessed at:
http://127.0.0.1:8000/services/japps/docs

To try out authenticated endpoints click on the Authorize button on the top right of
the above url and chose `OAuth2AuthorizationCodeBearer` and click on Authorize.

## Running Tests

### Unit Tests

```bash
pytest jhub_apps/tests
```

### E2E Tests

```bash
pytest jhub_apps/tests_e2e -vvv -s --headed
```

## Usage

JHub Apps has been tested with local JupyterHub using `SimpleLocalProcessSpawner` and with
The Littlest JupyterHub using `SystemdSpawner`.

* Install JHub Apps

```python
pip install git+https://github.com/nebari-dev/jhub-apps.git
```

* Add the following in The Littlest JupyterHub's `jupyterhub_config.py`

```python
from tljh.user_creating_spawner import UserCreatingSpawner
from jhub_apps.configuration import install_jhub_apps

c.JupyterHub.bind_url = "<YOUR_JUPYTERHUB_URL>"
c.SystemdSpawner.unit_name_template = 'jupyter-{USERNAME}{JHUBSERVERNAME}'
c.JAppsConfig.apps_auth_type = "oauth" # or none (if you don't want authentication on apps)
c.JAppsConfig.python_exec = "python3"
# Pass in the path to jupyterhub config
c.JAppsConfig.jupyterhub_config_path = "jupyterhub_config.py"
# Either a static list of conda environments to show in the
# create panel apps form or a callable to fetch conda enviornments
# dynamically, e.g. from conda-store API
c.JAppsConfig.conda_envs = []
c = install_jhub_apps(c, UserCreatingSpawner)
```
