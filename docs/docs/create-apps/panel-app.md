---
sidebar_position: 2
---

# Panel apps

## Environment requirements

* `jhsingle-native-proxy` >= 0.8.2
* `panel`
* `bokeh-root-cmd` >= 0.1.2
* `nbconvert`
* Other libraries used in the app

:::note
In some cases, you may need `ipywidgets` and `ipywidgets-bokeh`
:::

## Code requirements

If you use templates, make sure to use it through `pn.template.MaterialTemplate()` instead of `pn.extension(design='material', template='material')`.

You can write Panel apps in Jupyter Notebooks or Python scripts, both work. You'll need to include `nbconvert` in your environment if you use Jupyter Notebooks.

## Next steps

:sparkles: [Launch app →](/docs/create-apps/general-app)
