import requests

from jhub_apps.constants import API_URL, JHUB_APP_TOKEN


class HubClient:
    def __init__(self, token=None):
        self.token = token or JHUB_APP_TOKEN

    def _headers(self):
        return {"Authorization": f"token {self.token}"}

    def get_users(self):
        r = requests.get(API_URL + "/users", headers=self._headers())
        r.raise_for_status()
        users = r.json()
        return users

    def get_user(self, user):
        params = {"include_stopped_servers": True}
        r = requests.get(
            API_URL + f"/users/{user}", params=params, headers=self._headers()
        )
        r.raise_for_status()
        users = r.json()
        return users

    def create_server(self, username, servername, params=None):
        url = f"/users/{username}/servers/{servername}"
        params = params or {}
        data = {"jhub_app": True, **params}
        r = requests.post(API_URL + url, headers=self._headers(), json=data)
        r.raise_for_status()
        return r.status_code

    def delete_server(self, username, server_name):
        url = f"/users/{username}/servers/{server_name}"
        params = {"remove": True}
        r = requests.delete(API_URL + url, headers=self._headers(), json=params)
        r.raise_for_status()
        return r.status_code
