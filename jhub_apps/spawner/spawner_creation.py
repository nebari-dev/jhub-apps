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
    TString,
)
from jhub_apps.spawner.types import Framework


logger = structlog.get_logger(__name__)

# jhub-app-proxy configuration
JHUB_APP_PROXY_INSTALL_URL = "https://raw.githubusercontent.com/nebari-dev/jhub-app-proxy/main/install.sh"


def get_proxy_version(config, app_env=None):
    """Get jhub-app-proxy version from app environment or config.

    Args:
        config: JupyterHub config object
        app_env: Environment variables dict for the specific app deployment

    Returns:
        Version string (e.g., 'v0.5')

    Priority order:
        1. App-specific environment variable JHUB_APP_PROXY_VERSION
        2. Config value c.JAppsConfig.jhub_app_proxy_version
    """
    if app_env and "JHUB_APP_PROXY_VERSION" in app_env:
        return app_env["JHUB_APP_PROXY_VERSION"]
    return config.JAppsConfig.jhub_app_proxy_version


def wrap_command_with_proxy_installer(cmd_list, proxy_version):
    """
    Wraps a command list in a bash script that installs jhub-app-proxy if needed.

    Args:
        cmd_list: List of command arguments (e.g., ['jhub-app-proxy', '--authtype=oauth', ...])
        proxy_version: Version of jhub-app-proxy to install (e.g., 'v0.5')

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
    echo "Running: curl -fsSL {JHUB_APP_PROXY_INSTALL_URL} | bash -s -- -v {proxy_version}"
    curl -fsSL {JHUB_APP_PROXY_INSTALL_URL} | bash -s -- -v {proxy_version}
fi

# Execute the original command
echo "Running command: {cmd_str}"
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
                # Custom commands can be any executable - use the command as-is
                command = Command(args=[
                    TString("--conda-env=$conda_env"),
                    "--",
                ] + custom_cmd.split())
            else:
                command: Command = COMMANDS.get(framework)

            command_args = command.get_substituted_args(
                python_exec=self.config.JAppsConfig.python_exec,
                filepath=app_filepath,
                origin_host=get_origin_host(self.config.JupyterHub.bind_url),
                base_url=self.config.JupyterHub.bind_url,
                jh_service_prefix=jh_service_prefix,
                jh_service_prefixlab=f"{jh_service_prefix}lab",
                voila_base_url=f"{jh_service_prefix}",
                conda_env=self.user_options.get("conda_env", ""),
            )
            return command_args

        def get_args(self):
            """Return arguments to pass to the notebook server"""
            argv = super().get_args()
            if self.user_options.get("argv"):
                argv.extend(self.user_options["argv"])

            # All jhub apps (including JupyterLab) are now built in start()
            # to allow proper wrapping with installer script
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
            if self.user_options.get("jhub_app"):
                # JupyterLab has built-in JupyterHub auth, so use authtype=none
                # Other apps need OAuth authentication via the proxy
                if framework == Framework.jupyterlab.value:
                    auth_type = "none"
                elif self.user_options.get("public", False):
                    auth_type = "none"
                else:
                    auth_type = "oauth"

                # Build base jhub-app-proxy command
                base_cmd = DEFAULT_CMD.get_substituted_args(
                    python_exec=self.config.JAppsConfig.python_exec,
                    authtype=auth_type,
                )

                env = self.user_options.get("env", {})
                if self.user_options.get("keep_alive") or (env and env.get("JH_APPS_KEEP_ALIVE")):
                    logger.info(
                        "Flag set to force keep alive, will not be deleted by idle culler",
                        app=self.user_options.get("display_name"),
                        framework=self.user_options.get("framework")
                    )
                    base_cmd.append("--force-alive")
                else:
                    base_cmd.append("--no-force-alive")

                # Add git repository arguments to base_cmd (before -- separator)
                repository = self.user_options.get("repository")
                if repository:
                    logger.info(f"repository specified: {repository}")
                    # The repository will be cloned during spawn time to
                    # deploy the app from the repository.
                    repo_folder = f"/tmp/{self.name}-{uuid.uuid4().hex[:6]}"
                    base_cmd.extend([
                        f"--repo={repository.get('url')}",
                        f"--repofolder={repo_folder}",
                        f"--repobranch={repository.get('ref')}",
                        f"--workdir={repo_folder}"
                    ])

                # Get app-specific command arguments (works for all frameworks including JupyterLab)
                app_args = self._get_app_command_args()

                # Combine base command with app arguments
                complete_cmd = base_cmd + app_args

                # Get proxy version from app-specific environment or config
                proxy_version = get_proxy_version(self.config, self.user_options.get("env"))

                # Wrap the complete command with jhub-app-proxy installer
                self.cmd = wrap_command_with_proxy_installer(complete_cmd, proxy_version)

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
