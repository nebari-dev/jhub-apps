import os
import secrets
from functools import wraps
from pathlib import Path

from bokeh.embed import server_document
from flask import Flask, make_response, redirect, request, session, render_template

from jupyterhub.services.auth import HubOAuth

prefix = os.environ.get("JUPYTERHUB_SERVICE_PREFIX", "/")

auth = HubOAuth(api_token=os.environ["JUPYTERHUB_API_TOKEN"], cache_max_age=60)

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
app = Flask(__name__, template_folder=TEMPLATES_DIR)

# encryption key for session cookies
app.secret_key = secrets.token_bytes(32)


def authenticated(f):
    """Decorator for authenticating with the Hub via OAuth"""

    @wraps(f)
    def decorated(*args, **kwargs):
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


@app.route(f"{prefix}/")
@app.route(f"{prefix}/<path:subpath>")
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
        jhub_app_title=os.environ.get("JHUB_APP_TITLE"),
        jhub_app_icon=os.environ.get("JHUB_APP_ICON"),
        **{"request": request, "script": script},
    )


@app.route(prefix + "oauth_callback")
def oauth_callback():
    code = request.args.get("code", None)
    if code is None:
        return 403

    # validate state field
    arg_state = request.args.get("state", None)
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
