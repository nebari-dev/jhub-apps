import os
import typing
import uuid
from dataclasses import dataclass
from typing import Any

import panel as pn

from jhub_apps.launcher.hub_client import HubClient
from jhub_apps.spawner.types import (
    FRAMEWORKS_MAPPING,
    FrameworkConf,
    UserOptions,
    Framework,
)

EDIT_APP_BTN_TXT = "Edit App"
CREATE_APP_BTN_TXT = "Create App"

THUMBNAILS_PATH = os.path.expanduser("~/jupyterhub-thumbnails")

if not os.path.exists(THUMBNAILS_PATH):
    os.mkdir(THUMBNAILS_PATH)


css = """
.custom-font {
    font-family: Mukta, sans-serif;
}

.bk-btn {
    font-family: Mukta, sans-serif;
    font-size: 1.4em;
}

.bk-btn:hover {
    background: #034c76 !important;
    color: white !important;
}

.bk-btn-danger:hover {
    background: #dc3545 !important;
    color: white !important;
}

.app-id-text {
    color: grey !important;
    font-size: 0.8em
}

.custom-heading {
    text-align: center;
}

.center-row-image {
    display: flex;
    justify-content: center;
}

.bk-Column {
    padding-right: 12px;
    padding-bottom: 12px;
}

"""
pn.extension(raw_css=[css])


css = """
.custom-font {
    font-family: Mukta, sans-serif;
    font-size: 1.3em;
}

.loading-apps {
    padding: 2em
}

.bk-input {
    font-family: Mukta, sans-serif;
    font-size: 1.1em;
}
.bk-btn {
    font-family: Mukta, sans-serif;
    font-size: 1.4em;
}
.bk-btn:hover {
    background: #034c76 !important;
    color: white !important;
}
.bk-btn-danger:hover {
    background: #dc3545 !important;
    color: white !important;
}
.custom-heading {
    text-align: center;
    word-wrap: break-word;
}

h2 {
    word-wrap: break-word;
}
.center-row-image {
    display: flex;
    justify-content: center;
}
.bk-Column {
    padding-right: 12px;
    padding-bottom: 12px;
}
"""
pn.extension(raw_css=[css])


@dataclass
class InputFormWidget:
    name_input: Any
    filepath_input: Any
    thumbnail: Any
    description_input: Any
    custom_command: Any
    spinner: Any
    button_widget: Any
    framework: Any


pn.config.sizing_mode = "stretch_width"


@dataclass
class App:
    name: str
    filepath: str
    description: str
    framework: str
    thumbnail: str
    url: str
    logo: str
    display_name: typing.Optional[str] = None


def _get_server_apps(username):
    hclient = HubClient()
    try:
        user = hclient.get_user(username)
    except Exception as e:
        print("No user found")
        return []
    servers = user["servers"]
    apps = []
    for server_name, server in servers.items():
        user_options = server["user_options"]
        if not user_options or not user_options.get("jhub_app"):
            print(f"Skipping displaying server: {server_name}")
            continue
        framework_conf: FrameworkConf = FRAMEWORKS_MAPPING.get(
            user_options["framework"]
        )
        app = App(
            name=server_name,
            filepath=user_options["filepath"],
            description=user_options["description"],
            framework=user_options["framework"],
            url=server["url"],
            logo=framework_conf.logo,
            thumbnail=user_options.get("thumbnail"),
            display_name=user_options.get("display_name", server_name),
        )
        apps.append(app)
    return apps


class ListItem(pn.Column):
    def __init__(self, app: App, username, **params):
        self.app = app
        self.username = username

        # Define Panel buttons
        self.view_button = pn.widgets.Button(name="Launch", button_type="primary")
        self.edit_button = pn.widgets.Button(
            name="Edit", button_type="primary", button_style="outline"
        )
        self.delete_button = pn.widgets.Button(
            name="Delete", button_type="danger", button_style="outline"
        )

        # Set up event listeners for the buttons
        code = f"""window.open('{self.app.url}', '_blank');"""
        edit_code = f"""window.open('/services/japps/create-app/?name={self.app.name}', '_blank');"""
        self.view_button.js_on_click(code=code)
        self.edit_button.js_on_click(code=edit_code)
        self.delete_button.on_click(self.on_delete)

        # Using a Row to group the image, description, and buttons horizontally
        buttons = pn.Column(
            self.view_button,
            pn.Row(
                self.edit_button,
                self.delete_button,
            ),
        )
        self.content = pn.Column(
            pn.Row(
                pn.pane.Image(
                    self.app.thumbnail or self.app.logo,
                    link_url=self.app.url,
                    width=130,
                    height=130,
                    align=("center", "center"),
                    # sizing_mode="stretch_width",
                ),
                css_classes=["center-row-image"],
            ),
            pn.pane.Markdown(
                f"""
                <div class="custom-font">
                {self.app.display_name}

                <div class="app-id-text">
                ID: {self.app.name}
                </div>

                {self.app.description or "No description found for app"}
                </div>
                """,
                margin=(0, 20, 0, 10),
            ),
            # self.view_button,
            buttons,
            css_classes=["list-item"],  # Apply the .list-item CSS styling
        )

        # Apply styles for the list item container
        item_style = """
        .list-item {
            border: 1px solid #e0e0e0;
            padding: 5px;
            border-radius: 4px;
            width: 100%;
            align-items: center;
        }
        """

        pn.config.raw_css.append(item_style)

        super().__init__(
            self.content, **params
        )  # Initializing the pn.Column base class

    def on_delete(self, event):
        print(f"Delete button clicked! {self.app.name} {event}")
        hclient = HubClient()
        self.delete_button.visible = False
        spinner = pn.indicators.LoadingSpinner(
            size=30, value=True, color="danger", bgcolor="dark", visible=True
        )
        self.content.append(spinner)
        hclient.delete_server(username=self.username, server_name=self.app.name)
        spinner.visible = False
        self.content.visible = False


def get_server_apps_component(username):
    list_items = []
    apps = _get_server_apps(username)
    for app in apps:
        list_item = ListItem(app=app, username=username)
        list_items.append(list_item)

    # Wrap everything in a Column with the list-container class
    apps_grid = pn.GridBox(*list_items, ncols=4)
    create_app_button = pn.widgets.Button(
        name=CREATE_APP_BTN_TXT, button_type="primary"
    )

    app_button_code = f"window.location.href = '/services/japps/create-app'"
    create_app_button.js_on_click(code=app_button_code)
    return create_app_button, apps_grid


def heading_markdown(heading):
    return pn.pane.Markdown(
        f"""
        <style>
            .custom-background {{
                padding: 0px 6px;
                background-color: lightblue;
                 font-family: Mukta, sans-serif;
            }}
        </style>
        <div class="custom-background">

        # {heading}

        </div>
        """,
        margin=0,
        sizing_mode="stretch_width",
    )


def create_apps_grid(username):
    print("Create Dashboards Layout")
    create_app_button, apps_grid = get_server_apps_component(username)
    layout = pn.Column(
        pn.Row(
            create_app_button,
            sizing_mode="fixed",
        ),
        heading_markdown("Your Apps"),
        apps_grid,
        css_classes=["list-container"],
        width=800,
        sizing_mode="stretch_width",
        margin=(10, 20),
    )
    return layout


def get_input_form_widget():
    frameworks_display = {f.display_name: f.name for f in FRAMEWORKS_MAPPING.values()}
    heading = heading_markdown("Create Apps")
    input_form_widget = InputFormWidget(
        name_input=pn.widgets.TextInput(
            name="Name", id="app_name_input", css_classes=["custom-font"]
        ),
        filepath_input=pn.widgets.TextInput(
            name="Filepath", css_classes=["custom-font"]
        ),
        thumbnail=pn.widgets.FileInput(name="Thumbnail", css_classes=["custom-font"]),
        description_input=pn.widgets.TextAreaInput(
            name="Description", css_classes=["custom-font"]
        ),
        custom_command=pn.widgets.TextInput(
            name="Custom Command", css_classes=["custom-font"], visible=False
        ),
        spinner=pn.indicators.LoadingSpinner(
            size=30, value=True, color="secondary", bgcolor="dark", visible=True
        ),
        button_widget=pn.widgets.Button(name=CREATE_APP_BTN_TXT, button_type="primary"),
        framework=pn.widgets.Select(
            name="Framework", options=frameworks_display, css_classes=["custom-font"]
        ),
    )

    def framework_handler(selected_framework):
        if selected_framework == Framework.generic.value:
            input_form_widget.custom_command.visible = True
        else:
            input_form_widget.custom_command.visible = False

    binding = pn.bind(framework_handler, input_form_widget.framework)

    input_form = pn.Column(
        binding,
        heading,
        input_form_widget.name_input,
        input_form_widget.filepath_input,
        pn.pane.Markdown("App Thumbnail", css_classes=["custom-font"]),
        input_form_widget.thumbnail,
        input_form_widget.description_input,
        input_form_widget.framework,
        input_form_widget.custom_command,
        input_form_widget.button_widget,
        width=400,
    )
    return input_form_widget, input_form


def _create_server(event, input_form_widget, input_form, username):
    if isinstance(input_form[-1], pn.pane.Markdown):
        # Remove the Markdown text, which says dashboard created
        input_form.pop(-1)
    input_form.append(input_form_widget.spinner)
    display_name = input_form_widget.name_input.value
    filepath = input_form_widget.filepath_input.value
    description = input_form_widget.description_input.value
    framework = input_form_widget.framework.value
    print(
        f"Name: {display_name}, Filepath: {filepath}, Description: {description}, framework: {framework}"
    )

    edit = False
    servername = display_name
    if input_form_widget.button_widget.name.startswith("Edit"):
        edit = True
        servername = input_form_widget.name_input.id

    thumbnail = input_form_widget.thumbnail
    thumbnail_local_filepath = thumbnail.value
    if thumbnail.value and thumbnail.filename:
        thumbnail_file_split = thumbnail.filename.split(".")
        extension = thumbnail_file_split[-1]
        filename_wo_extension = "".join(thumbnail_file_split[:-1])
        filename_to_save = f"{filename_wo_extension}-{uuid.uuid4().hex}.{extension}"
        thumbnail_local_filepath = os.path.join(THUMBNAILS_PATH, filename_to_save)
        thumbnail.save(thumbnail_local_filepath)

    hclient = HubClient()
    user_options = UserOptions(
        display_name=display_name,
        jhub_app=True,
        description=description,
        thumbnail=thumbnail_local_filepath,
        filepath=filepath,
        framework=framework,
        custom_command=input_form_widget.custom_command.value,
    )
    try:
        response_status_code, servername = hclient.create_server(
            username, servername or display_name, edit=edit, user_options=user_options
        )
        print(f"Creation Response status code: {response_status_code}")
    except Exception as e:
        print(f"Exception: {e}")
        error_content = e
        if hasattr(e, "response"):
            error_content = e.response.json()
        text_with_link = pn.pane.Markdown(
            f"""## ❌ App Creation failed \n```{error_content}```"""
        )
        input_form.pop(-1)
        input_form.append(text_with_link)
        return
    input_form.pop(-1)
    dashboard_link = f"/user/{username}/{servername}"
    dashboard_creation_action = "created"
    if edit:
        dashboard_creation_action = "updated"
    text_with_link = pn.pane.Markdown(
        f"""
        <style>
            .custom-response {{
                padding: 0px 6px;
                background-color: #dfdfed;
                font-family: Mukta, sans-serif;
            }}
        </style>
        <div class="custom-response">

        ## 🚀 App {dashboard_creation_action}: [👉🔗]({dashboard_link})

        </div>
    """
    )
    input_form.append(text_with_link)
    input_form_widget.button_widget.name = CREATE_APP_BTN_TXT
    print(event)


def create_apps_page(input_form, created_apps):
    return pn.Row(input_form, created_apps)


def get_username():
    # FIXME: This would be accessible by manually passing username
    # in the url
    username = pn.state.session_args.get("username")
    if username:
        return username[0].decode()


def create_app_form_page():
    input_form_widget, input_form = get_input_form_widget()
    input_form_widget: InputFormWidget
    app_name_arg = pn.state.session_args.get("name")

    username = get_username()
    if app_name_arg:
        app_name = app_name_arg[0].decode()
        hclient = HubClient()
        server = hclient.get_server(username=username, servername=app_name)
        input_form_widget.name_input.id = server.get("name")
        input_form_widget.name_input.value = server.get("user_options").get(
            "display_name", server.get("name")
        )
        input_form_widget.description_input.value = server.get("user_options").get(
            "description"
        )
        input_form_widget.filepath_input.value = server.get("user_options").get(
            "filepath"
        )
        input_form_widget.thumbnail.value = server.get("user_options").get("thumbnail")
        input_form_widget.button_widget.name = "Edit App"

    if not username:
        return pn.pane.Markdown("# No user found!")

    def button_callback(event):
        _create_server(event, input_form_widget, input_form, username)

    input_form_widget.button_widget.on_click(button_callback)

    your_apps_button = pn.widgets.Button(name="Apps", button_type="primary")
    code = f"window.location.href = '/services/japps/'"
    your_apps_button.js_on_click(code=code)

    return pn.Column(
        pn.Row(
            your_apps_button,
            sizing_mode="fixed",
        ),
        input_form,
    )


def apps_grid_view():
    print("*" * 100)
    print("CREATING APP")
    username = get_username()
    print(f"User: {username}")
    print("*" * 100)
    if not username:
        return pn.pane.Markdown("# No user found!")

    loading_message = pn.pane.Markdown(
        """
        ## Loading apps ...
        """,
        sizing_mode="stretch_width",
        css_classes=["custom-heading", "custom-font", "loading-apps"],
    )
    apps_grid = pn.Column(loading_message, loading=True)
    layout = pn.Row(
        apps_grid,
    )

    def load():
        apps_grid.append(create_apps_grid(username))
        apps_grid.loading = False
        loading_message.visible = False

    pn.state.onload(load)
    return layout
