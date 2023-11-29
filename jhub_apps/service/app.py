import os
import secrets
from pathlib import Path

from flask import Flask

from jhub_apps.service.routes import api

prefix = os.environ.get("JUPYTERHUB_SERVICE_PREFIX", "/")

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
STATIC_DIR = Path(__file__).parent.parent / "static"


def create_app():
    app = Flask(
        __name__,
        template_folder=TEMPLATES_DIR,
        static_folder=STATIC_DIR,
        static_url_path=prefix + "/static",
    )
    app.register_blueprint(api)
    # encryption key for session cookies
    app.secret_key = secrets.token_bytes(32)
    return app

