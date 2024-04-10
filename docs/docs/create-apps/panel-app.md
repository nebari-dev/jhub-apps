---
sidebar_position: 2
---

# Panel apps

## Environment requirements

Your conda environment (used in JHub Apps Launcher's App creation form) must have the following packages for successful app deployment:

* `jhsingle-native-proxy` >= 0.8.2
* `panel`
* `bokeh-root-cmd` >= 0.1.2
* `nbconvert`
* Other libraries used in the app

:::note
In some cases, you may need `ipywidgets` and `ipywidgets-bokeh`
:::

## Code requirements

If you use Panel templates, for example the Material template, make sure to use it through `pn.template.MaterialTemplate()` instead of `pn.extension(design='material', template='material')`.

You can write Panel apps in Jupyter Notebooks or Python scripts. If you use Jupyter Notebooks, you need to include `nbconvert` in your conda environment.

## Example application

To deploy the [Panel Iris Kmeans Example][panel-iris-kmeans] using JHub Apps, you can use the following (slightly updated) code and environment:

<details>
<summary> Code (Jupyter Notebook) </summary>

In a Jupyter Notebook, copy the following lines of code.

```python title="panel-iris-kmeans-app.ipynb"
import numpy as np
import pandas as pd
import panel as pn
import hvplot.pandas

from sklearn.cluster import KMeans
from bokeh.sampledata import iris

pn.extension()

flowers = iris.flowers.copy()
cols = list(flowers.columns)[:-1]

x = pn.widgets.Select(name='x', options=cols)
y = pn.widgets.Select(name='y', options=cols, value='sepal_width')
n_clusters = pn.widgets.IntSlider(name='n_clusters', start=1, end=5, value=3)

def get_clusters(x, y, n_clusters):
    kmeans = KMeans(n_clusters=n_clusters, n_init='auto')
    est = kmeans.fit(iris.flowers.iloc[:, :-1].values)
    flowers['labels'] = est.labels_.astype('str')
    centers = flowers.groupby('labels')[[x] if x == y else [x, y]].mean()
    return (
        flowers.sort_values('labels').hvplot.scatter(
            x, y, c='labels', size=100, height=500, responsive=True
        ) *
        centers.hvplot.scatter(
            x, y, marker='x', c='black', size=400, padding=0.1, line_width=5
        )
    )

widgets = pn.WidgetBox(
    pn.Column(
        """This app provides an example of **building a simple dashboard using Panel**.\n\nIt demonstrates how to take the output of **k-means clustering on the Iris dataset** using scikit-learn, parameterizing the number of clusters and the variables to plot.\n\nThe entire clustering and plotting pipeline is expressed as a **single reactive function** that responsively returns an updated plot when one of the widgets changes.\n\n The **`x` marks the center** of the cluster.""",
        x, y, n_clusters
    )
)

clusters = pn.pane.HoloViews(
    pn.bind(get_clusters, x, y, n_clusters), sizing_mode='stretch_width'
)

dashboard = pn.template.MaterialTemplate(
    title="Iris K-Means Clustering",
    sidebar =  [widgets],
    main=[clusters],
)

dashboard.servable()
```

</details>

<details>
<summary> Environment specification </summary>

Use the following spec to create a conda environment wherever JHub Apps is deployed.
If using Nebari, use this spec to create an environment with [conda-store][conda-store].

```yaml
name: panel-iris-kmeans-app
channels:
  - conda-forge
dependencies:
  - numpy
  - pandas
  - hvplot
  - panel
  - bokeh
  - ipykernel
  - scikit-learn
  - jhsingle-native-proxy>=0.8.2
  - bokeh-root-cmd
  - nbconvert
```

</details>


## Next steps

:sparkles: [Launch app →](/docs/create-apps/general-app)

<!-- External links -->

[panel-iris-kmeans]: https://panel.holoviz.org/gallery/iris_kmeans.html
[conda-store]: https://conda.store/conda-store-ui/tutorials/create-envs
