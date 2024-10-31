from dataclasses import dataclass
from enum import Enum
from pathlib import Path

HERE = Path(__file__).parent.parent.resolve()

LOGO_BASE_PATH = "/services/japps/static/img/logos/",
STATIC_PATH = HERE.joinpath("static/img/logos")


@dataclass
class FrameworkConf:
    name: str
    display_name: str
    logo_path: Path
    # logo url
    logo: str

    def json(self):
        return {
            "name": self.name,
            "display_name": self.display_name,
            "logo": self.logo,
        }


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
        logo_path=STATIC_PATH.joinpath("panel.png"),
        logo=f"{LOGO_BASE_PATH}/panel.png"
    ),
    FrameworkConf(
        name=Framework.bokeh.value,
        display_name="Bokeh",
        logo_path=STATIC_PATH.joinpath("bokeh.png"),
        logo=f"{LOGO_BASE_PATH}/bokeh.png"
    ),
    FrameworkConf(
        name=Framework.streamlit.value,
        display_name="Streamlit",
        logo_path=STATIC_PATH.joinpath("streamlit.png"),
        logo=f"{LOGO_BASE_PATH}/streamlit.png"
    ),
    FrameworkConf(
        name=Framework.voila.value,
        display_name="Voila",
        logo_path=STATIC_PATH.joinpath("voila.png"),
        logo=f"{LOGO_BASE_PATH}/voila.png"
    ),
    FrameworkConf(
        name=Framework.plotlydash.value,
        display_name="PlotlyDash",
        logo_path=STATIC_PATH.joinpath("plotly-dash.png"),
        logo=f"{LOGO_BASE_PATH}/plotly-dash.png"
    ),
    FrameworkConf(
        name=Framework.gradio.value,
        display_name="Gradio",
        logo_path=STATIC_PATH.joinpath("gradio.png"),
        logo=f"{LOGO_BASE_PATH}/gradio.png"
    ),
    FrameworkConf(
        name=Framework.jupyterlab.value,
        display_name="JupyterLab",
        logo_path=STATIC_PATH.joinpath("jupyter.png"),
        logo=f"{LOGO_BASE_PATH}/jupyter.png",
    ),
    FrameworkConf(
        name=Framework.custom.value,
        display_name="Custom Command",
        logo_path=STATIC_PATH.joinpath("custom.png"),
        logo=f"{LOGO_BASE_PATH}/custom.png"
    ),
]

FRAMEWORKS_MAPPING = {framework.name: framework for framework in FRAMEWORKS}
