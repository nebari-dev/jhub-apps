import typing
from concurrent.futures import ThreadPoolExecutor
from functools import wraps

import structlog
import os
import re
import uuid

import requests

from jhub_apps.service.models import UserOptions, SharePermissions
from jhub_apps.hub_client.utils import is_jupyterhub_5
from jhub_apps.spawner.types import Framework

API_URL = os.environ.get("JUPYTERHUB_API_URL")
JUPYTERHUB_API_TOKEN = os.environ.get("JUPYTERHUB_API_TOKEN")

logger = structlog.get_logger(__name__)

# Single keep-alive session shared across HubClient instances. The hub API is
# called many times per page load; reusing TCP connections avoids a fresh
# handshake per call (worst on k8s pod networking).
_session = requests.Session()


def requires_user_token(func):
    """Decorator to apply to methods of HubClient to create user token before
    the method call and revoke them after the method call finishes.
    """
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        response_json = self._create_token_for_user()
        token_id = response_json["id"]
        try:
            original_method_return = func(self, *args, **kwargs)
        except Exception as e:
            raise e
        finally:
            self._revoke_token(token_id=token_id)
        return original_method_return
    return wrapper


class HubClient:
    def __init__(self, username=None):
        self.username = username
        self.tokens = [JUPYTERHUB_API_TOKEN]
        self.token_json = None
        self.jhub_apps_request_id = None
        self._set_request_id()

    def _set_request_id(self):
        contextvars = structlog.contextvars.get_contextvars()
        self.jhub_apps_request_id = contextvars.get("request_id")

    def _headers(self, token=None):
        header_token = token
        if not token and self.tokens:
            header_token = self.tokens[-1]

        return {
            "Authorization": f"token {token or header_token}",
            "JHUB_APPS_REQUEST_ID": self.jhub_apps_request_id
        }

    def _create_token_for_user(self):
        assert self.username
        logger.info("Creating token for user", username=self.username)
        r = _session.post(
            API_URL + f"/users/{self.username}/tokens",
            headers=self._headers(token=JUPYTERHUB_API_TOKEN),
            json={
                # Expire in 5 minutes max
                "expires_in": 60*5
            }
        )
        r.raise_for_status()
        rjson = r.json()
        # This is so that when a new token is created, it doesn't overrides a previously created token,
        # which is still in use by the previous function in stack
        # for e.g. When func_a calls func_b and both have the decorator "requires_user_token"
        # The func_a on completing execution will only clear the token, which the decorator
        # requires_user_token created for it, not the token created for func_a
        self.token_json = rjson
        self.tokens.append(rjson["token"])
        logger.info(f"Created token: {rjson['id']}")
        return rjson

    def _revoke_token(self, token_id):
        assert self.username
        assert token_id
        logger.debug(f"Revoking token: {token_id}")
        r = _session.delete(
            API_URL + f"/users/{self.username}/tokens/{token_id}",
            headers=self._headers(token=JUPYTERHUB_API_TOKEN),
        )
        r.raise_for_status()
        logger.debug(
            "Token revoked",
            status_code=r.status_code,
            username=self.username
        )
        self.tokens.pop()
        return r

    def get_users(self) -> typing.List[dict]:
        r = _session.get(
            API_URL + "/users",
            params={"include_stopped_servers": True},
            # We explicitly want to use japps app token for this
            headers=self._headers(token=self.tokens[0])
        )
        r.raise_for_status()
        users = r.json()
        return users

    def get_user(self, user=None):
        # Uses the service token directly. The japps-service-role has
        # `read:users`, which covers `GET /users/{name}` for any user — same
        # data the prior user-impersonation token returned, two fewer hub
        # roundtrips per call (no token create + revoke).
        r = _session.get(
            API_URL + f"/users/{user or self.username}",
            params={"include_stopped_servers": True},
            headers=self._headers(token=self.tokens[0]),
        )
        r.raise_for_status()
        user = r.json()
        return user

    @requires_user_token
    def get_server(self, username, servername=None) -> typing.Optional[typing.Union[dict, typing.Iterable[dict]]]:
        """Returns the given server for the given user or all servers if servername is None"""
        users = self.get_users()
        filter_given_user = [user for user in users if user["name"] == username]
        if not filter_given_user:
            logger.info(f"No user with username: {username} found.")
            return
        else:
            assert len(filter_given_user) == 1
            given_user = filter_given_user[0]
                
        if servername: 
            for name, server in given_user["servers"].items():
                if name == servername:
                    return server
        else:
            # return all user servers
            return given_user["servers"]

    @staticmethod
    def normalize_server_name(servername):
        # Convert text to lowercase
        text = servername.lower()
        # Remove all special characters except spaces and hyphen
        text = re.sub(r"[^a-z0-9\s-]", "", text)
        # Replace spaces with hyphens
        text = text.replace(" ", "-")
        # Max limit for servername is 255 chars
        return text[:240]

    @requires_user_token
    def start_server(self, username, servername):
        server_owner = username
        if not servername:
            logger.info("Starting JupyterLab server")
            # Default server, which is JupyterLab (not named server)
            servername = ""
            user_options = {}
        else:
            # Get named server
            server = self.get_server(username, servername)
            if not server:
                return None
            user_options = server["user_options"]
        url = f"/users/{server_owner}/servers/{servername}"
        data = {"name": servername, **user_options}
        response = _session.post(API_URL + url, headers=self._headers(), json=data)
        logger.info("Start server response", status_code=response.status_code, servername=servername)
        return response

    @requires_user_token
    def create_server(self, username: str, servername: str, user_options: UserOptions = None) -> tuple[int, str]:
        logger.info("Creating new server", user=username)
        user_servers = self.get_server(username)
        normalized_servername = self.normalize_server_name(servername)
        logger.info("User servers", user_servers=user_servers.keys())
        # If server with the given name already exists
        # This is to allow users to create apps with a reasonably deterministic url
        # instead of a random url everytime. This is more of a temporary solution, until
        # we have an explicit way to control the url in the UI itself.
        if normalized_servername in user_servers:
            unique_servername = f"{normalized_servername}-{uuid.uuid4().hex[:7]}"
        else:
            unique_servername = normalized_servername
        logger.info("Normalized servername", servername=servername)
        return self._create_server(username, unique_servername, user_options)

    @requires_user_token
    def edit_server(self, username: str, servername: str, user_options: UserOptions = None) -> tuple[int, str]:
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

    def _create_server(self, username: str, servername: str, user_options: UserOptions = None) -> tuple[int, str]:
        url = f"/users/{username}/servers/{servername}"
        params = user_options.model_dump()
        data = {"name": servername, **params}
        logger.info("Creating new server", server_name=servername)
        r = _session.post(API_URL + url, headers=self._headers(), json=data)
        r.raise_for_status()
        if user_options.framework != Framework.jupyterlab.value:
            if is_jupyterhub_5():
                logger.info("Sharing", share_with=user_options.share_with)
                self._share_server_with_multiple_entities(
                    username,
                    servername,
                    share_with=user_options.share_with
                )
            else:
                logger.info("Not sharing server as JupyterHub < 5.x")
        else:
            logger.info(f"Not sharing the server as Framework is {user_options.framework}, "
                        f"sharing JupyterLab servers is not allowed.")
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
        return _session.post(
            API_URL + url,
            headers=self._headers(),
            json=data
        )

    def _share_server_with_multiple_entities(
            self,
            username: str,
            servername: str,
            share_with: typing.Optional[SharePermissions] = None
    ):
        """
        :param username: owner of the servername
        :param servername: servername to share
        :param share_to_users: list of users to share the server with
        :param share_to_groups: list of groups to share the server with
        :return: mapping of dict of users + group to corresponding response json from Hub API
        """
        if not share_with:
            logger.info("Neither of share_to_user or share_to_group provided, NOT sharing")
            return
        logger.info(
            f"Requested to share {username}/{servername}",
            share_to_users=share_with.users, share_to_groups=share_with.groups
        )
        users = share_with.users or []
        groups = share_with.groups or []
        share_to_user_args = [(username, servername, user, None,) for user in users]
        share_to_group_args = [(username, servername, None, group,) for group in groups]
        executor_arguments = share_to_user_args + share_to_group_args
        # Remove any previously shared access, this is useful when editing apps
        self._revoke_shared_access(username, servername)
        # NOTE: JupyterHub 5.x doesn't provide a way for bulk sharing, as in share with a
        # set of groups and users. Since we don't have a task queue in jhub-apps at the moment,
        # we're using multithreading to call JupyterHub API to share the app with multiple users/groups
        # to remove any visible lag in the API request to create server.
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
        logger.info("Revoking shared servers access", user=username, servername=servername)
        url = f"/shares/{username}/{servername}"
        return _session.delete(API_URL + url, headers=self._headers())

    def get_shared_servers(self, username: str = None):
        """List servers shared with user"""
        username = username or self.username
        if not is_jupyterhub_5():
            logger.info("Unable to get shared servers as this feature is not available in JupyterHub < 5.x")
            return []
        logger.info("Getting shared servers", user=username)
        url = f"/users/{username}/shared"
        # Use the service token; `shares` (granted by japps-service-role on
        # jh>=5) covers `read:users:shares`. Skips the token create+revoke.
        response = _session.get(
            API_URL + url, headers=self._headers(token=self.tokens[0])
        )
        rjson = response.json()
        shared_servers = rjson["items"]
        return shared_servers

    @requires_user_token
    def delete_server(self, username, server_name, remove=False) -> int:
        if server_name is None:
            # Default server and not named server
            server_name = ""
        url = f"/users/{username}/servers/{server_name}"
        # This will remove it from the database, otherwise it will just stop the server
        params = {"remove": remove}
        r = _session.delete(API_URL + url, headers=self._headers(), json=params)
        r.raise_for_status()
        return r.status_code

    def get_services(self):
        # `read:services` on the service role covers this — no need to mint
        # a user-impersonation token.
        r = _session.get(
            API_URL + "/services", headers=self._headers(token=self.tokens[0])
        )
        r.raise_for_status()
        return r.json()

    def get_groups(self):
        """Returns all the groups in JupyterHub"""
        r = _session.get(API_URL + "/groups", headers=self._headers())
        r.raise_for_status()
        return r.json()

    def get_group(self, name: str) -> dict:
        """Return a single group. Includes the member usernames in `users`."""
        r = _session.get(
            API_URL + f"/groups/{name}",
            headers=self._headers(token=self.tokens[0]),
        )
        r.raise_for_status()
        return r.json()

    @requires_user_token
    def get_user_scopes(self):
        assert self.token_json
        assert "scopes" in self.token_json
        return self.token_json["scopes"]


def get_users_and_group_allowed_to_share_with(user):
    """Names the user is permitted to read for the share-with dropdown.

    Never cached: group membership can change in Keycloak at any moment
    (Nebari syncs that through), and the share dropdown must reflect
    the change on the very next open.

    Walks the user's *full role-scoped* permissions (the OAuth-issued
    JWT scopes are a strict subset and don't carry the read scopes the
    user's role grants — minting a token and reading its `.scopes`
    field is still the most direct way to enumerate them) and:

      - extracts explicit `!user=NAME` / `!group=NAME` targets straight
        out of the scope strings — no hub call,
      - resolves `read:users:name!group=G` to G's member list via one
        `GET /groups/{G}` call (the most direct endpoint for that),
      - falls back to a single full `GET /users` (or `GET /groups`)
        only when the holder has the *broad* `read:users:name` /
        `read:groups:name` scope, where the answer is the whole cluster.
    """
    hclient = HubClient(username=user.name)
    user_scopes = hclient.get_user_scopes()
    return {
        "users": _resolve_share_targets(
            hclient, user_scopes, kind="users", current_name=user.name
        ),
        "groups": _resolve_share_targets(
            hclient, user_scopes, kind="groups", current_name=None
        ),
    }


def _resolve_share_targets(hclient, scopes, kind, current_name):
    """kind is 'users' or 'groups'."""
    # only available in JupyterHub>=5
    from jupyterhub.scopes import expand_scopes

    expanded = expand_scopes(scopes)
    singular = kind[:-1]  # 'users' -> 'user'
    name_prefix = f"read:{kind}:name!{singular}="
    group_prefix = f"read:{kind}:name!group="
    broad_scopes = {f"read:{kind}:name", f"read:{kind}"}

    if any(s in expanded for s in broad_scopes):
        # Truly cluster-wide — listing is unavoidable, but we only do it
        # in this branch.
        if kind == "users":
            names = {u["name"] for u in hclient.get_users()}
        else:
            names = {g["name"] for g in hclient.get_groups()}
    else:
        names = set()
        for scope in expanded:
            if scope.startswith(name_prefix):
                names.add(scope[len(name_prefix):])
            elif kind == "users" and scope.startswith(group_prefix):
                gname = scope[len(group_prefix):]
                # Most direct: `GET /groups/{gname}` returns member names.
                group = hclient.get_group(gname)
                names.update(group.get("users") or [])

    if current_name is not None:
        names.discard(current_name)
    return sorted(names)


