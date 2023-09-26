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

![JHub Apps Demo](https://raw.githubusercontent.com/nebari-dev/jhub-apps/main/demo.gif)

## Install Dependencies

```bash
conda env create -f environment-dev.yml
pip install -e .
```

## Starting JupyterHub

```bash
jupyterhub -f jupyterhub_config.py
```

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
from jhub_apps.config.main import install_jhub_apps

c.JupyterHub.bind_url = "<YOUR_JUPYTERHUB_URL>"
c.SystemdSpawner.unit_name_template = 'jupyter-{USERNAME}{JHUBSERVERNAME}'
c.JAppsConfig.apps_auth_type = "oauth"  # or none (if you don't want authentication on apps)
c.JAppsConfig.python_exec = "python3"
c = install_jhub_apps(c, UserCreatingSpawner)
```
