# TODO: Fix this hardcoding
import string
import typing
from dataclasses import dataclass

DEFAULT_CMD = ["python", "-m", "jhsingle_native_proxy.main", "--authtype=none"]

# TODO: Fix this hardcoding
BASE_EXAMPLES_PATH = "/Users/aktech/quansight/jhub-apps/jhub_apps/examples"
EXAMPLES_PATH = {
    "panel": f"{BASE_EXAMPLES_PATH}/panel_basic.py",
    "bokeh": f"{BASE_EXAMPLES_PATH}/bokeh_basic.py",
    "streamlit": f"{BASE_EXAMPLES_PATH}/streamlit_app.py",
    "plotlydash": f"{BASE_EXAMPLES_PATH}/plotlydash_app.py",
    "voila": f"{BASE_EXAMPLES_PATH}/voila_basic.ipynb",
    "gradio": f"{BASE_EXAMPLES_PATH}/gradio_basic.py",
}

base_url = "http://127.0.0.1:8000"
origin_host = "127.0.0.1:8000"


@dataclass
class TString:
    value: str

    def replace(self, **kwargs):
        template = string.Template(self.value)
        keys_to_substitute = set()
        for k, v in kwargs.items():
            if f"${k}" in self.value:
                keys_to_substitute.add(k)
        subs = {
            k: v for k, v in kwargs.items()
            if k in keys_to_substitute
        }
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


panel_cmd = Command(args=[
    "--destport=0",
    "python",
    "{-}m",
    "bokeh_root_cmd.main",
    TString("$filepath"),
    "{--}port={port}",
    "{--}debug",
    TString("{--}allow-websocket-origin=$origin_host"),
    "{--}server=panel",
    TString("{--}prefix=$base_url"),
    "--ready-check-path=/ready-check",
])

COMMANDS = {
    "gradio": Command(
        args=[
            "--destport=0",
            "python",
            TString("$filepath"),
        ],
    ),
    "voila": Command(
        args=[
            "--destport=0",
            "python",
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
            "--progressive",
            "--ready-check-path=/voila/static/",
        ],
    ),
    "streamlit": Command(
        args=[
            "--destport=0",
            "streamlit",
            "run",
            TString("$filepath"),
            "{--}server.port={port}",
            "{--}server.headless=True",
            TString("{--}browser.serverAddress=$origin_host"),
            "{--}browser.gatherUsageStats=false",
        ],
    ),
    "plotlydash": Command(
        args=[
            "--destport=0",
            "python",
            "{-}m",
            "plotlydash_tornado_cmd.main",
            TString("$filepath"),
            "{--}port={port}",
        ],
    ),
    "bokeh": Command(
        args=[
            "--destport=0",
            "python",
            "{-}m",
            "bokeh_root_cmd.main",
            TString("$filepath"),
            "{--}port={port}",
            TString("{--}allow-websocket-origin=$origin_host"),
            TString("{--}prefix=$base_url"),
            "--ready-check-path=/ready-check",
        ]
    ),
    "panel": Command(
        args=[
            "--destport=0",
            "python",
            "{-}m",
            "bokeh_root_cmd.main",
            TString("$filepath"),
            "{--}port={port}",
            "{--}debug",
            TString("{--}allow-websocket-origin=$origin_host"),
            "{--}server=panel",
            TString("{--}prefix=$base_url"),
            "--ready-check-path=/ready-check",
        ]),
}
