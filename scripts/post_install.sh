#!/bin/bash

echo "Installing pip dependencies"
pip install gradio --no-deps
pip install git+https://github.com/nebari-dev/jhub-apps.git --no-deps
echo "pip dependencies installed"
echo "post install finished"
