import string
import typing
from dataclasses import dataclass
from pathlib import Path

from jhub_apps.spawner.types import Framework


EXAMPLES_FILE = {
    Framework.panel.value: "panel_basic.py",
    Framework.bokeh.value: "bokeh_basic.py",
    Framework.streamlit.value: "streamlit_app.py",
    Framework.plotlydash.value: "plotlydash_app.py",
    Framework.voila.value: "voila_basic.ipynb",
    Framework.gradio.value: "gradio_basic.py",
}

EXAMPLES_DIR = Path(__file__).parent.parent / "examples"


@dataclass
class TString:
    value: str

    def replace(self, **kwargs):
        template = string.Template(self.value)
        keys_to_substitute = set()
        for k, v in kwargs.items():
            if f"${k}" in self.value:
                keys_to_substitute.add(k)
        subs = {k: v for k, v in kwargs.items() if k in keys_to_substitute}
        return template.substitute(subs)


@dataclass
class Command:
    args: typing.List[str]

    def get_substituted_args(self, **kwargs):
        subs_args = []
        for arg in self.args:
            s_arg = arg
            if isinstance(arg, TString):
                s_arg = arg.replace(**kwargs)
            subs_args.append(s_arg)
        return subs_args


DEFAULT_CMD = Command(
    args=[
        TString("$python_exec"),
        "-m",
        "jhsingle_native_proxy.main",
        TString("--authtype=$authtype"),
    ]
)

GENERIC_ARGS = [
    "--destport=0",
    "--ready-check-path=/ready-check",
    TString("--conda-env=$conda_env"),
    TString("$python_exec"),
    "{-}m",
]

COMMANDS = {
    Framework.gradio.value: Command(
        args=[
            "--destport=0",
            TString("--conda-env=$conda_env"),
            TString("$python_exec"),
            TString("$filepath"),
            "{--}server-port={port}",
            TString("{--}root-path=$jh_service_prefix"),
            "--ready-check-path=/",
        ],
    ),
    Framework.voila.value: Command(
        args=[
            "--destport=0",
            TString("--conda-env=$conda_env"),
            TString("$python_exec"),
            "{-}m",
            "voila",
            TString("$filepath"),
            "{--}port={port}",
            "{--}no-browser",
            "{--}Voila.server_url=/",
            "{--}Voila.ip=0.0.0.0",
            "{--}Voila.tornado_settings",
            "--debug",
            TString("allow_origin=$origin_host"),
            TString("{--}Voila.base_url=$voila_base_url"),
            "--progressive",
            "--ready-check-path=/voila/static/",
        ],
    ),
    Framework.streamlit.value: Command(
        args=[
            "--destport=0",
            TString("--conda-env=$conda_env"),
            TString("$python_exec"),
            "{-}m",
            "streamlit",
            "run",
            TString("$filepath"),
            "{--}server.port={port}",
            "{--}server.headless=True",
            TString("{--}browser.serverAddress=$origin_host"),
            "{--}browser.gatherUsageStats=false",
        ],
    ),
    Framework.plotlydash.value: Command(
        args=[
            "--destport=0",
            TString("--conda-env=$conda_env"),
            TString("$python_exec"),
            "{-}m",
            "plotlydash_tornado_cmd.main",
            TString("$filepath"),
            "{--}port={port}",
        ],
    ),
    Framework.bokeh.value: Command(
        args=[
            "--destport=0",
            TString("--conda-env=$conda_env"),
            TString("$python_exec"),
            "{-}m",
            "bokeh_root_cmd.main",
            TString("$filepath"),
            "{--}port={port}",
            TString("{--}allow-websocket-origin=$origin_host"),
            TString("{--}prefix=$base_url"),
            "--ip=0.0.0.0",
            "--ready-check-path=/ready-check",
        ]
    ),
    Framework.panel.value: Command(
        args=[
            "--destport=0",
            TString("--conda-env=$conda_env"),
            TString("$python_exec"),
            "{-}m",
            "bokeh_root_cmd.main",
            TString("$filepath"),
            "{--}port={port}",
            "{--}debug",
            TString("{--}allow-websocket-origin=$origin_host"),
            "{--}server=panel",
            TString("{--}prefix=$base_url"),
            "--ip=0.0.0.0",
            "--ready-check-path=/ready-check",
        ]
    ),
    Framework.jupyterlab.value: Command(args=[]),
}
