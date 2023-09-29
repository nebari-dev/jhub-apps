import typing
from dataclasses import dataclass
from enum import Enum


@dataclass
class FrameworkConf:
    name: str
    display_name: str
    logo: str


@dataclass
class UserOptions:
    jhub_app: bool
    display_name: str
    description: str
    thumbnail: str
    filepath: str
    framework: str
    custom_command: typing.Optional[str] = None
    env: typing.Optional[dict] = None


class Framework(Enum):
    panel = "panel"
    bokeh = "bokeh"
    streamlit = "streamlit"
    plotlydash = "plotlydash"
    voila = "voila"
    gradio = "gradio"
    jupyterlab = "jupyterlab"
    generic = "generic"

    @classmethod
    def values(cls):
        return [member.value for role, member in cls.__members__.items()]


FRAMEWORKS = [
    FrameworkConf(
        name=Framework.panel.value,
        display_name="Panel",
        logo="https://raw.githubusercontent.com/holoviz/panel/5c69f11bc139076a0e55d444dcfbf3e44b3ed8a8/doc/_static/logo.png",
    ),
    FrameworkConf(
        name=Framework.bokeh.value,
        display_name="Bokeh",
        logo="https://static.bokeh.org/branding/icons/bokeh-icon@5x.png",
    ),
    FrameworkConf(
        name=Framework.streamlit.value,
        display_name="Streamlit",
        logo="https://streamlit.io/images/brand/streamlit-mark-color.png",
    ),
    FrameworkConf(
        name=Framework.voila.value,
        display_name="Voila",
        logo="https://raw.githubusercontent.com/voila-dashboards/voila/main/docs/voila-logo.svg",
    ),
    FrameworkConf(
        name=Framework.plotlydash.value,
        display_name="PlotlyDash",
        logo="https://raw.githubusercontent.com/plotly/dash/6eaf2e17c25f7ca1847c41aafeb18e87c586cb9f/components/dash-table/tests/selenium/assets/logo.png",
    ),
    FrameworkConf(
        name=Framework.gradio.value,
        display_name="Gradio",
        logo="https://pbs.twimg.com/profile_images/1526964416834510848/Njy4Kh2q_400x400.jpg",
    ),
    FrameworkConf(
        name=Framework.jupyterlab.value,
        display_name="JupyterLab",
        logo="https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Jupyter_logo.svg/1200px-Jupyter_logo.svg.png",
    ),
    FrameworkConf(
        name=Framework.generic.value,
        display_name="Generic",
        logo="https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Jupyter_logo.svg/1200px-Jupyter_logo.svg.png",
    ),
]

FRAMEWORKS_MAPPING = {framework.name: framework for framework in FRAMEWORKS}
