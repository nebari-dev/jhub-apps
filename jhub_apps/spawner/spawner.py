from pathlib import Path

from jupyterhub.spawner import SimpleLocalProcessSpawner

from jhub_apps.spawner.command import DEFAULT_CMD, COMMANDS, Command, EXAMPLES_PATH

TEMPLATES_DIR = Path(__file__).parent / "templates"


BASE_URL = "http://127.0.0.1:8000"
ORIGIN_HOST = "127.0.0.1:8000"


class JHubSpawner(SimpleLocalProcessSpawner):
    def get_args(self):
        """Return arguments to pass to the notebook server"""
        argv = super().get_args()
        if self.user_options.get("argv"):
            argv.extend(self.user_options["argv"])

        if self.user_options.get("jhub_app"):
            env = self.get_env()
            jh_service_prefix = env.get("JUPYTERHUB_SERVICE_PREFIX")
            framework = self.user_options.get("framework")
            command: Command = COMMANDS.get(framework)
            command_args = command.get_substituted_args(
                filepath=EXAMPLES_PATH.get(framework),
                origin_host=ORIGIN_HOST,
                base_url=BASE_URL,
                jh_service_prefix=jh_service_prefix,
                voila_base_url=f"{BASE_URL}{jh_service_prefix}",
            )
            argv.extend(command_args)
        return argv

    def get_env(self):
        env = super().get_env()
        if self.user_options.get("env"):
            env.update(self.user_options["env"])

        if self.user_options.get("jhub_app"):
            framework = self.user_options.get("framework")
            jh_service_prefix = env.get("JUPYTERHUB_SERVICE_PREFIX")
            if framework == "plotlydash":
                env["DASH_REQUESTS_PATHNAME_PREFIX"] = jh_service_prefix
        return env

    async def start(self):
        if self.user_options.get("jhub_app"):
            self.cmd = DEFAULT_CMD
        return await super().start()
