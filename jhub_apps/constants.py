import os

BASE_URL = os.environ.get("JHUB_APP_BASE_URL", "http://3.110.105.216")
ORIGIN_HOST = os.environ.get("JHUB_APP_ORIGIN_HOST", "3.110.105.216")
API_URL = f"{BASE_URL}/hub/api"
JHUB_APP_TOKEN = os.environ.get("JHUB_APP_LAUNCHER_TOKEN", "super-secret")
