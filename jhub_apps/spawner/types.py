from enum import Enum


class Framework(Enum):
    panel = "panel"
    bokeh = "bokeh"
    streamlit = "streamlit"
    plotlydash = "plotlydash"
    voila = "voila"
    gradio = "gradio"
    jupyterlab = "jupyterlab"

    @classmethod
    def values(cls):
        return [member.value for role, member in cls.__members__.items()]
