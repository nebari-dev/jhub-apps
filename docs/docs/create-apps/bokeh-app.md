---
sidebar_position: 4
---

# Bokeh apps

## Environment requirements

Your conda environment (used in JHub Apps Launcher's App creation form) must have the following packages for successful app deployment:

* `jhsingle-native-proxy` >= 0.8.2
* `bokeh`
* Other libraries used in the app

:::note
In some cases, you may need `bokeh-root-cmd`, `ipywidgets`, and `ipywidgets-bokeh`.
:::

## Example application

To deploy the [Bokeh Sliders Example][bokeh-sliders] using JHub Apps, you can use the following code (same as the [Bokeh example][bokeh-sliders]) and environment:

<details>
<summary> Code (Jupyter Notebook) </summary>

```python title="bokeh-sliders-app.ipynb"
''' Present an interactive function explorer with slider widgets.

Scrub the sliders to change the properties of the ``sin`` curve, or
type into the title text box to update the title of the plot.

Use the ``bokeh serve`` command to run the example by executing:

    bokeh serve sliders.py

at your command prompt. Then navigate to the URL

    http://localhost:5006/sliders

in your browser.

'''
import numpy as np

from bokeh.io import curdoc
from bokeh.layouts import column, row
from bokeh.models import ColumnDataSource, Slider, TextInput
from bokeh.plotting import figure

# Set up data
N = 200
x = np.linspace(0, 4*np.pi, N)
y = np.sin(x)
source = ColumnDataSource(data=dict(x=x, y=y))


# Set up plot
plot = figure(height=400, width=400, title="my sine wave",
              tools="crosshair,pan,reset,save,wheel_zoom",
              x_range=[0, 4*np.pi], y_range=[-2.5, 2.5])

plot.line('x', 'y', source=source, line_width=3, line_alpha=0.6)


# Set up widgets
text = TextInput(title="title", value='my sine wave')
offset = Slider(title="offset", value=0.0, start=-5.0, end=5.0, step=0.1)
amplitude = Slider(title="amplitude", value=1.0, start=-5.0, end=5.0, step=0.1)
phase = Slider(title="phase", value=0.0, start=0.0, end=2*np.pi)
freq = Slider(title="frequency", value=1.0, start=0.1, end=5.1, step=0.1)


# Set up callbacks
def update_title(attrname, old, new):
    plot.title.text = text.value

text.on_change('value', update_title)

def update_data(attrname, old, new):

    # Get the current slider values
    a = amplitude.value
    b = offset.value
    w = phase.value
    k = freq.value

    # Generate the new curve
    x = np.linspace(0, 4*np.pi, N)
    y = a*np.sin(k*x + w) + b

    source.data = dict(x=x, y=y)

for w in [offset, amplitude, phase, freq]:
    w.on_change('value', update_data)


# Set up layouts and add to document
inputs = column(text, offset, amplitude, phase, freq)

curdoc().add_root(row(inputs, plot, width=800))
curdoc().title = "Sliders"
```

</details>

<details>
<summary> Environment specification </summary>

Use the following spec to create a conda environment wherever JHub Apps is deployed.
If using Nebari, use this spec to create an environment with [conda-store][conda-store].


```yaml
name: bokeh-sliders-app
channels:
  - conda-forge
dependencies:
  - numpy
  - bokeh
  - ipykernel
  - jhsingle-native-proxy>=0.8.2
```

</details>

## Next steps

:sparkles: [Launch app →](/docs/create-apps/general-app)

<!-- External links -->

[bokeh-sliders]: https://demo.bokeh.org/sliders
[conda-store]: https://conda.store/conda-store-ui/tutorials/create-envs
