import argparse

from jhub_apps.version import get_version


def app():
    parser = argparse.ArgumentParser(description="Get the version of a package")
    parser.add_argument("--version", action="store_true", help="Print the version of jhub-apps")
    args = parser.parse_args()
    if args.version:
        version_info = get_version()
        print(version_info)
