import pytest


@pytest.fixture(scope="session", autouse=True)
def autouse_jupyterhub_manager(jupyterhub_manager):
    yield jupyterhub_manager