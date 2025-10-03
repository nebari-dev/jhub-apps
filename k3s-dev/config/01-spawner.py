"""
KubeSpawner configuration

This file configures KubeSpawner for local k3s development.
Simplified from Nebari's production config for local testing.
"""

# Basic spawner settings
c.KubeSpawner.image = "quay.io/jupyterhub/singleuser:4.1.0"
c.KubeSpawner.start_timeout = 300  # 5 minutes
c.KubeSpawner.http_timeout = 120   # 2 minutes

# Resource limits (conservative for local dev)
c.KubeSpawner.cpu_limit = 1
c.KubeSpawner.mem_limit = "1G"
c.KubeSpawner.cpu_guarantee = 0.1
c.KubeSpawner.mem_guarantee = "128M"

# Storage - use emptyDir for dev (ephemeral, no PVC needed)
c.KubeSpawner.storage_pvc_ensure = False
c.KubeSpawner.storage_class = None
c.KubeSpawner.storage_capacity = None

# Network - don't create per-user services (saves resources)
c.KubeSpawner.services_enabled = False

# Security - don't mount service account token in user pods
# This prevents users from accessing the Kubernetes API
c.KubeSpawner.automount_service_account_token = False

# Debugging
c.Spawner.debug = True

# Environment variables for spawned pods
c.KubeSpawner.environment = {
    "JUPYTERHUB_SINGLEUSER_APP": "jupyter_server.serverapp.ServerApp",
}

# Allow user pods to run as non-root
# c.KubeSpawner.uid = 1000
# c.KubeSpawner.gid = 100
# c.KubeSpawner.fs_gid = 100

print("✅ KubeSpawner configuration loaded")
print(f"   - Singleuser image: {c.KubeSpawner.image}")
print(f"   - CPU limit: {c.KubeSpawner.cpu_limit}, Memory limit: {c.KubeSpawner.mem_limit}")
print(f"   - Storage: Ephemeral (emptyDir)")
