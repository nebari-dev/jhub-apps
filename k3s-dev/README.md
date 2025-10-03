# JHub Apps Local Development with k3s + Tilt

Lightweight local development environment for testing jhub-apps with KubeSpawner using Tilt for fast iteration.

## Overview

This setup provides a Nebari-like environment for developing and testing jhub-apps locally:

- **k3d**: Lightweight Kubernetes cluster (k3s in Docker)
- **Tilt**: Auto-reload development tool with web UI
- **KubeSpawner**: Spawns user pods in Kubernetes (like production Nebari)
- **Separate config files**: Following Nebari's pattern

## Prerequisites

```bash
# Install dependencies (macOS)
brew install tilt-dev/tap/tilt
brew install k3d
brew install helm
brew install kubectl

# Ensure Docker Desktop is running
```

## Quick Start

```bash
cd k3s-dev

# Start everything (creates cluster, deploys JupyterHub, watches for changes)
tilt up

# Tilt will:
# 1. Create k3d cluster (jhub-apps-dev)
# 2. Deploy JupyterHub via Helm chart
# 3. Mount jhub-apps source code into hub pod
# 4. Create ConfigMap from config/ files
# 5. Watch for file changes and auto-reload
# 6. Open web UI at http://localhost:10350
```

**Access:**
- **Tilt UI**: http://localhost:10350 (logs, status, controls)
- **JupyterHub**: http://localhost:8000
  - Username: `admin`
  - Password: `test` (any password works)

## Development Workflow

### Local Development

#### Edit Config Files (Auto-reload)

```bash
# Edit any file in config/
vim config/01-spawner.py

# Tilt automatically:
# 1. Detects the change
# 2. Updates ConfigMap
# 3. Restarts hub pod
# 4. Shows progress in UI
```

No manual commands needed! Watch the Tilt UI for status.

#### Edit jhub-apps Source Code

```bash
# Edit jhub-apps source
vim ../jhub_apps/service/app.py

# Restart hub to pick up changes:
# Option 1: Click restart button on 'hub' resource in Tilt UI
# Option 2: Manually restart
kubectl rollout restart deployment/hub -n jhub-apps-dev
```

#### View Logs

**Via Tilt UI** (recommended):
- Open http://localhost:10350
- Click on `hub` resource
- See live logs in the panel

**Via kubectl**:
```bash
kubectl logs -f deployment/hub -n jhub-apps-dev
kubectl logs -f <user-pod-name> -n jhub-apps-dev
```

#### Debug Resources

**Via Tilt UI**:
- See all pods, services, deployments
- Click on any resource for details
- Red = error, Yellow = starting, Green = ready

**Via kubectl**:
```bash
# List all pods
kubectl get pods -n jhub-apps-dev

# Describe a pod
kubectl describe pod <pod-name> -n jhub-apps-dev

# Check events
kubectl get events -n jhub-apps-dev --sort-by='.lastTimestamp'

# Shell into hub
kubectl exec -it deployment/hub -n jhub-apps-dev -- bash
```

### CI Mode

For automated testing (GitHub Actions):

```bash
# Run in headless mode (no UI)
tilt ci

# This:
# 1. Creates cluster
# 2. Deploys JupyterHub
# 3. Waits for all resources to be ready
# 4. Exits with status code 0 if successful
```

See `.github/workflows/test-k3s-integration.yml` for CI usage.

## Tilt Commands

```bash
# Start with UI
tilt up

# Start in headless mode (CI)
tilt ci

# Stop (keeps cluster)
tilt down

# Stop and delete cluster
tilt down --delete-cluster

# View logs in terminal
tilt logs

# Trigger manual update
tilt trigger update-config
```

## Testing jhub-apps

### Create an App

1. Access http://localhost:8000
2. Login (admin / test)
3. Click "Apps" → "Create App"
4. Fill in:
   - **Framework**: Panel
   - **Display Name**: My Test App
   - **Description**: Testing kubespawner
   - **Profile**: Small Instance
5. Click "Create"
6. Watch in Tilt UI as pod spawns
7. Access the app when ready

### Test Profile Selection

Profiles are defined in `config/02-profiles.py`:

| Profile | CPU | Memory | Use Case |
|---------|-----|--------|----------|
| **Small** | 1 | 1 GB | Testing, JupyterLab |
| **Medium** | 2 | 2 GB | Panel/Streamlit apps |
| **Large** | 4 | 4 GB | Resource-intensive apps |

Create apps with different profiles to test resource allocation.

### Test Frameworks

Try creating apps with different frameworks:
- Panel
- Streamlit
- Gradio
- Plotly Dash
- Bokeh
- Voila

## Architecture

```
k3d Cluster (jhub-apps-dev namespace)
├── hub pod (JupyterHub + jhub-apps service)
│   ├── Source: /opt/jhub-apps (mounted from host)
│   ├── Config: /etc/jupyterhub/config (ConfigMap)
│   └── RBAC: ServiceAccount with Role (auto-created by Helm)
├── proxy pod (Configurable HTTP Proxy)
└── User pods (spawned by KubeSpawner)
    ├── jupyter-admin (JupyterLab)
    ├── jupyter-admin-panel-app-xyz (Panel app)
    └── jupyter-admin-streamlit-app-abc (Streamlit app)
```

## Configuration Files

- `config/00-jhub-apps.py` - Install jhub-apps, basic settings, theme
- `config/01-spawner.py` - KubeSpawner configuration (image, resources)
- `config/02-profiles.py` - Instance profiles (Small/Medium/Large)

These files follow Nebari's pattern and are loaded via Helm's `hub.extraConfig`.

## Troubleshooting

### Hub pod crash loops

```bash
kubectl logs deployment/hub -n jhub-apps-dev
```

**Common issues:**
- Missing dependencies: Check `PYTHONPATH` includes `/opt/jhub-apps`
- Config syntax error: Check `config/*.py` files
- Missing secrets: JWT secret is auto-generated by Helm

### User pods not starting

```bash
kubectl describe pod jupyter-admin-app-xyz -n jhub-apps-dev
```

**Common issues:**
- Image pull error: Check `c.KubeSpawner.image` in `config/01-spawner.py`
- Resource limits: Reduce in `config/02-profiles.py`
- RBAC: Helm should create this automatically

### Can't access at localhost:8000

```bash
kubectl get svc -n jhub-apps-dev
```

Should see `proxy-public` with type `LoadBalancer` and port 80.

If not working, use port-forward:

```bash
kubectl port-forward service/proxy-public 8000:80 -n jhub-apps-dev
```

### Tilt UI not updating

Press `r` in Tilt terminal to force refresh, or restart:

```bash
tilt down
tilt up
```

## Cleanup

```bash
# Stop but keep cluster (fast restart)
tilt down

# Delete everything
tilt down --delete-cluster

# Or manually delete cluster
k3d cluster delete jhub-apps-dev
```

## Comparison with Production (Nebari)

| Feature | k3s-dev | Nebari |
|---------|---------|--------|
| **Kubernetes** | k3d (single-node) | Cloud (GKE/EKS/AKS) |
| **Auth** | Dummy (any password) | Keycloak (OAuth) |
| **Storage** | EmptyDir (ephemeral) | NFS/CephFS PVCs |
| **Conda** | None | conda-store |
| **Monitoring** | Tilt UI | Prometheus/Grafana |
| **Config** | ConfigMap | Helm + Terraform |
| **Networking** | LoadBalancer | Ingress + TLS |
| **Profiles** | 3 static | Dynamic from config |

## CI Integration

### GitHub Actions

See `.github/workflows/test-k3s-integration.yml`:

```yaml
- name: Install Tilt
  run: |
    curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash

- name: Run k3s integration tests
  run: |
    cd k3s-dev
    tilt ci

- name: Run e2e tests
  run: |
    pytest jhub_apps/tests/tests_e2e/ --base-url=http://localhost:8000
```

### Running Tests Locally

```bash
# Start environment
cd k3s-dev
tilt up

# In another terminal, run tests
pytest jhub_apps/tests/tests_e2e/ --base-url=http://localhost:8000
```

## Next Steps

- [ ] Add custom singleuser image with frameworks pre-installed
- [ ] Add PVC support for persistent storage testing
- [ ] Test with JupyterHub 5.x
- [ ] Add network policy testing
- [ ] Document debugging specific frameworks

## Resources

- **Tilt docs**: https://docs.tilt.dev/
- **k3d docs**: https://k3d.io/
- **JupyterHub Helm chart**: https://github.com/jupyterhub/zero-to-jupyterhub-k8s
- **kubespawner**: https://github.com/jupyterhub/kubespawner
- **Nebari JupyterHub config**: `/Users/aktech/quansight/nebari/src/_nebari/stages/kubernetes_services/`
