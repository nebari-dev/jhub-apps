import structlog

from jhub_apps.spawner.utils import get_origin_host
from jhub_apps.spawner.command import (
    EXAMPLES_DIR,
    COMMANDS,
    Command,
    EXAMPLES_FILE,
    DEFAULT_CMD,
    GENERIC_ARGS,
)
from jhub_apps.spawner.types import Framework


logger = structlog.get_logger(__name__)


def subclass_spawner(base_spawner):
    # TODO: Find a better way to do this
    class JHubSpawner(base_spawner):

        async def _get_user_auth_state(self):
            try:
                auth_state = await self.user.get_auth_state()
                return auth_state
            except Exception as e:
                logger.exception(e)

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
                app_filepath = None
                if framework not in [
                    Framework.jupyterlab.value,
                    Framework.custom.value,
                ]:
                    app_filepath = filepath or EXAMPLES_DIR / EXAMPLES_FILE.get(
                        framework
                    )

                if not filepath:
                    # Saving the examples file path when not provided
                    self.user_options["filepath"] = str(app_filepath)

                custom_cmd = self.user_options.get("custom_command")
                if framework == Framework.custom.value:
                    assert custom_cmd
                    command = Command(args=GENERIC_ARGS + custom_cmd.split())
                else:
                    command: Command = COMMANDS.get(framework)
                command_args = command.get_substituted_args(
                    python_exec=self.config.JAppsConfig.python_exec,
                    filepath=app_filepath,
                    origin_host=get_origin_host(self.config.JupyterHub.bind_url),
                    base_url=self.config.JupyterHub.bind_url,
                    jh_service_prefix=jh_service_prefix,
                    voila_base_url=f"{jh_service_prefix}",
                    conda_env=self.user_options.get("conda_env", ""),
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
                elif framework == Framework.bokeh.value:
                    # Seems like the bokeh is always loading static files
                    # from localhost, this is a bug in bokeh, seen on 3.2.2
                    # at the time of writing this, this environment variable
                    # will load static files from cdn
                    # See this https://github.com/bokeh/bokeh/issues/13170
                    env["BOKEH_RESOURCES"] = "cdn"
            return env

        async def start(self):
            logger.info("Starting spawner process")
            await self._get_user_auth_state()
            framework = self.user_options.get("framework")
            if (
                self.user_options.get("jhub_app")
                and framework != Framework.jupyterlab.value
            ):
                auth_type = "oauth"
                if self.user_options.get("public", False):
                    auth_type = "none"
                self.cmd = DEFAULT_CMD.get_substituted_args(
                    python_exec=self.config.JAppsConfig.python_exec,
                    authtype=auth_type,
                )
            if framework == Framework.jupyterlab.value:
                self.cmd = [
                    self.config.JAppsConfig.python_exec,
                    "-m",
                    "jupyterhub.singleuser",
                ]
            logger.info(f"Final Spawner Command: {self.cmd}")
            return await super().start()

        def _expand_user_vars(self, string):
            """
            Expand user related variables in a given string

            Currently expands:
              {USERNAME} -> Name of the user
              {USERID} -> UserID
              {JHUBSERVERNAME} -> Name
            """
            jhub_server_name = ""
            if self.name:
                jhub_server_name = "-{}".format(self.name)
            return (
                string.replace("{USERNAME}", self.user.name)
                .replace("{USERID}", str(self.user.id))
                .replace("{JHUBSERVERNAME}", jhub_server_name)
            )

    return JHubSpawner
