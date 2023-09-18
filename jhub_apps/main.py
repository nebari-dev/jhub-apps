from jhub_apps.__about__ import __version__

import argparse


def app():
    parser = argparse.ArgumentParser(
        prog='JHub Apps',
        description='JupyterHub App Launcher')
    parser.add_argument('--version', action='version', version=__version__)
    parser.parse_args()
