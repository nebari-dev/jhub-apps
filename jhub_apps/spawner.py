import shlex
from pathlib import Path

from jinja2 import Template
from jupyterhub.spawner import SimpleLocalProcessSpawner

TEMPLATES_DIR = Path(__file__).parent / "templates"

# presentation_path = "Panel_Introduction.ipynb"
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
    # cmd = ['jupyterhub-singleuser', '--debug']
    cmd = DEFAULT_CMD

    def _options_form_default(self):
        # https://jupyterhub.readthedocs.io/en/stable/reference/spawners.html#spawner-options-form
        default_env = "YOURNAME=%s\n" % self.user.name
        options_template = TEMPLATES_DIR / "server_options.html"
        runner_template = Template(open(options_template).read())
        rendered_template = runner_template.render(
            env=default_env,
        )
        return rendered_template

    def options_from_form(self, formdata):
        options = {}
        options['env'] = env = {}

        env_lines = formdata.get('env', [''])
        for line in env_lines[0].splitlines():
            if line:
                key, value = line.split('=', 1)
                env[key.strip()] = value.strip()

        arg_s = formdata.get('args', [''])[0].strip()
        if arg_s:
            options['argv'] = shlex.split(arg_s)
        return options

    def get_args(self):
        """Return arguments to pass to the notebook server"""
        argv = super().get_args()
        if self.user_options.get('argv'):
            argv.extend(self.user_options['argv'])
        argv.extend(PANEL_ARGS)
        return argv

    def get_env(self):
        env = super().get_env()
        if self.user_options.get('env'):
            env.update(self.user_options['env'])
        return env

    async def start(self):
        print("*" * 200)
        print("*" * 200)
        print(f"User options: {self.user_options}")
        print("*" * 200)
        print("*" * 200)
        return await super().start()
