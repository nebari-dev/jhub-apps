import os

import requests

API_URL = 'http://127.0.0.1:8000/hub/api'

JHUB_APP_TOKEN = os.environ.get("JHUB_APP_LAUNCHER_TOKEN", "super-secret")


class HubClient:
    def __init__(self, token=None):
        self.token = token or JHUB_APP_TOKEN

    def _headers(self):
        return {'Authorization': f'token {self.token}'}

    def get_users(self):
        r = requests.get(API_URL + '/users', headers=self._headers())
        r.raise_for_status()
        users = r.json()
        return users

    def create_server(self, username, servername="foobarlar"):
        url = f"/users/{username}/servers/{servername}"
        data = {
            "jhub_app": True
        }
        r = requests.post(API_URL + url, headers=self._headers(), json=data)
        r.raise_for_status()
        return r.status_code
