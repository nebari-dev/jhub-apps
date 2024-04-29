import typing
from concurrent.futures import ThreadPoolExecutor

import structlog
import os
import re
import uuid

import requests


API_URL = os.environ.get("JUPYTERHUB_API_URL")
JUPYTERHUB_API_TOKEN = os.environ.get("JUPYTERHUB_API_TOKEN")

logger = structlog.get_logger(__name__)


class HubClient:
    def __init__(self, token=None):
        self.token = token or JUPYTERHUB_API_TOKEN
        self.jhub_apps_request_id = None
        self._set_request_id()

    def _set_request_id(self):
        contextvars = structlog.contextvars.get_contextvars()
        self.jhub_apps_request_id = contextvars.get("request_id")

    def _headers(self):
        return {
            "Authorization": f"token {self.token}",
            "JHUB_APPS_REQUEST_ID": self.jhub_apps_request_id
        }

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
        # Max limit for servername is 255 chars
        return text[:240]

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
        logger.info("Creating new server", user=username)
        servername = self.normalize_server_name(servername)
        servername = f"{servername}-{uuid.uuid4().hex[:7]}"
        logger.info("Normalized servername", servername=servername)
        return self._create_server(username, servername, user_options)

    def edit_server(self, username, servername, user_options=None):
        logger.info("Editing server", server_name=servername)
        server = self.get_server(username, servername)
        if server:
            # Stop the server first
            logger.info("Stopping the server first", server_name=servername)
            self.delete_server(username, server["name"])
        else:
            raise ValueError("Server does not exists")
        logger.info("Now creating the server with new params", server_name=servername)
        return self._create_server(username, servername, user_options)

    def _create_server(self, username, servername, user_options):
        url = f"/users/{username}/servers/{servername}"
        params = user_options.model_dump()
        data = {"name": servername, **params}
        logger.info("Creating new server", server_name=servername)
        r = requests.post(API_URL + url, headers=self._headers(), json=data)
        r.raise_for_status()
        return r.status_code, servername

    def _share_server(
            self,
            username: str,
            servername: str,
            share_to_user: typing.Optional[str],
            share_to_group: typing.Optional[str],
    ):
        url = f"/shares/{username}/{servername}"
        if share_to_user:
            data = {"user": share_to_user}
        elif share_to_group:
            data = {"group": share_to_group}
        else:
            raise ValueError("None of share_to_user or share_to_group provided")
        share_with = share_to_group or share_to_user
        logger.info(f"Sharing {username}/{servername} with {share_with}")
        return requests.post(API_URL + url, headers=self._headers(), json=data)

    def _share_server_with_multiple_entities(
            self,
            username: str,
            servername: str,
            share_to_users: typing.Optional[typing.List[str]] = None,
            share_to_groups: typing.Optional[typing.List[str]] = None,
    ):
        """
        :param username: owner of the servername
        :param servername: servername to share
        :param share_to_users: list of users to share the server with
        :param share_to_groups: list of groups to share the server with
        :return: mapping of dict of users + group to corresponding response json from Hub API
        """
        logger.info(
            f"Requested to share {username}/{servername}",
            share_to_users=share_to_users, share_to_groups=share_to_groups
        )
        if not share_to_groups and not share_to_users:
            logger.info("Neither of share_to_user or share_to_group provided, NOT sharing")
            return
        users = share_to_users or []
        groups = share_to_groups or []
        share_to_user_args = [(username, servername, user, None,) for user in users]
        share_to_group_args = [(username, servername, None, group,) for group in groups]
        executor_arguments = share_to_user_args + share_to_group_args
        with ThreadPoolExecutor(max_workers=10) as ex:
            logger.info(f"Share executor arguments: {executor_arguments}")
            response_results = list(ex.map(lambda p: self._share_server(*p), executor_arguments))

        user_and_groups = users + groups
        response_results_json = [resp.json() for resp in response_results]
        user_group_and_response_map = dict(zip(user_and_groups, response_results_json))
        logger.info("Sharing response", response=user_group_and_response_map)
        return user_group_and_response_map

    def _revoke_shared_access(self, username: str, servername: str):
        """Revoke all shared access to a given server"""
        url = f"/shares/{username}/{servername}"
        return requests.delete(API_URL + url, headers=self._headers())

    def _get_shared_servers(self, username: str):
        """List shares granting access to any of username's servers."""
        url = f"/shares/{username}"
        return requests.get(API_URL + url, headers=self._headers())

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
