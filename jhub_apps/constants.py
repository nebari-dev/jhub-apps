import os

BASE_URL = os.environ.get("JHUB_APP_BASE_URL", "https://japps.quansight.dev")
ORIGIN_HOST = os.environ.get("JHUB_APP_ORIGIN_HOST", "japps.quansight.dev")
API_URL = f"{BASE_URL}/hub/api"
JHUB_APP_TOKEN = os.environ.get("JHUB_APP_LAUNCHER_TOKEN", "super-secret")
