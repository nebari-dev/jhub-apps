from urllib.parse import urlparse

from jhub_apps.spawner.command import (
    EXAMPLES_DIR,
    COMMANDS,
    Command,
    EXAMPLES_FILE,
    DEFAULT_CMD,
)
from jhub_apps.spawner.types import Framework

from traitlets import Dict, Unicode, List
from tljh import user
from tljh.normalize import generate_system_username


def subclass_spawner(base_spawner):
    class JHubSpawner(base_spawner):

        user_groups = Dict(key_trait=Unicode(), value_trait=List(Unicode()), config=True)

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

        def start(self):
            if self.user_options.get("jhub_app"):
                self.cmd = DEFAULT_CMD
            # FIXME: Move this elsewhere? Into the Authenticator?
            system_username = generate_system_username('jupyter-' + self.user.name)

            # FIXME: This is a hack. Allow setting username directly instead
            self.username_template = system_username
            user.ensure_user(system_username)
            user.ensure_user_group(system_username, 'jupyterhub-users')
            if self.user.admin:
                user.ensure_user_group(system_username, 'jupyterhub-admins')
            else:
                user.remove_user_group(system_username, 'jupyterhub-admins')
            if self.user_groups:
                for group, users in self.user_groups.items():
                    if self.user.name in users:
                        user.ensure_user_group(system_username, group)
            return super().start()

        def _expand_user_vars(self, string):
            """
            Expand user related variables in a given string

            Currently expands:
              {USERNAME} -> Name of the user
              {USERID} -> UserID
           """
            jhub_server_name = ''
            if self.name:
                jhub_server_name = '-{}'.format(self.name)
            return string.replace('{USERNAME}', self.user.name).replace(
                '{USERID}', str(self.user.id)).replace('{JHUBSERVERNAME}', jhub_server_name)
    return JHubSpawner
