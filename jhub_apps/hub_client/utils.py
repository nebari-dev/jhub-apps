import jupyterhub


def is_jupyterhub_5():
    return jupyterhub.version_info[0] == 5
