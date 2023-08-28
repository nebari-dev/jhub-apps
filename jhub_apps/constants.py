import os

BASE_URL = "http://127.0.0.1:8000"
ORIGIN_HOST = "127.0.0.1:8000"
API_URL = f"{BASE_URL}/hub/api"
JHUB_APP_TOKEN = os.environ.get("JHUB_APP_LAUNCHER_TOKEN", "super-secret")
