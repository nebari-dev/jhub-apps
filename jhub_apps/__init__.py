from pathlib import Path

from jhub_apps.config_utils import JAppsConfig  # noqa: F401
from jhub_apps.service_utils import service_for_jhub_apps  # noqa: F401

HERE = Path(__file__).parent.resolve()

TEMPLATE_PATH = HERE.joinpath("templates")

theme_template_paths = [TEMPLATE_PATH]
