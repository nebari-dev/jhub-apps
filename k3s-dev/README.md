# JHub Apps K3s Development Environment

This directory contains configuration for running JHub Apps with KubeSpawner in a local k3d cluster using Tilt for rapid development.

## Prerequisites

- [k3d](https://k3d.io/#installation) - Local Kubernetes cluster
- [Tilt](https://docs.tilt.dev/install.html) - Development environment orchestrator
- [kubectl](https://kubernetes.io/docs/tasks/tools/) - Kubernetes CLI

## Quick Start

```bash
# Start the environment (creates cluster and runs Tilt)
make up

# Stop and clean up
make down
```

Once started:
- **JupyterHub**: http://localhost:8000 (login with any username and password `password`)
- **Tilt UI**: http://localhost:10350

## Architecture

### Components

- **k3d cluster**: Single-node Kubernetes cluster (`jhub-apps-dev`)
- **JupyterHub**: Deployed via Helm chart with custom configuration
- **KubeSpawner**: Spawns user servers and apps as Kubernetes pods
- **Tilt**: Watches for changes and auto-reloads configuration

### Directory Structure

```
k3s-dev/
├── Makefile                    # Development commands
├── Tiltfile                    # Tilt configuration
├── k3d-config.yaml            # k3d cluster configuration
├── jupyterhub-values.yaml     # Helm chart values
└── config/                    # JupyterHub configuration files
    ├── 00-jhub-apps.py        # jhub-apps setup and OAuth
    ├── 01-spawner.py          # KubeSpawner configuration
    └── 02-profiles.py         # Server profiles (small/medium/large)
```

## Development Workflow

### Making Configuration Changes

1. **Edit config files** (`config/*.py`): Tilt automatically detects changes and restarts the hub
2. **Edit jhub-apps source** (`../jhub_apps/*.py`): Restart the `hub` resource from Tilt UI
3. **Edit Helm values** (`jupyterhub-values.yaml`): Run `tilt down && tilt up` to recreate

### Useful Commands

```bash
# View cluster resources
kubectl get pods -n jhub-apps-dev

# View hub logs
kubectl logs -n jhub-apps-dev deployment/hub -f

# View spawned app logs
kubectl logs -n jhub-apps-dev pod/<pod-name> -f

# Access hub pod shell
kubectl exec -n jhub-apps-dev deployment/hub -it -- /bin/bash

# Delete and recreate cluster
make down && make up
```

### Tilt UI

Press `space` in the terminal to open the Tilt UI, where you can:
- View logs for all resources
- Manually trigger rebuilds
- Restart individual resources
- Monitor deployment status

## Configuration Details

### Source Code Mounting

The jhub-apps source code is mounted from the parent directory into:
- k3d node: `/opt/jhub-apps` (via k3d volume mount)
- Hub pod: `/opt/jhub-apps` (via hostPath volume)

Dependencies are installed via `uv` in an initContainer and mounted as `/srv/jupyterhub/jhub-apps-deps`.

### Profiles

Three profiles are available for testing:
- **Small**: 1 CPU / 1 GB RAM
- **Medium**: 2 CPU / 2 GB RAM
- **Large**: 4 CPU / 4 GB RAM

### Authentication

Uses `DummyAuthenticator` - any username with password `password` works.
Admin user: `admin`

## Troubleshooting

### Cluster won't start
```bash
# Check k3d cluster status
k3d cluster list

# Delete and recreate
k3d cluster delete jhub-apps-dev
make up
```

### Hub pod crashes
```bash
# Check hub logs
kubectl logs -n jhub-apps-dev deployment/hub

# Common issues:
# - Missing JHUB_APPS_SOURCE environment variable
# - Python import errors (check PYTHONPATH)
# - Configuration syntax errors in config/*.py
```

### Can't access JupyterHub
```bash
# Verify port forwarding
k3d cluster list | grep jhub-apps-dev

# Check proxy service
kubectl get svc -n jhub-apps-dev proxy-public
```

### Changes not reflected
```bash
# For config changes: Tilt should auto-reload
# For source code changes: Restart hub from Tilt UI
# For Helm value changes: Recreate deployment
tilt down && tilt up
```

## CI Mode

The Tiltfile supports CI mode for automated testing:

```bash
tilt ci
```

This will deploy JupyterHub, wait for it to be ready, then exit.

## Clean Up

```bash
# Stop Tilt and delete cluster
make down

# Or manually
tilt down
k3d cluster delete jhub-apps-dev
```
