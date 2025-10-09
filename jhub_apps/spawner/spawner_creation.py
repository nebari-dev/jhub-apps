import shlex
import uuid

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

# jhub-app-proxy version to install
JHUB_APP_PROXY_VERSION = "v0.3"
JHUB_APP_PROXY_INSTALL_URL = "https://raw.githubusercontent.com/nebari-dev/jhub-app-proxy/main/install.sh"


def wrap_command_with_proxy_installer(cmd_list):
    """
    Wraps a command list in a bash script that installs jhub-app-proxy if needed.

    Args:
        cmd_list: List of command arguments (e.g., ['jhub-app-proxy', '--authtype=oauth', ...])

    Returns:
        List with bash wrapper: ['/bin/bash', '-c', '<script>']
    """
    # Convert command list to a shell-escaped string
    cmd_str = ' '.join(shlex.quote(str(arg)) for arg in cmd_list)

    install_script = f'''
# Ensure ~/.local/bin is in PATH first
export PATH="$HOME/.local/bin:$PATH"

# Install jhub-app-proxy if not present
if ! command -v jhub-app-proxy &> /dev/null; then
    echo "jhub-app-proxy not found, installing..."
    curl -fsSL {JHUB_APP_PROXY_INSTALL_URL} | bash -s -- -v {JHUB_APP_PROXY_VERSION}
fi

# Execute the original command
exec {cmd_str}
'''.strip()

    return ['/bin/bash', '-c', install_script]


def subclass_spawner(base_spawner):
    # TODO: Find a better way to do this
    class JHubSpawner(base_spawner):

        async def _get_user_auth_state(self):
            try:
                auth_state = await self.user.get_auth_state()
                return auth_state
            except Exception as e:
                logger.exception(e)

        def _get_app_command_args(self):
            """Build command arguments for jhub apps (extracted from get_args)"""
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

            repository = self.user_options.get("repository")
            if repository:
                logger.info(f"repository specified: {repository}")
                # The repository will be cloned during spawn time to
                # deploy the app from the repository.
                command.args.extend([
                    f"--repo={repository.get('url')}",
                    f"--repofolder=/tmp/{self.name}-{uuid.uuid4().hex[:6]}",
                    f"--repobranch={repository.get('ref')}"
                ])

            command_args = command.get_substituted_args(
                python_exec=self.config.JAppsConfig.python_exec,
                filepath=app_filepath,
                origin_host=get_origin_host(self.config.JupyterHub.bind_url),
                base_url=self.config.JupyterHub.bind_url,
                jh_service_prefix=jh_service_prefix,
                voila_base_url=f"{jh_service_prefix}",
                conda_env=self.user_options.get("conda_env", ""),
            )
            return command_args

        def get_args(self):
            """Return arguments to pass to the notebook server"""
            argv = super().get_args()
            if self.user_options.get("argv"):
                argv.extend(self.user_options["argv"])

            # For non-JupyterLab jhub apps, command is built in start()
            # to allow proper wrapping with installer script
            framework = self.user_options.get("framework")
            if self.user_options.get("jhub_app") and framework == Framework.jupyterlab.value:
                command_args = self._get_app_command_args()
                argv.extend(command_args)
            return argv

        def get_env(self):
            env = super().get_env()
            if self.user_options.get("env"):
                env.update(self.user_options["env"])

            if self.user_options.get("jhub_app"):
                framework = self.user_options.get("framework")
                jh_service_prefix = env.get("JUPYTERHUB_SERVICE_PREFIX")
                # Pass the JupyterHub allocated port to jhub-app-proxy
                env["JHUB_APPS_SPAWNER_PORT"] = str(self.port)
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

                # Build base jhub-app-proxy command
                base_cmd = DEFAULT_CMD.get_substituted_args(
                    python_exec=self.config.JAppsConfig.python_exec,
                    authtype=auth_type,
                )

                env = self.user_options.get("env", {})
                # Only for non-JupyterLab apps
                if self.user_options.get("keep_alive") or (env and env.get("JH_APPS_KEEP_ALIVE")):
                    logger.info(
                        "Flag set to force keep alive, will not be deleted by idle culler",
                        app=self.user_options.get("display_name"),
                        framework=self.user_options.get("framework")
                    )
                    base_cmd.append("--force-alive")
                else:
                    base_cmd.append("--no-force-alive")

                # Get app-specific command arguments
                app_args = self._get_app_command_args()

                # Combine base command with app arguments
                complete_cmd = base_cmd + app_args

                # Wrap the complete command with jhub-app-proxy installer
                self.cmd = wrap_command_with_proxy_installer(complete_cmd)

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
