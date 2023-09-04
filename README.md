# JupyterHub Apps Launcher

[![Lint](https://github.com/nebari-dev/jhub-apps/actions/workflows/lint.yml/badge.svg)](https://github.com/nebari-dev/jhub-apps/actions/workflows/lint.yml)
[![Test](https://github.com/nebari-dev/jhub-apps/actions/workflows/test.yml/badge.svg)](https://github.com/nebari-dev/jhub-apps/actions/workflows/test.yml)

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
