import argparse

import panel as pn

from jhub_apps.launcher.panel_app import create_app


def app(origin_host):
    pn.serve(
        {"/": create_app},
        port=5000,
        allow_websocket_origin=[origin_host],
        show=False,
        prefix="/services/launcher/",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Launcher arguments")
    parser.add_argument(
        "--origin-host", type=str, help="origin host for the launcher panel app"
    )
    args = parser.parse_args()
    app(origin_host=args.origin_host)
