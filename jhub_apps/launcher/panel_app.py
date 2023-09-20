import json
import os
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import panel as pn

from jhub_apps.launcher.hub_client import HubClient
from jhub_apps.spawner.types import Framework, FRAMEWORKS_MAPPING, FrameworkConf

EDIT_APP_BTN_TXT = "Edit App"
CREATE_APP_BTN_TXT = "Create App"
THUMBNAILS_PATH = "/tmp"


@dataclass
class InputFormWidget:
    name_input: Any
    filepath_input: Any
    thumbnail: Any
    description_input: Any
    spinner: Any
    button_widget: Any
    framework: Any


@dataclass
class ServiceFormWidget:
    name_input: Any
    thumbnail: Any
    description_input: Any
    link: Any
    spinner: Any
    button_widget: Any


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
            thumbnail=user_options.get("thumbnail")
        )
        apps.append(app)
    return apps


class ListItem(pn.Column):
    def __init__(self, app: App, username, **params):
        self.app = app
        self.username = username

        # Define Panel buttons
        self.view_button = pn.widgets.Button(name="Launch", button_type="primary")
        self.edit_button = pn.widgets.Button(name="Edit", button_type="primary", button_style="outline")
        self.delete_button = pn.widgets.Button(name="Delete", button_type="danger", button_style="outline")

        # Set up event listeners for the buttons
        code = f"""window.location.href = '{self.app.url}'"""
        self.view_button.js_on_click(code=code)
        self.edit_button.on_click(self.on_edit)
        self.delete_button.on_click(self.on_delete)

        # Using a Row to group the image, description, and buttons horizontally
        buttons = pn.Column(
            self.view_button,
            pn.Row(
                self.edit_button,
                self.delete_button,
            )
        )
        self.content = pn.Column(
            pn.Row(
                pn.pane.Image(
                    self.app.thumbnail or self.app.logo,
                    link_url=self.app.url,
                    width=150, height=150,
                    align='center',
                    # sizing_mode="stretch_width",
                ),
                sizing_mode="stretch_width",
            ),
            pn.pane.Markdown(
                f"""
                ## {self.app.name}
                {self.app.description or "No description found for app"}
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


class ListServiceItem(pn.Column):
    def __init__(self, service: dict, username, **params):
        self.service = service
        self.username = username

        css = """
        .custom-heading {
            text-align: center;
            font-family: Mukta, sans-serif;
        }
        """
        pn.extension(raw_css=[css])
        self.content = pn.Column(
            pn.Row(
                pn.pane.Image(
                    service["thumbnail"],
                    link_url=service["link"],
                    width=50, height=50,
                    align='center',
                    ),
                sizing_mode="stretch_width",
            ),
            pn.pane.Markdown(
                f"#### {service['name']}",
                sizing_mode="stretch_width",
                css_classes=['custom-heading']
            ),
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


def get_services(username):
    service_json_path = Path(f"{username}-services.json")
    service_json = {}
    if service_json_path.exists():
        with open(service_json_path, 'r') as fp:
            service_json = json.loads(fp.read())
    return service_json


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


def get_services_component(username):
    services = get_services(username)
    service_items = []
    for service_name, service in services.items():
        service_item = ListServiceItem(service, username=username)
        service_items.append(service_item)

    create_service_button = pn.widgets.Button(
        name="Create Service", button_type="primary"
    )
    service_button_code = f"window.location.href = '/services/japps/create-service'"
    create_service_button.js_on_click(code=service_button_code)
    services_grid = pn.GridBox(*service_items, ncols=7)
    return create_service_button, services_grid


def heading_markdown(heading):
    return pn.pane.Markdown(
        f"""
        <style>
            .custom-background {{
                background-color: lightblue;
                 font-family: Mukta, sans-serif;
            }}
        </style>

        <div class="custom-background">

        # {heading}

        </div>
        """,
        sizing_mode="stretch_width"
    )


def create_apps_grid(username):
    print("Create Dashboards Layout")
    _, shared_apps_grid = get_server_apps_component(username="aktech")
    create_app_button, apps_grid = get_server_apps_component(username)
    create_service_button, services_grid = get_services_component(username)

    layout = pn.Column(
        pn.Row(
            create_app_button,
            create_service_button,
            sizing_mode="fixed",
        ),
        heading_markdown("Services"),
        services_grid,
        heading_markdown("Your Apps"),
        apps_grid,
        heading_markdown("Shared Apps"),
        shared_apps_grid,
        css_classes=["list-container"],
        width=800,
        sizing_mode="stretch_width",
        margin=(10, 20),
    )
    return layout


def get_input_form_widget():
    frameworks_display = {f.display_name: f.name for f in FRAMEWORKS_MAPPING.values()}
    heading = pn.pane.Markdown("## Create Apps", sizing_mode="stretch_width")
    input_form_widget = InputFormWidget(
        name_input=pn.widgets.TextInput(name="Name", id="app_name_input"),
        filepath_input=pn.widgets.TextInput(name="Filepath"),
        thumbnail=pn.widgets.FileInput(name="Thumbnail"),
        description_input=pn.widgets.TextAreaInput(name="Description"),
        spinner=pn.indicators.LoadingSpinner(
            size=30, value=True, color="secondary", bgcolor="dark", visible=True
        ),
        button_widget=pn.widgets.Button(name=CREATE_APP_BTN_TXT, button_type="primary"),
        framework=pn.widgets.Select(name="Framework", options=frameworks_display),
    )
    input_form = pn.Column(
        heading,
        input_form_widget.name_input,
        input_form_widget.filepath_input,
        pn.pane.Markdown("App Thumbnail"),
        input_form_widget.thumbnail,
        input_form_widget.description_input,
        input_form_widget.framework,
        input_form_widget.button_widget,
        width=400,
    )
    return input_form_widget, input_form


def get_services_form_widget():
    heading = pn.pane.Markdown("## Create Service", sizing_mode="stretch_width")
    input_form_widget = ServiceFormWidget(
        name_input=pn.widgets.TextInput(name="Name", id="app_name_input"),
        link=pn.widgets.TextInput(name="Link", id="app_link_input"),
        thumbnail=pn.widgets.FileInput(name="Thumbnail"),
        description_input=pn.widgets.TextAreaInput(name="Description"),
        spinner=pn.indicators.LoadingSpinner(
            size=30, value=True, color="secondary", bgcolor="dark", visible=True
        ),
        button_widget=pn.widgets.Button(name="Create Service", button_type="primary"),
    )
    input_form = pn.Column(
        heading,
        input_form_widget.name_input,
        pn.pane.Markdown("App Thumbnail"),
        input_form_widget.thumbnail,
        input_form_widget.description_input,
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

    thumbnail_local_filepath = None
    thumbnail = input_form_widget.thumbnail
    if thumbnail.value is not None:
        thumbnail_file_split = thumbnail.filename.split('.')
        extension = thumbnail_file_split[-1]
        filename_wo_extension = ''.join(thumbnail_file_split[:-1])
        filename_to_save = f"{filename_wo_extension}-{uuid.uuid4().hex}.{extension}"
        thumbnail_local_filepath = os.path.join(THUMBNAILS_PATH, filename_to_save)
        thumbnail.save(thumbnail_local_filepath)

    hclient = HubClient()
    params = {
        "name": input_form_widget.name_input.value,
        "filepath": input_form_widget.filepath_input.value,
        "description": input_form_widget.description_input.value,
        "framework": input_form_widget.framework.value,
        "thumbnail": thumbnail_local_filepath
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


def create_app_form_page():
    input_form_widget, input_form = get_input_form_widget()
    username = get_username()
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


def _create_service(input_form_widget: ServiceFormWidget, input_form, username):

    thumbnail = input_form_widget.thumbnail
    thumbnail_local_filepath = None
    if thumbnail.value is not None:
        thumbnail_file_split = thumbnail.filename.split('.')
        extension = thumbnail_file_split[-1]
        filename_wo_extension = ''.join(thumbnail_file_split[:-1])
        filename_to_save = f"{filename_wo_extension}-{uuid.uuid4().hex}.{extension}"
        thumbnail_local_filepath = os.path.join(THUMBNAILS_PATH, filename_to_save)
        print(f"Saving service thumbnail to: {thumbnail_local_filepath}")
        thumbnail.save(thumbnail_local_filepath)

    service = {
        "name": input_form_widget.name_input.value,
        "description": input_form_widget.description_input.value,
        "thumbnail": thumbnail_local_filepath,
        "link": input_form_widget.link.value or ''
    }
    service_json_path = Path(f"{username}-services.json")

    if service_json_path.exists():
        with open(service_json_path, 'r') as fp:
            service_json = json.loads(fp.read())
            service_json[service["name"]] = service
    else:
        service_json = {service["name"]: service}

    with open(service_json_path, 'w') as fp:
        json.dump(service_json, fp)

    input_form.append(pn.pane.Markdown("## Service Created!"))


def create_service_form_page():
    input_form_widget, input_form = get_services_form_widget()
    username = get_username()
    if not username:
        return pn.pane.Markdown("# No user found!")

    def button_callback(event):
        _create_service(input_form_widget, input_form, username)

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
    created_apps = create_apps_grid(username)
    return pn.Row(created_apps)
