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

pn.config.sizing_mode = 'stretch_width'



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
    _get_image_item(logo=LOGO_MAPPING.get('panel'), desc="Desc", link="/"),
    _get_image_item(logo=LOGO_MAPPING.get('streamlit'), desc="Desc", link="/"),
    _get_image_item(logo=LOGO_MAPPING.get('bokeh'), desc="Desc", link="/"),
    _get_image_item(logo=LOGO_MAPPING.get('voila'), desc="Desc", link="/"),
    _get_image_item(logo=LOGO_MAPPING.get('plotly'), desc="Desc", link="/"),
]

# ... [previous code imports and definitions]

# ... [previous code imports and definitions]

class ListItem(pn.pane.HTML):
    def __init__(self, logo, desc, link, **params):
        item_style = """
        .list-container {
            border: 2px solid #ccc;
            padding: 10px;
            width: 200%;
        }

        .list-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            border: 1px solid #e0e0e0; 
            padding: 5px;
            border-radius: 4px;
            width: 100%;   /* Increased width of the list item */
            margin: 0 auto;  /* Centers the list item if it's less than 100% width */
        }


        .item-description {
            font-size: 1.2em;  /* Increase the font size */
            margin-left: 10px; /* Space between image and description */
        }

        .item-image {
            margin-right: 10px;
        }

        .button-container {
            display: flex;
            margin-left: auto;
        }

        .list-button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 8px 16px;  /* Increase button size */
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.3s;
            font-size: 1.1em;  /* Increase font size */
            margin-left: 5px;
        }

        .list-button:hover {
            background-color: #2980b9;
        }

        .list-button.delete-button {
            background-color: #e74c3c;
        }
        """

        content = f"""
        <style>{item_style}</style>
        <div class="list-item">
            <img class="item-image" src="{logo}" width="50">
            <div class="item-description">{desc}</div>
            <div class="button-container">
                <button class="list-button view-button" onclick="openLink('{link}')">View</button>
                <button class="list-button edit-button">Edit</button>
                <button class="list-button delete-button">Delete</button>
            </div>
        </div>
        <script>
            function openLink(link) {{
                window.open(link, '_blank');
            }}
        </script>
        """
        super().__init__(content, **params)

# ... [rest of the code remains unchanged, but change all occurrences of 'Card' to 'ListItem']



list_items = []
for item in items:
    list_item = ListItem(logo=item["image"], desc=item["description"], link=item["link"])
    list_items.append(list_item)

heading = pn.pane.Markdown("## Your Dashboards", sizing_mode="stretch_width")

# Wrap everything in a Column with the list-container class
layout = pn.Column(
    heading,
    *list_items,
    css_classes=['list-container'],
    width=800,
    sizing_mode="stretch_width",
    margin=(10, 20)
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
