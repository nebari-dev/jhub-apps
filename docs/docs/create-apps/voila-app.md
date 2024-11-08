---
sidebar_position: 7
---

# Voila apps

## Environment requirements

Your conda environment (used in JHub Apps Launcher's App creation form) must have the following packages for successful app deployment:

* `jhsingle-native-proxy` >= 0.8.2
* `voila` >= 0.5.6
* Other libraries used in the app

:::note
In some cases, you may need `ipywidgets`
:::

## Example application

To deploy the [Voila Basic Example][voila-basic-example] using JHub Apps, you can use the following code and environment:

<details>
<summary> Code (Jupyter Notebook) </summary>

In a Jupyter Notebook, copy the following lines of code into a cell.

```python title="voila-basic-slider.ipynb"
import ipywidgets as widgets

slider = widgets.FloatSlider(description='x')
text = widgets.FloatText(disabled=True, description='x^2')

def compute(*ignore):
    text.value = str(slider.value ** 2)

slider.observe(compute, 'value')

slider.value = 4

widgets.VBox([slider, text])
```

You will see a basic slider app as shown in this screenshot:

![Simple interactive Voilà app displaying a slider for variable x and its squared value](/img/voila_app.png)
</details>

<details>
<summary> Environment specification </summary>

Use the following spec to create a Conda environment wherever JHub Apps is deployed.
If using Nebari, use this spec to create an environment with [conda-store][conda-store].

```yaml
channels:
  - conda-forge
dependencies:
  - ipywidgets
  - jhsingle-native-proxy>=0.8.2
  - pandas
  - python
  - pip
  - pip:
      - voila==0.5.6
  - ipykernel
```
:::note
When voila (>=0.5.6) is available on Conda Forge, it can be moved outside of the pip section of the dependencies
:::

</details>


## Next steps

:sparkles: [Launch app →](/docs/create-apps/general-app)

<!-- External links -->

[voila-basic-example]: https://github.com/voila-dashboards/voila/blob/7596c4f930caf4fc2d89ba63b1096046adf9fe0e/notebooks/basics.ipynb
[conda-store]: https://conda.store/conda-store-ui/tutorials/create-envs
