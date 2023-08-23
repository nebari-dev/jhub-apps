from dataclasses import dataclass
from typing import Any

import panel as pn

from jhub_apps.launcher.hub_client import HubClient


@dataclass
class InputFormWidget:
    name_input: Any
    filepath_input: Any
    description_input: Any
    spinner: Any
    button_widget: Any
    framework: Any


FRAMEWORKS = {
    "Panel": "panel",
    "Bokeh": "bokeh",
    "Streamlit": "streamlit",
    "Voila": "voila",
    "Plotly": "plotlydash",
    "Gradio": "gradio",
}

pn.config.sizing_mode = "stretch_width"

LOGO_MAPPING = {
    "panel": "https://raw.githubusercontent.com/holoviz/panel/main/doc/_static/logo_stacked.png",
    "streamlit": "https://streamlit.io/images/brand/streamlit-mark-color.png",
    "bokeh": "https://static.bokeh.org/branding/icons/bokeh-icon@5x.png",
    "voila": "https://raw.githubusercontent.com/voila-dashboards/voila/main/docs/voila-logo.svg",
    "plotly": "https://repository-images.githubusercontent.com/33702544/b4400c80-718b-11e9-9f3a-306c07a5f3de",
}


def _get_image_item(logo, desc, link):
    return {"image": logo, "description": desc, "link": link}


# ... [same imports and definitions]

# Define the items list
items = [
    _get_image_item(logo=LOGO_MAPPING.get("panel"), desc="Panel Desc", link="/"),
    _get_image_item(
        logo=LOGO_MAPPING.get("streamlit"), desc="Streamlit Desc", link="/"
    ),
    _get_image_item(logo=LOGO_MAPPING.get("bokeh"), desc="Bokeh Desc", link="/"),
    _get_image_item(logo=LOGO_MAPPING.get("voila"), desc="Voila Desc", link="/"),
    _get_image_item(logo=LOGO_MAPPING.get("plotly"), desc="Plotly Desc", link="/"),
]


class ListItem(pn.Column):  # Change the base class to pn.Column
    def __init__(self, logo, desc, link, **params):
        self.logo = logo
        self.desc = desc
        self.link = link

        # Define Panel buttons
        self.view_button = pn.widgets.Button(name="View", button_type="primary")
        self.edit_button = pn.widgets.Button(name="Edit", button_type="warning")
        self.delete_button = pn.widgets.Button(name="Delete", button_type="danger")

        # Set up event listeners for the buttons
        self.view_button.on_click(self.on_view)
        self.edit_button.on_click(self.on_edit)
        self.delete_button.on_click(self.on_delete)

        # Using a Row to group the image, description, and buttons horizontally
        content = pn.Row(
            pn.pane.PNG(self.logo, width=50),
            pn.pane.Markdown(
                f"**{self.desc}**", margin=(0, 20, 0, 10)
            ),  # Using Markdown to make the text bold
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

        super().__init__(content, **params)  # Initializing the pn.Column base class

    def on_view(self, event):
        print(f"View button clicked! {self.desc} {event}")
        # window.open(self.link, '_blank')  # Open the link in a new tab

    def on_edit(self, event):
        print(f"Edit button clicked! {self.desc} {event}")
        # Add your edit functionality here

    def on_delete(self, event):
        print(f"Delete button clicked! {self.desc} {event}")
        # Add your edit functionality here


list_items = []
for item in items:
    list_item = ListItem(
        logo=item["image"], desc=item["description"], link=item["link"]
    )
    list_items.append(list_item)

heading = pn.pane.Markdown("## Your Dashboards", sizing_mode="stretch_width")

# Wrap everything in a Column with the list-container class
layout = pn.Column(
    heading,
    *list_items,
    css_classes=["list-container"],
    width=800,
    sizing_mode="stretch_width",
    margin=(10, 20),
)


def create_input_form():
    heading = pn.pane.Markdown("## Create Apps", sizing_mode="stretch_width")
    input_form_widget = InputFormWidget(
        name_input=pn.widgets.TextInput(name="Name"),
        filepath_input=pn.widgets.TextInput(name="Filepath"),
        description_input=pn.widgets.TextAreaInput(name="Description"),
        spinner=pn.indicators.LoadingSpinner(
            size=30, value=True, color="secondary", bgcolor="dark", visible=True
        ),
        button_widget=pn.widgets.Button(name="Create Dashboard", button_type="primary"),
        framework=pn.widgets.Select(name="Framework", options=FRAMEWORKS),
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


def create_dashboard(event, input_form_widget, input_form):
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
    # TODO: Get user from request
    hclient.create_server("aktech", name.lower(), params=params)
    input_form.pop(-1)
    # TODO: Fix Url hardcoding
    dashboard_link = f"http://localhost:8000/user/aktech/{name}"
    text_with_link = pn.pane.Markdown(
        f"""
    ## 🚀 Dashboard created: [{dashboard_link}]({dashboard_link}).
    """
    )
    input_form.append(text_with_link)
    print(event)


def create_app():
    print("*" * 100)
    print("CREATING APP")
    print("*" * 100)
    input_form_widget, input_form = create_input_form()

    def button_callback(event):
        return create_dashboard(event, input_form_widget, input_form)

    input_form_widget.button_widget.on_click(button_callback)
    created_apps = layout
    return pn.Row(input_form, created_apps).servable()
