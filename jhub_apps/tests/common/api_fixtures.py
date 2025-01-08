import logging
import os
import subprocess
import time
import psutil
import pytest
from fastapi.testclient import TestClient
from jhub_apps.tests.common.constants import MOCK_USER

class JupyterHubManager:
    def __init__(self):
        self.process = None
        self.log_file = None
        self.env_vars = {}

    def start(self):
        # Check if processes are already running on ports 8000 and 10202 and throw error if so
        for conn in psutil.net_connections(kind='inet'):
            if conn.laddr.port in [8000, 10202] and conn.status == psutil.CONN_LISTEN:
                raise Exception(f"Port {conn.laddr.port} is already in use by PID {conn.pid}")
    

        if self.process is None:
            self.log_file = open("jupyterhub-logs.txt", "w")
            self.process = subprocess.Popen(
                ["jupyterhub", "-f", "jupyterhub_config.py"], # , "--port", port],
                stdout=self.log_file,
                stderr=subprocess.STDOUT
            )
            # wait a bit and check if the process is still running
            time.sleep(3)
            if self.process.poll() is not None:
                raise Exception("JupyterHub process failed to start")
            self.env_vars = self.get_jhub_apps_env_vars()

    def stop(self):
        if self.process is not None:
            self.process.terminate()
            self.process.wait()
            self.log_file.close()
            self.process = None
            self.log_file = None

    def restart(self):
        self.stop()
        self.start()

    def get_jhub_apps_env_vars(self):
        # Wait for the jhub_apps subprocess to start and listen on port 10202
        jhub_apps_process = None
        while not jhub_apps_process:
            for conn in psutil.net_connections(kind='inet'):
                if conn.laddr.port == 10202 and conn.status == psutil.CONN_LISTEN:
                    jhub_apps_process = psutil.Process(conn.pid)
                    break
            time.sleep(1)
        
        # Capture the environment variables of the jhub_apps subprocess
        env_vars = jhub_apps_process.environ()
        return env_vars
    
@pytest.fixture(scope="session")
def jupyterhub_manager():
    manager = JupyterHubManager()
    manager.start()
    os.environ.update(manager.env_vars)
    yield manager
    manager.stop()

# @pytest.fixture(autouse=True)
# def set_env_vars(jupyterhub_manager):
#     os.environ.update(jupyterhub_manager.env_vars)


@pytest.fixture
def client():
    logging_format = (
        "%(asctime)s %(levelname)9s %(name)s:%(lineno)4s: %(message)s"
    )
    logging.basicConfig(
        level=logging.INFO, format=logging_format
    )
    os.environ["JUPYTERHUB_API_URL"] = "/"
    os.environ["JUPYTERHUB_API_TOKEN"] = "token"
    os.environ["PUBLIC_HOST"] = "/"
    os.environ["JUPYTERHUB_CLIENT_ID"] = "test-client-id"
    os.environ["JUPYTERHUB_OAUTH_CALLBACK_URL"] = "/"
    from jhub_apps.service.app import app
    from jhub_apps.service.security import get_current_user

    async def mock_get_user_name():
        return MOCK_USER

    app.dependency_overrides[get_current_user] = mock_get_user_name
    return TestClient(app=app)
