from urllib.parse import urlparse

from jhub_apps.spawner.command import (
    EXAMPLES_DIR,
    COMMANDS,
    Command,
    EXAMPLES_FILE,
    DEFAULT_CMD,
)
from jhub_apps.spawner.types import Framework


def subclass_spawner(base_spawner):
    class JHubSpawner(base_spawner):
        def get_args(self):
            """Return arguments to pass to the notebook server"""
            argv = super().get_args()
            if self.user_options.get("argv"):
                argv.extend(self.user_options["argv"])

            if self.user_options.get("jhub_app"):
                filepath = self.user_options["filepath"]
                env = self.get_env()
                jh_service_prefix = env.get("JUPYTERHUB_SERVICE_PREFIX")
                framework = self.user_options.get("framework")
                app_filepath = filepath or EXAMPLES_DIR / EXAMPLES_FILE.get(framework)
                command: Command = COMMANDS.get(framework)
                parsed_url = urlparse(self.config.JupyterHub.bind_url)
                command_args = command.get_substituted_args(
                    filepath=app_filepath,
                    origin_host=parsed_url.netloc,
                    base_url=self.config.JupyterHub.bind_url,
                    jh_service_prefix=jh_service_prefix,
                    voila_base_url=f"{jh_service_prefix}",
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
                if framework == Framework.plotlydash.value:
                    env["DASH_REQUESTS_PATHNAME_PREFIX"] = jh_service_prefix
            return env

        async def start(self):
            if self.user_options.get("jhub_app"):
                self.cmd = DEFAULT_CMD
            return await super().start()

    return JHubSpawner
