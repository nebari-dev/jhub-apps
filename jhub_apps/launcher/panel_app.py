import panel as pn


def createApp():
    int_slider = pn.widgets.IntSlider(name='Integer Slider', start=0, end=8, step=2, value=4)
    return pn.Row(int_slider).servable()
