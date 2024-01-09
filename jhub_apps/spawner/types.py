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
    conda_env: typing.Optional[dict] = None
    profile: typing.Optional[str] = None


class Framework(Enum):
    panel = "panel"
    bokeh = "bokeh"
    streamlit = "streamlit"
    plotlydash = "plotlydash"
    voila = "voila"
    gradio = "gradio"
    jupyterlab = "jupyterlab"
    custom = "custom"

    @classmethod
    def values(cls):
        return [member.value for role, member in cls.__members__.items()]


FRAMEWORKS = [
    FrameworkConf(
        name=Framework.panel.value,
        display_name="Panel",
        logo="/services/japps/static/img/logos/panel.png",
    ),
    FrameworkConf(
        name=Framework.bokeh.value,
        display_name="Bokeh",
        logo="/services/japps/static/img/logos/bokeh.png",
    ),
    FrameworkConf(
        name=Framework.streamlit.value,
        display_name="Streamlit",
        logo="/services/japps/static/img/logos/streamlit.png",
    ),
    FrameworkConf(
        name=Framework.voila.value,
        display_name="Voila",
        logo="/services/japps/static/img/logos/voila.png",
    ),
    FrameworkConf(
        name=Framework.plotlydash.value,
        display_name="PlotlyDash",
        logo="/services/japps/static/img/logos/plotly-dash.png",
    ),
    FrameworkConf(
        name=Framework.gradio.value,
        display_name="Gradio",
        logo="/services/japps/static/img/logos/gradio.png",
    ),
    # FrameworkConf(
    #     name=Framework.jupyterlab.value,
    #     display_name="JupyterLab",
    #     logo="https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Jupyter_logo.svg/1200px-Jupyter_logo.svg.png",
    # ),
    FrameworkConf(
        name=Framework.custom.value,
        display_name="Custom Command",
        logo="/services/japps/static/img/logos/jupyter.png",
    ),
]

FRAMEWORKS_MAPPING = {framework.name: framework for framework in FRAMEWORKS}
