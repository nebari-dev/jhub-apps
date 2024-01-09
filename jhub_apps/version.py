from importlib.metadata import version
from packaging.version import Version


def get_version():
    return Version(version("jhub-apps"))
