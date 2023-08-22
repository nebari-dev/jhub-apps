from bokeh.models import ColumnDataSource
from bokeh.plotting import figure
from bokeh.io import curdoc


def modify_doc(doc):
    """Add a plotted function to the document.

    Arguments:
        doc: A bokeh document to which elements can be added.
    """
    x_values = list(range(10))
    y_values = [x**2 for x in x_values]
    data_source = ColumnDataSource(data=dict(x=x_values, y=y_values))
    plot = figure(
        title="f(x) = x^2",
        tools="crosshair,pan,reset,save,wheel_zoom",
    )
    plot.line("x", "y", source=data_source, line_width=3, line_alpha=0.6)
    doc.add_root(plot)
    doc.title = "Hello World"


def main():
    modify_doc(curdoc())


main()
