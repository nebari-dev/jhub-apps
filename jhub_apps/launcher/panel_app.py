import panel as pn

from jhub_apps.launcher.hub_client import HubClient

name_input = pn.widgets.TextInput(name='Name')
filepath_input = pn.widgets.TextInput(name='Filepath')
description_input = pn.widgets.TextAreaInput(name='Description')
spinner = pn.indicators.LoadingSpinner(size=30, value=True, color="secondary", bgcolor='dark', visible=False)
button_widget = pn.widgets.Button(name='Create Dashboard',  button_type='primary')


def create_dashboard(event):
    button_widget.disabled = True  # Disable the button
    spinner.visible = True  # Show the spinner

    name = name_input.value
    filepath = filepath_input.value
    description = description_input.value
    print(f"Name: {name}, Filepath: {filepath}, Description: {description}")
    hclient = HubClient()
    hclient.create_server("aktech", name.lower())

    button_widget.disabled = False  # Re-enable the button
    spinner.visible = False  # Hide the spinner
    print(event)


def create_app():
    button_widget.on_click(create_dashboard)
    input_form = pn.Column(
        name_input,
        filepath_input,
        description_input,
        button_widget,
        spinner
    )
    return pn.Row(input_form).servable()
