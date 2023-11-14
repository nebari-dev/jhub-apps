from pathlib import Path

import tornado.web

from jhub_apps.config_utils import JAppsConfig  # noqa: F401

HERE = Path(__file__).parent.resolve()

TEMPLATE_PATH = HERE.joinpath("templates")
STATIC_PATH = HERE.joinpath("assets")

theme_extra_handlers = [
    (r"/assets/(.*)", tornado.web.StaticFileHandler, {"path": STATIC_PATH}),
]

theme_template_paths = [TEMPLATE_PATH]
