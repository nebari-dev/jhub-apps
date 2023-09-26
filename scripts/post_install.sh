#!/bin/bash

echo "Installing pip dependencies"
pip install gradio --no-deps
JHUB_APP_COMMIT_HASH=64711dc552f722d8cf8567e6e70c7387322bf734
pip install git+https://github.com/nebari-dev/jhub-apps.git@$JHUB_APP_COMMIT_HASH --no-deps
echo "pip dependencies installed"
echo "post install finished"
