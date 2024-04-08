import typing
from dataclasses import dataclass
from enum import Enum
from pathlib import Path

HERE = Path(__file__).parent.parent.resolve()

STATIC_PATH = HERE.joinpath("static/img/logos")


@dataclass
class FrameworkConf:
    name: str
    display_name: str
    logo: Path


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
        logo=STATIC_PATH.joinpath("panel.png"),
    ),
    FrameworkConf(
        name=Framework.bokeh.value,
        display_name="Bokeh",
        logo=STATIC_PATH.joinpath("bokeh.png"),
    ),
    FrameworkConf(
        name=Framework.streamlit.value,
        display_name="Streamlit",
        logo=STATIC_PATH.joinpath("streamlit.png"),
    ),
    FrameworkConf(
        name=Framework.voila.value,
        display_name="Voila",
        logo=STATIC_PATH.joinpath("voila.png"),
    ),
    FrameworkConf(
        name=Framework.plotlydash.value,
        display_name="PlotlyDash",
        logo=STATIC_PATH.joinpath("plotly-dash.png"),
    ),
    FrameworkConf(
        name=Framework.gradio.value,
        display_name="Gradio",
        logo=STATIC_PATH.joinpath("gradio.png"),
    ),
    # FrameworkConf(
    #     name=Framework.jupyterlab.value,
    #     display_name="JupyterLab",
    #     logo="",
    # ),
    FrameworkConf(
        name=Framework.custom.value,
        display_name="Custom Command",
        logo=STATIC_PATH.joinpath("custom.png"),
    ),
]

FRAMEWORKS_MAPPING = {framework.name: framework for framework in FRAMEWORKS}
