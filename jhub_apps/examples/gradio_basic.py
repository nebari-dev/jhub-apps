import argparse
import gradio as gr


def greet(name):
    return "Hello " + name + "!"


demo = gr.Interface(fn=greet, inputs="text", outputs="text")


parser = argparse.ArgumentParser(description="Process CLI args for gradio")
parser.add_argument(
    "--server-port", type=str, help="server_port for gradio app", default=8500
)
parser.add_argument("--root-path", type=str, help="root_path for gradio", default=None)
cli_args = parser.parse_args()

demo.launch(server_port=int(cli_args.server_port), root_path=cli_args.root_path)
