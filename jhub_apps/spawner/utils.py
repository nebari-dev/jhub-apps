from urllib.parse import urlparse


def get_origin_host(bind_url):
    parsed_url = urlparse(bind_url)
    if "0.0.0.0" in parsed_url.netloc:
        # Hack: Useful for local development when using docker
        # Maybe take it from the user via JAppsConfig?
        return "127.0.0.1:8000"
    return parsed_url.netloc
