from pathlib import Path

from jupyterhub.spawner import SimpleLocalProcessSpawner

from jhub_apps.spawner.command import DEFAULT_CMD, COMMANDS

TEMPLATES_DIR = Path(__file__).parent / "templates"


class JHubSpawner(SimpleLocalProcessSpawner):
    def get_args(self):
        """Return arguments to pass to the notebook server"""
        argv = super().get_args()
        if self.user_options.get("argv"):
            argv.extend(self.user_options["argv"])

        if self.user_options.get("jhub_app"):
            framework = self.user_options.get("framework")
            command_args = COMMANDS.get(framework)["args"]
            argv.extend(command_args)
            if framework == "voila":
                env = self.get_env()
                jh_service_prefix = env.get("JUPYTERHUB_SERVICE_PREFIX")
                # TODO: Fix url hardcoding
                base_url = f"http://127.0.0.1:8000{jh_service_prefix}"
                base_url_param = "{--}Voila.base_url=" + f"{base_url}"
                argv.append(base_url_param)
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
            print(f"Updated environment: {type(env)} {env}")
        return env

    async def start(self):
        print("*" * 200)
        print(f"User options: {self.user_options}")
        if self.user_options.get("jhub_app"):
            self.cmd = DEFAULT_CMD
        print("*" * 200)
        return await super().start()
