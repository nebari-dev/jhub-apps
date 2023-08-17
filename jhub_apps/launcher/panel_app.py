import panel as pn


def create_dashboard():
    pass


def create_app():
    name_input = pn.widgets.TextInput(name='Name')
    filepath_input = pn.widgets.TextInput(name='Filepath')
    description_input = pn.widgets.TextAreaInput(name='Description')
    create_button = pn.widgets.Button(name='Create Dashboard',  button_type='primary')
    create_button.on_click(create_dashboard)

    input_form = pn.Column(
        name_input,
        filepath_input,
        description_input,
        create_button
    )
    return pn.Row(input_form).servable()
