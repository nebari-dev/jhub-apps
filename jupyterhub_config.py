c.JupyterHub.services = [
    {
        'name': 'jhub-apps',
        'command': [sys.executable, '-m', 'ls'],
    }
]

c.JupyterHub.load_roles = [
    {
        "name": "jupyterhub-apps",  # name the role
        "services": [
            "jhub-apps",  # assign the service to this role
        ],
        "scopes": [
            # declare what permissions the service should have
            "list:users",  # list users
            "read:users:activity",  # read user last-activity
            "admin:servers",  # start/stop servers
        ],
    }
]
