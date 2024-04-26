---
sidebar_position: 3
---

# Gradio apps

## Environment requirements

Your conda environment (used in JHub Apps Launcher's App creation form) must have the following packages for successful app deployment:

* `jhsingle-native-proxy` >= 0.8.2
* `gradio`
* Other libraries used in the app

## Code requirements

Write your application code in a Python script, and add the following following additional arguments to your launch function:

```python
import argparse
parser = argparse.ArgumentParser(description="Process CLI args for gradio")
parser.add_argument(
    "--server-port", type=str, help="server_port for gradio app", default=8500
)
parser.add_argument("--root-path", type=str, help="root_path for gradio", default=None)
cli_args = parser.parse_args()

demo.launch(<your_kwargs_here>, server_port=int(cli_args.server_port), root_path=cli_args.root_path)
```

## Example application

To deploy the [Gradio Quickstart Example][gradio-quickstart] using JHub Apps, you can use the following code and environment:

<details>
<summary> Code (Python file) </summary>

In a Python file, copy the following lines of code.

```python title="gradio-hello-app.py"
import gradio as gr
import argparse

parser = argparse.ArgumentParser()

parser.add_argument(
    "--server-port", type=str, help="server_port for gradio app", default=8500
)

parser.add_argument("--root-path", type=str, help="root_path for gradio", default=None)

cli_args = parser.parse_args()

def greet(name, intensity):
    return "Hello, " + name + "!" * int(intensity)

demo = gr.Interface(
    fn=greet,
    inputs=["text", "slider"],
    outputs=["text"],
)

if __name__ == "__main__":
    demo.launch(server_port=int(cli_args.server_port), root_path=cli_args.root_path)
```

</details>

<details>
<summary> Environment specification </summary>

Use the following spec to create a conda environment wherever JHub Apps is deployed.
If using Nebari, use this spec to create an environment with [conda-store][conda-store].

```yaml
name: gradio-hello-app
channels:
  - conda-forge
dependencies:
  - gradio
  - jhsingle-native-proxy >= 0.8.2
  - ipykernel
  - ipywidgets
  - nbconvert
```

</details>


## Next steps

:sparkles: [Launch app →](/docs/create-apps/general-app)

<!-- External links -->

[gradio-quickstart]: https://www.gradio.app/guides/quickstart#building-your-first-demo
[conda-store]: https://conda.store/conda-store-ui/tutorials/create-envs
