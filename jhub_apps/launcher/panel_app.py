import panel as pn

from jhub_apps.launcher.hub_client import HubClient

name_input = pn.widgets.TextInput(name='Name')
filepath_input = pn.widgets.TextInput(name='Filepath')
description_input = pn.widgets.TextAreaInput(name='Description')
spinner = pn.indicators.LoadingSpinner(size=30, value=True, color="secondary", bgcolor='dark', visible=True)
button_widget = pn.widgets.Button(name='Create Dashboard',  button_type='primary')
alert = pn.pane.Alert("Dashboard created 🚀", visible=True)


input_form = pn.Column(
    name_input,
    filepath_input,
    description_input,
    button_widget,
)


def create_dashboard(event):
    input_form.pop(-1)
    input_form.append(spinner)

    name = name_input.value
    filepath = filepath_input.value
    description = description_input.value
    print(f"Name: {name}, Filepath: {filepath}, Description: {description}")
    hclient = HubClient()
    hclient.create_server("aktech", name.lower())

    input_form.pop(-1)
    input_form.append(alert)
    print(event)


def create_app():
    button_widget.on_click(create_dashboard)
    return pn.Row(input_form).servable()
