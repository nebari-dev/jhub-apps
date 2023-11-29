import os
from functools import wraps

from bokeh.embed import server_document
from flask import make_response, redirect, render_template, request, session, Blueprint
from jupyterhub.services.auth import HubOAuth

from jhub_apps.launcher.hub_client import HubClient

prefix = os.environ.get("JUPYTERHUB_SERVICE_PREFIX", "/")
api = Blueprint("api", __name__)


def get_hub_oauth():
    return HubOAuth(
        api_token=os.environ.get("JUPYTERHUB_API_TOKEN", str()), cache_max_age=60
    )


def authenticated(f):
    """Decorator for authenticating with the Hub via OAuth"""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth = get_hub_oauth()
        token = session.get("token")

        if token:
            user = auth.user_for_token(token)
        else:
            user = None

        if user:
            return f(user, *args, **kwargs)
        else:
            # redirect to login url on failed auth
            state = auth.generate_state(next_url=request.path)
            response = make_response(redirect(auth.login_url + "&state=%s" % state))
            response.set_cookie(auth.state_cookie_name, state)
            return response

    return decorated


# @api.route(prefix + "server/<path:subpath>")
@api.route(f"{prefix}/server")
@api.route(f"{prefix}/server/<path:subpath>")
@authenticated
def servers(user, subpath=None):
    hub_client = HubClient()
    user = hub_client.get_user(user["name"])
    assert user
    return {"servers": user["servers"]}


@api.route(f"{prefix}/")
@api.route(f"{prefix}/<path:subpath>")
@authenticated
def index(user, subpath=None):
    request_args = dict(request.args)
    subpath = subpath if subpath else ""
    script = server_document(
        f"/services/launcher/{subpath}",
        arguments={"username": user["name"], **request_args},
    )
    return render_template(
        "launcher_base.html",
        jhub_api_title=os.environ.get("JHUB_APP_TITLE"),
        jhub_api_icon=os.environ.get("JHUB_APP_ICON"),
        **{"request": request, "script": script},
    )


@api.route(f"{prefix}/<path:path>")
def serve_static_file(path):
    # Serve static files from the static folder directly.
    return api.send_static_file(path)


@api.route(prefix + "oauth_callback")
def oauth_callback():
    code = request.args.get("code", None)
    if code is None:
        return 403

    # validate state field
    arg_state = request.args.get("state", None)
    auth = get_hub_oauth()
    cookie_state = request.cookies.get(auth.state_cookie_name)
    if arg_state is None or arg_state != cookie_state:
        # state doesn't match
        return 403

    token = auth.token_for_code(code)
    # store token in session cookie
    session["token"] = token
    next_url = auth.get_next_url(cookie_state) or prefix
    response = make_response(redirect(next_url))
    return response
