import panel as pn

from jhub_apps.launcher.panel_app import createApp


def app():
    pn.serve(
        {'/app': createApp},
        port=5000,
        address="127.0.0.1",
        allow_websocket_origin=["127.0.0.1:5000"],
        show=False,
    )


if __name__ == '__main__':
    app()
