from dataclasses import dataclass
from typing import Any

import panel as pn

from jhub_apps.launcher.hub_client import HubClient
from jhub_apps.spawner.types import FRAMEWORKS_MAPPING, FrameworkConf

EDIT_APP_BTN_TXT = "Edit App"
CREATE_APP_BTN_TXT = "Create App"


css = """
.custom-font {
    font-family: Mukta, sans-serif;
    font-size: 1.3em;
}
.bk-input {
    font-family: Mukta, sans-serif;
    font-size: 1.3em;
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
    description_input: Any
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
    url: str
    logo: str


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
        )
        apps.append(app)
    return apps


class ListItem(pn.Column):  # Change the base class to pn.Column
    def __init__(self, app: App, input_form_widget: InputFormWidget, **params):
        self.app = app
        self.input_form_widget = input_form_widget
        self.username = params.get("username")

        # Define Panel buttons
        self.view_button = pn.widgets.Button(name="Launch", button_type="primary")
        self.edit_button = pn.widgets.Button(
            name="Edit", button_type="primary", button_style="outline"
        )
        self.delete_button = pn.widgets.Button(
            name="Delete", button_type="danger", button_style="outline"
        )

        # Set up event listeners for the buttons
        code = f"""window.location.href = '{self.app.url}'"""
        self.view_button.js_on_click(code=code)
        self.edit_button.on_click(self.on_edit)
        self.delete_button.on_click(self.on_delete)

        # Using a Row to group the image, description, and buttons horizontally
        self.content = pn.Row(
            pn.pane.Image(
                self.app.logo,
                link_url=self.app.url,
                width=80,
                height=80,
                align=("center", "center"),
            ),
            pn.pane.Markdown(
                f"""
                <style>
                    .custom-background {{
                        font-family: Mukta, sans-serif;
                    }}
                </style>
                <div class="custom-background">

                ## {self.app.name}

                {self.app.description or "No description found for app"}
                </div>
                """,
                margin=(0, 20, 0, 10),
            ),
            self.view_button,
            self.edit_button,
            self.delete_button,
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

    def on_edit(self, event):
        print(f"Edit button clicked! {self.app.name} {event}")
        self.input_form_widget.name_input.value = self.app.name
        self.input_form_widget.button_widget.name = EDIT_APP_BTN_TXT
        self.input_form_widget.description_input.value = self.app.description
        self.input_form_widget.filepath_input.value = self.app.filepath
        self.input_form_widget.framework.value = self.app.framework

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


def create_list_apps(input_form_widget, username):
    print("Create Dashboards Layout")
    list_items = []
    apps = _get_server_apps(username)
    for app in apps:
        list_item = ListItem(
            app=app, input_form_widget=input_form_widget, username=username
        )
        list_items.append(list_item)

    # Wrap everything in a Column with the list-container class
    layout = pn.Column(
        heading_markdown("Your Apps"),
        *list_items,
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
        description_input=pn.widgets.TextAreaInput(
            name="Description", css_classes=["custom-font"]
        ),
        spinner=pn.indicators.LoadingSpinner(
            size=30, value=True, color="secondary", bgcolor="dark", visible=True
        ),
        button_widget=pn.widgets.Button(name=CREATE_APP_BTN_TXT, button_type="primary"),
        framework=pn.widgets.Select(
            name="Framework", options=frameworks_display, css_classes=["custom-font"]
        ),
    )
    input_form = pn.Column(
        heading,
        input_form_widget.name_input,
        input_form_widget.filepath_input,
        input_form_widget.description_input,
        input_form_widget.framework,
        input_form_widget.button_widget,
        width=400,
    )
    return input_form_widget, input_form


def _create_server(event, input_form_widget, input_form, username):
    if isinstance(input_form[-1], pn.pane.Markdown):
        # Remove the Markdown text, which says dashboard created
        input_form.pop(-1)
    input_form.append(input_form_widget.spinner)
    name = input_form_widget.name_input.value
    filepath = input_form_widget.filepath_input.value
    description = input_form_widget.description_input.value
    framework = input_form_widget.framework.value
    print(
        f"Name: {name}, Filepath: {filepath}, Description: {description}, framework: {framework}"
    )
    hclient = HubClient()
    params = {
        "name": input_form_widget.name_input.value,
        "filepath": input_form_widget.filepath_input.value,
        "description": input_form_widget.description_input.value,
        "framework": input_form_widget.framework.value,
    }
    edit = False
    if input_form_widget.button_widget.name.startswith("Edit"):
        edit = True
    try:
        response = hclient.create_server(
            username, name.lower(), edit=edit, params=params
        )
        print(f"Creation Response: {response}")
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
    dashboard_link = f"/user/{username}/{name}"
    dashboard_creation_action = "created"
    if edit:
        dashboard_creation_action = "updated"
    text_with_link = pn.pane.Markdown(
        f"""
    ## 🚀 App {dashboard_creation_action}: [👉🔗]({dashboard_link})
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


def create_app():
    print("*" * 100)
    print("CREATING APP")
    username = get_username()
    print(f"User: {username}")
    print("*" * 100)
    if not username:
        return pn.pane.Markdown("# No user found!")
    input_form_widget, input_form = get_input_form_widget()
    created_apps = create_list_apps(input_form_widget, username)
    apps_page = create_apps_page(input_form, created_apps)

    def button_callback(event):
        _create_server(event, input_form_widget, input_form, username)
        apps_page.pop(-1)
        apps_page.append(create_list_apps(input_form_widget, username))

    input_form_widget.button_widget.on_click(button_callback)
    return apps_page
