import importlib
import os
import time
from unittest.mock import patch
import psutil
import pytest
import subprocess


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
    
        # Capture the environment variables of the jhub_apps subprocess so that HubClient will work correctly
        env_vars = jhub_apps_process.environ()
        env_vars.pop("JUPYTERHUB_SERVICE_PREFIX", None)  # client needs this unset as currently used in tests
        return env_vars


@pytest.fixture(scope="session", autouse=True)
def jupyterhub_manager():
    try:
        manager = JupyterHubManager()
        manager.start()
        os.environ.update(manager.env_vars)
        yield manager
    finally:
        manager.stop()
