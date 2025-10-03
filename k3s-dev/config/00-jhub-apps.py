"""
Install and configure jhub-apps with KubeSpawner

This file follows Nebari's pattern of separating configuration concerns.
Similar to: nebari/src/_nebari/stages/kubernetes_services/.../02-spawner.py
"""
import sys

# Add jhub-apps to Python path (mounted at /opt/jhub-apps)
sys.path.insert(0, '/opt/jhub-apps')

from kubespawner import KubeSpawner
from jhub_apps.configuration import install_jhub_apps
from z2jh import get_config

# Get public URL from Helm values (Nebari pattern)
_public_url = get_config("custom.external-url")

# Basic JupyterHub settings
c.JupyterHub.log_level = 10  # DEBUG for development
# NOTE: We temporarily set bind_url to the public URL for install_jhub_apps to use it
# for OAuth redirects, then override it after
c.JupyterHub.bind_url = _public_url
c.JupyterHub.hub_connect_url = "http://hub:8081"  # Internal URL for services to connect to hub
c.JupyterHub.default_url = "/hub/home"

# jhub-apps configuration
c.JAppsConfig.jupyterhub_config_path = "/usr/local/etc/jupyterhub/jupyterhub_config.py"
c.JAppsConfig.hub_host = "hub"  # Kubernetes service name (for proxy to reach japps)
c.JAppsConfig.service_workers = 1  # Single worker for dev
c.JAppsConfig.conda_envs = []  # No conda-store in dev environment
c.Spawner.debug = True

# Install jhub-apps - wraps KubeSpawner with jhub-apps functionality
c = install_jhub_apps(c, spawner_to_subclass=KubeSpawner, oauth_no_confirm=True)

# Now set bind_url to the correct internal value for the hub to bind
c.JupyterHub.bind_url = "http://:8081"

# Add template paths for jhub-apps UI
from jhub_apps import theme_template_paths
c.JupyterHub.template_paths = theme_template_paths

# Theme configuration (mimics Nebari's look and feel)
from jhub_apps import themes
c.JupyterHub.template_vars = {
    "hub_title": "JHub Apps Dev",
    "hub_subtitle": "Local KubeSpawner Testing Environment",
    "welcome": "🚀 Development Mode",
    "display_version": True,
    **themes.DEFAULT_THEME,
}

# Load groups (optional - for testing share permissions)
c.JupyterHub.load_groups = {
    "developers": {"users": ["admin"]},
    "data-scientists": {"users": ["admin"]},
}

# Add permission to share servers/apps (following Nebari's pattern)
# This is handled by install_jhub_apps, but we can customize roles here
from jhub_apps.hub_client.utils import is_jupyterhub_5

for role in c.JupyterHub.load_roles:
    if role["name"] == "user":
        role["scopes"].extend(
            [
                # Need scope 'read:users:name' to share with users by name
                "read:users:name",
                # Need scope 'read:groups:name' to share with groups by name
                "read:groups:name",
            ]
            + ["shares!user"] if is_jupyterhub_5() else []
        )
        break

print("✅ jhub-apps configuration loaded")
print(f"   - JupyterHub bind URL: {c.JupyterHub.bind_url}")
print(f"   - Hub host: {c.JAppsConfig.hub_host}")
print(f"   - Service workers: {c.JAppsConfig.service_workers}")
