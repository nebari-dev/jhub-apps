# JupyterHub Apps Launcher

## Install Dependencies

```bash
conda env create -f environment-dev.yaml
pip install -e .
```

## Starting JupyterHub

```bash
jupyterhub -f jupyterhub_config.py
```

### Next Steps

- [x] Create a Panel App to show app launcher
- [x] Render that panel app via FastAPI service
- [ ] Figure out proxy paths/urls
- [ ] Add support for all the dashboard frameworks mentioned in MVP
- [ ] Add state management
- [ ] Add CI/CD
