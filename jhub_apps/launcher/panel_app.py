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


def create_input_form():
    input_form_widget = InputFormWidget(
        name_input=pn.widgets.TextInput(name='Name'),
        filepath_input=pn.widgets.TextInput(name='Filepath'),
        description_input=pn.widgets.TextAreaInput(name='Description'),
        spinner=pn.indicators.LoadingSpinner(size=30, value=True, color="secondary", bgcolor='dark', visible=True),
        button_widget=pn.widgets.Button(name='Create Dashboard',  button_type='primary'),
    )
    input_form = pn.Column(
        input_form_widget.name_input,
        input_form_widget.filepath_input,
        input_form_widget.description_input,
        input_form_widget.button_widget,
    )
    return input_form_widget, input_form


def create_dashboard(event, input_form_widget, input_form):
    input_form.pop(-1)
    input_form.append(input_form_widget.spinner)

    name = input_form_widget.name_input.value
    filepath = input_form_widget.filepath_input.value
    description = input_form_widget.description_input.value
    print(f"Name: {name}, Filepath: {filepath}, Description: {description}")
    hclient = HubClient()
    hclient.create_server("aktech", name.lower())

    input_form.pop(-1)
    dashboard_link = f"http://localhost:8000/user/aktech/{name}"
    text_with_link = pn.pane.Markdown(f"""
    ## 🚀 Dashboard created: [{dashboard_link}]({dashboard_link}).
    """)
    input_form.append(text_with_link)
    print(event)


def create_app():
    print("*"*100)
    print("CREATING APP")
    print("*"*100)
    input_form_widget, input_form = create_input_form()

    def button_callback(event):
        return create_dashboard(event, input_form_widget, input_form)

    input_form_widget.button_widget.on_click(button_callback)
    return pn.Row(input_form).servable()
