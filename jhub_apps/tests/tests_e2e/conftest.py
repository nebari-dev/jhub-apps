import os
import socket
import time
import psutil
import pytest
import subprocess
import sys
import logging

logger = logging.getLogger(__name__)


class JupyterHubManager:
    def __init__(self):
        self.process = None
        self.log_file = None
        self.env_vars = {}

    @staticmethod
    def is_port_in_use(port):
        """Check if a port is in use by attempting to bind to it."""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return False
            except OSError:
                return True

    def start(self):
        # Check if processes are already running on ports 8000 and 10202 and throw error if so
        exceptions = []
        for port in [8000, 10202]:
            if self.is_port_in_use(port):
                exceptions.append(Exception(f"Port {port} is already in use"))
        if exceptions:
            if sys.version_info >= (3, 11):
                # ExceptionGroup added in 3.11
                raise ExceptionGroup("Needed ports in use:", exceptions)  # noqa: F821
            else:
                raise Exception(
                    exceptions
                )
    

        if self.process is None:
            # Use the virtual environment's jupyterhub
            jupyterhub_cmd = os.path.join(sys.prefix, "bin", "jupyterhub")
            if not os.path.exists(jupyterhub_cmd):
                # Fallback to system jupyterhub if not in venv
                jupyterhub_cmd = "jupyterhub"

            cmd = [jupyterhub_cmd, "-f", "jupyterhub_config.py"]
            logger.info(f"Starting JupyterHub with command: {' '.join(cmd)}")
            logger.info(f"JupyterHub binary: {jupyterhub_cmd}")
            logger.info(f"Python prefix: {sys.prefix}")

            self.log_file = open("jupyterhub-logs.txt", "w")
            self.process = subprocess.Popen(
                cmd,
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
        # Poll the port until it's in use, then find the process
        timeout = 60  # 60 seconds timeout
        start_time = time.time()

        while time.time() - start_time < timeout:
            if self.is_port_in_use(10202):
                # Port is now in use, find the child process
                # The jhub_apps service should be a child of jupyterhub
                jhub_apps_process = self._find_jhub_apps_process()
                if jhub_apps_process:
                    # Capture the environment variables of the jhub_apps subprocess
                    env_vars = jhub_apps_process.environ()
                    env_vars.pop("JUPYTERHUB_SERVICE_PREFIX", None)  # client needs this unset
                    return env_vars
            time.sleep(1)

        raise TimeoutError("jhub_apps service did not start within 60 seconds")

    def _find_jhub_apps_process(self):
        """Find the jhub_apps process by searching children of JupyterHub."""
        if self.process is None:
            return None

        try:
            parent = psutil.Process(self.process.pid)
            # Look through children for the jhub_apps service
            for child in parent.children(recursive=True):
                try:
                    # Check if this child process has the expected command line
                    cmdline = " ".join(child.cmdline())
                    if "jhub_apps" in cmdline or any("10202" in conn_str for conn_str in str(child.connections()) if hasattr(child, 'connections')):
                        return child
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue

            # Fallback: just return the first child if we can't identify it specifically
            children = parent.children(recursive=True)
            if children:
                return children[0]
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

        return None


@pytest.fixture(scope="session", autouse=True)
def jupyterhub_manager():
    try:
        manager = JupyterHubManager()
        manager.start()
        os.environ.update(manager.env_vars)
        yield manager
    finally:
        manager.stop()
