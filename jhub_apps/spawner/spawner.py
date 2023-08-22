from pathlib import Path

from jupyterhub.spawner import SimpleLocalProcessSpawner

TEMPLATES_DIR = Path(__file__).parent / "templates"

# TODO: Fix this hardcoding
presentation_path = "/Users/aktech/quansight/jhub-apps/test_panel_hello.py"
base_url = "http://127.0.0.1:8000"
origin_host = "localhost:8000"


DEFAULT_CMD = ['python', '-m', 'jhsingle_native_proxy.main', '--authtype=none']
PANEL_ARGS = [
    '--destport=0', 'python', '{-}m', 'bokeh_root_cmd.main', f'{presentation_path}',
    '{--}port={port}', '--debug',
    '{--}allow-websocket-origin='+f'{origin_host}',
    '{--}server=panel',
    '{--}prefix='+f'{base_url}',
    '--ready-check-path=/ready-check',
]


class JHubSpawner(SimpleLocalProcessSpawner):

    def get_args(self):
        """Return arguments to pass to the notebook server"""
        argv = super().get_args()
        if self.user_options.get('argv'):
            argv.extend(self.user_options['argv'])

        if self.user_options.get("jhub_app"):
            argv.extend(PANEL_ARGS)
        return argv

    def get_env(self):
        env = super().get_env()
        if self.user_options.get('env'):
            env.update(self.user_options['env'])
        return env

    async def start(self):
        print("*" * 200)
        print(f"User options: {self.user_options}")
        if self.user_options.get("jhub_app"):
            self.cmd = DEFAULT_CMD
        print("*" * 200)
        return await super().start()
