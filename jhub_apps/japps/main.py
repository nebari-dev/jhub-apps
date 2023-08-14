from jupyterhub.spawner import LocalProcessSpawner
from jupyterhub.spawner import SimpleLocalProcessSpawner


class JHubSpawner(SimpleLocalProcessSpawner):
    pass


def app():
    print("Hello world")
    import time
    time.sleep(500)
    return 1
