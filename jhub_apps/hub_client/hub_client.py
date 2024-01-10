import logging
import os
import re
import uuid

import requests


API_URL = os.environ.get("JUPYTERHUB_API_URL")
JUPYTERHUB_API_TOKEN = os.environ.get("JUPYTERHUB_API_TOKEN")

logger = logging.getLogger(__name__)


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
        if not servername:
            logger.info("Starting JupyterLab server")
            # Default server, which is JupyterLab (not named server)
            servername = ""
            user_options = {}
        else:
            # Get named server
            server = self.get_server(username, servername)
            user_options = server["user_options"]
            if not server:
                return None
        url = f"/users/{username}/servers/{servername}"
        data = {"name": servername, **user_options}
        r = requests.post(API_URL + url, headers=self._headers(), json=data)
        r.raise_for_status()
        return r.status_code, servername

    def create_server(self, username, servername, user_options=None):
        logger.info("Creating new server")
        servername = self.normalize_server_name(servername)
        servername = f"{servername}-{uuid.uuid4().hex[:7]}"
        return self._create_server(username, servername, user_options)

    def edit_server(self, username, servername, user_options=None):
        logger.info(f"Editing server: {servername}")
        server = self.get_server(username, servername)
        if server:
            # Stop the server first
            logger.info(f"Stopping the server: {servername} first")
            self.delete_server(username, server["name"])
        else:
            raise ValueError("Server does not exists")
        logger.info(f"Now creating the server: {servername} with new params")
        return self._create_server(username, servername, user_options)

    def _create_server(self, username, servername, user_options):
        url = f"/users/{username}/servers/{servername}"
        params = user_options.model_dump()
        data = {"name": servername, **params}
        logger.info("Creating new server")
        r = requests.post(API_URL + url, headers=self._headers(), json=data)
        r.raise_for_status()
        return r.status_code, servername

    def delete_server(self, username, server_name, remove=False):
        if server_name is None:
            # Default server and not named server
            server_name = ""
        url = f"/users/{username}/servers/{server_name}"
        # This will remove it from the database, otherwise it will just stop the server
        params = {"remove": remove}
        r = requests.delete(API_URL + url, headers=self._headers(), json=params)
        r.raise_for_status()
        return r.status_code

    def get_services(self):
        r = requests.get(API_URL + "/services", headers=self._headers())
        r.raise_for_status()
        return r.json()
