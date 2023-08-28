import panel as pn

from jhub_apps.constants import ORIGIN_HOST
from jhub_apps.launcher.panel_app import create_app


def app():
    pn.serve(
        {"/app": create_app},
        port=5000,
        # address="localhost",
        allow_websocket_origin=[
            # "localhost:8000",
            # "127.0.0.1:8000",
            ORIGIN_HOST
        ],
        show=False,
    )


if __name__ == "__main__":
    app()
