def get_origin_host(bind_url):
    if bind_url == "":
        # Hack: Useful for local development when using docker
        # Maybe take it from the user via JAppsConfig?
        return "127.0.0.1:8000"
    return bind_url