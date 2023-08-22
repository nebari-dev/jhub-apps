from pathlib import Path

from jupyterhub.spawner import SimpleLocalProcessSpawner

from jhub_apps.spawner.command import DEFAULT_CMD, COMMANDS

TEMPLATES_DIR = Path(__file__).parent / "templates"


class JHubSpawner(SimpleLocalProcessSpawner):

    def get_args(self):
        """Return arguments to pass to the notebook server"""
        argv = super().get_args()
        if self.user_options.get('argv'):
            argv.extend(self.user_options['argv'])

        if self.user_options.get("jhub_app"):
            argv.extend(COMMANDS.get('panel')['args'])
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
