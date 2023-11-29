import os

import pytest


@pytest.fixture()
def app():
    os.environ["JUPYTERHUB_API_URL"] = "/"
    os.environ["JUPYTERHUB_API_TOKEN"] = "token"
    from jhub_apps.service.app import create_app
    app = create_app()
    app.config.update({
        "TESTING": True,
    })

    # other setup can go here
    yield app
    # clean up / reset resources here


@pytest.fixture()
def client(app):
    with app.test_client() as client:
        with client.session_transaction() as session:
            session['token'] = "sample-token"
        yield client
