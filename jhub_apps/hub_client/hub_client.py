import os
import re
import uuid

import requests


API_URL = os.environ.get("JUPYTERHUB_API_URL")
JUPYTERHUB_API_TOKEN = os.environ.get("JUPYTERHUB_API_TOKEN")


class HubClient:
    def __init__(self, token=None):
        self.token = token or JUPYTERHUB_API_TOKEN

    def _headers(self):
        return {"Authorization": f"token {self.token}"}

    def get_users(self):
        r = requests.get(
            API_URL + "/users",
            params={"include_stopped_servers": True},
            headers=self._headers()
        )
        r.raise_for_status()
        users = r.json()
        return users

    def get_user(self, user):
        r = requests.get(
            API_URL + f"/users/{user}",
            params={"include_stopped_servers": True},
            headers=self._headers()
        )
        r.raise_for_status()
        user = r.json()
        return user

    def get_server(self, username, servername):
        user = self.get_user(username)
        for name, server in user["servers"].items():
            if name == servername:
                return server

    def normalize_server_name(self, servername):
        # Convert text to lowercase
        text = servername.lower()
        # Remove all special characters except spaces and hyphen
        text = re.sub(r"[^a-z0-9\s-]", "", text)
        # Replace spaces with hyphens
        text = text.replace(" ", "-")
        return text

    def start_server(self, username, servername):
        server = self.get_server(username, servername)
        if not server:
            return None
        url = f"/users/{username}/servers/{servername}"
        data = {"name": servername, **server["user_options"]}
        r = requests.post(API_URL + url, headers=self._headers(), json=data)
        r.raise_for_status()
        return r.status_code, servername

    def create_server(self, username, servername, edit=False, user_options=None):
        server = self.get_server(username, servername)
        if not edit:
            servername = self.normalize_server_name(servername)
            servername = f"{servername}-{uuid.uuid4().hex[:7]}"
        if server:
            if edit:
                self.delete_server(username, server["name"], remove=True)
            else:
                raise ValueError(f"Server: {servername} already exists")
        url = f"/users/{username}/servers/{servername}"
        params = user_options.model_dump()
        data = {"name": servername, **params}
        r = requests.post(API_URL + url, headers=self._headers(), json=data)
        r.raise_for_status()
        return r.status_code, servername

    def delete_server(self, username, server_name, remove=False):
        url = f"/users/{username}/servers/{server_name}"
        # This will remove it from the database, otherwise it will just stop the server
        params = {"remove": remove}
        r = requests.delete(API_URL + url, headers=self._headers(), json=params)
        r.raise_for_status()
        return r.status_code
