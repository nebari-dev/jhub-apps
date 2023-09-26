#!/bin/bash

echo "Installing pip dependencies"
JHUB_APP_COMMIT_HASH=64711dc552f722d8cf8567e6e70c7387322bf734
PYTHON=${PREFIX}/bin/python
echo "Python Path: ${PYTHON}"
$PYTHON -m pip install gradio \
  git+https://github.com/nebari-dev/jhub-apps.git@$JHUB_APP_COMMIT_HASH --no-deps
echo "pip dependencies installed"
echo "post install finished"
