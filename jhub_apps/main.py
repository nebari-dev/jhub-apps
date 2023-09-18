import subprocess
from pathlib import Path

from jhub_apps.__about__ import __version__

import argparse

PROJECT_ROOT_PATH = Path(__file__).parent.parent
DEFAULT_JUPYTERHUB_CONFIG = PROJECT_ROOT_PATH / "jupyterhub_config.py"
DEFAULT_JUPYTERHUB_SQLLITE_PATH = PROJECT_ROOT_PATH / "jupyterhub.sqlite"


def run_japps(jupyterhub_config):
    db_url = f"--JupyterHub.db_url=sqlite:////{DEFAULT_JUPYTERHUB_SQLLITE_PATH}"
    command = ["jupyterhub", "-f", str(jupyterhub_config), db_url]
    print(f"Running command: {' '.join(command)}")
    with subprocess.Popen(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    ) as process:
        try:
            while True:
                output = process.stdout.readline()
                if output == "" and process.poll() is not None:
                    break
                if output:
                    print(output.strip())
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            # Get the remaining output if any
            for output in process.stdout.readlines():
                print(output.strip())

    # Get the return code from the process and print it
    return_code = process.poll()
    print(f"Process returned with code {return_code}")


def app():
    parser = argparse.ArgumentParser(
        prog="JHub Apps", description="JupyterHub App Launcher"
    )
    parser.add_argument("--version", action="version", version=__version__)
    parser.add_argument(
        "-f",
        "--config-file",
        default=DEFAULT_JUPYTERHUB_CONFIG,
        help="Path to the JupyterHub config file",
    )
    args = parser.parse_args()
    run_japps(jupyterhub_config=args.config_file)
