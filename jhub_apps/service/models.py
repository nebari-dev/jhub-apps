import typing
from datetime import datetime
from typing import Any, Dict, List, Optional


from pydantic import BaseModel


# https://jupyterhub.readthedocs.io/en/stable/_static/rest-api/index.html
class Server(BaseModel):
    name: str
    ready: bool
    pending: Optional[str]
    url: str
    progress_url: str
    started: datetime
    last_activity: datetime
    state: Optional[Any]
    user_options: Optional[Any]


class User(BaseModel):
    name: str
    admin: bool
    groups: Optional[List[str]]
    kind: str
    server: Optional[str] = None
    pending: Optional[str] = None
    last_activity: Optional[datetime] = None
    servers: Optional[Dict[str, Server]] = None
    scopes: List[str]
    auth_state: Optional[Dict] = None


# https://stackoverflow.com/questions/64501193/fastapi-how-to-use-httpexception-in-responses
class AuthorizationError(BaseModel):
    detail: str


class HubResponse(BaseModel):
    msg: str
    request_url: str
    token: str
    response_code: int
    hub_response: dict


class HubApiError(BaseModel):
    detail: HubResponse


class UserOptions(BaseModel):
    jhub_app: bool
    display_name: str
    description: str
    thumbnail: str = None
    filepath: typing.Optional[str] = str()
    framework: str = "panel"
    custom_command: typing.Optional[str] = str()
    conda_env: typing.Optional[str] = str()
    profile: typing.Optional[str] = str()
    # Make app available to public (unauthenticated Hub users)
    public: typing.Optional[bool] = False


class ServerCreation(BaseModel):
    servername: str
    user_options: UserOptions
