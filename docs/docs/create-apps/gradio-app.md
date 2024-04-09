---
sidebar_position: 3
---

# Gradio apps

## Environment requirements

* `jhsingle-native-proxy` >= 0.8.2
* `gradio`
* Other libraries used in the app

## Code requirements

Write your code in a Python script and add the following following additional arguments to your launch function:

```python
import argparse
parser.add_argument(
    "--server-port", type=str, help="server_port for gradio app", default=8500
)
parser.add_argument("--root-path", type=str, help="root_path for gradio", default=None)
cli_args = parser.parse_args()

demo.launch(your_kwargs_here, server_port=int(cli_args.server_port), root_path=cli_args.root_path)
```

## Next steps

:sparkles: [Launch app →](/docs/create-apps/general-app)
