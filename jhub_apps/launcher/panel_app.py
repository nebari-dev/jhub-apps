from dataclasses import dataclass
from typing import Any

import panel as pn

from jhub_apps.launcher.hub_client import HubClient

FRAMEWORKS = {
    "Panel": "panel",
    "Bokeh": "bokeh",
    "Streamlit": "streamlit",
    "Voila": "voila",
    "Plotly": "plotlydash",
    "Gradio": "gradio",
}


LOGO_MAPPING = {
    "panel": "https://raw.githubusercontent.com/holoviz/panel/main/doc/_static/logo_stacked.png",
    "streamlit": "https://streamlit.io/images/brand/streamlit-mark-color.png",
    "bokeh": "https://static.bokeh.org/branding/icons/bokeh-icon@5x.png",
    "voila": "https://raw.githubusercontent.com/voila-dashboards/voila/main/docs/voila-logo.svg",
    "plotly": "https://repository-images.githubusercontent.com/33702544/b4400c80-718b-11e9-9f3a-306c07a5f3de",
}


@dataclass
class InputFormWidget:
    name_input: Any
    filepath_input: Any
    description_input: Any
    spinner: Any
    button_widget: Any
    framework: Any


def _get_image_item(logo, desc, link):
    return {"image": logo, "description": desc, "link": link}


def create_grid():
    items = [
        _get_image_item(logo=LOGO_MAPPING.get('panel'), desc="Desc", link="/"),
        _get_image_item(logo=LOGO_MAPPING.get('streamlit'), desc="Desc", link="/"),
        _get_image_item(logo=LOGO_MAPPING.get('bokeh'), desc="Desc", link="/"),
        _get_image_item(logo=LOGO_MAPPING.get('voila'), desc="Desc", link="/"),
        _get_image_item(logo=LOGO_MAPPING.get('plotly'), desc="Desc", link="/"),
    ]

    # Define a CSS style for the cards and hover effect
    card_style = """
    .card {
        border: 1px solid #ccc;
        padding: 5px;
        text-align: center;
        transition: background-color 0.3s;
        width: 200px;   /* Set the width */
        height: 200px;  /* Set the height */ 
    }
    
    .card:hover {
        background-color: lightgray;
    }
    """

    # Combine card_style CSS with the individual card contents
    cards = []
    for item in items:
        card_content = f"""
        <style>{card_style}</style>
        <div class="card">
            <a href="{item["link"]}" target="_blank">
                <img src="{item["image"]}" width="150">
            </a>
            <div>{item["description"]}</div>
        </div>
        """
        cards.append(card_content)

    # Create a GridSpec layout to arrange the cards in a grid
    grid_spec = pn.GridSpec(sizing_mode="stretch_width", max_width=600)

    # Organize the cards in a matrix-like arrangement
    num_columns = 3  # Number of columns in the matrix

    for idx, card in enumerate(cards):
        row = idx // num_columns
        col = idx % num_columns
        grid_spec[row, col] = pn.pane.HTML(card)

    return grid_spec


def create_input_form():
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
    created_apps = create_grid()
    return pn.Row(input_form, created_apps).servable()
