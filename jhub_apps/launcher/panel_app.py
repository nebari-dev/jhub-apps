import panel as pn


name_input = pn.widgets.TextInput(name='Name')
filepath_input = pn.widgets.TextInput(name='Filepath')
description_input = pn.widgets.TextAreaInput(name='Description')


def create_dashboard(event):
    name = name_input.value
    filepath = filepath_input.value
    description = description_input.value
    print(f"Name: {name}, Filepath: {filepath}, Description: {description}")
    print(event)


def create_app():
    create_button = pn.widgets.Button(name='Create Dashboard',  button_type='primary')
    create_button.on_click(create_dashboard)

    input_form = pn.Column(
        name_input,
        filepath_input,
        description_input,
        create_button
    )
    return pn.Row(input_form).servable()
