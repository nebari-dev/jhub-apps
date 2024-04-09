---
sidebar_position: 1
---

# General instructions

You can create and deploy apps for multiple frameworks with the following steps.

## Pre-requisites

Before deploying/launching your app with JHub Apps Launcher, you'll need:
- working code in a Jupyter Notebook or a Python script, and
- environment with all the necessary packages.

:::note
For all frameworks, you need to include the `jhsingle-native-proxy` package in your environment along with the framework itself (e.g., bokeh, panel, etc.)

Some frameworks may have additional package or code requirements.
Check out their specific documentation pages for details.
:::

## Steps

1. From the JHun App Launcher Home Screen, click on the "Create App" button in the top-right corner.

2. Fill in app-creation form:
    * **Display Name** - Provide meaningful name for your application
    * **Description (optional)** - Add addition information about the application
    * **Thumbnail (optional)** - Choose a meaningful thumbnail for your application. The default thumbnail is the application framework's logo.
    * **Framework** - Select the framework used by your application. For this tutorial, select Panel.
    * **Filepath** - Path (from root in JupyterLab) to your application code file. For this tutorial, path to the Jupyter Notebook.
    * **Conda Environment** - Same environment used while developing your notebook/script which has `jhsingle-native-proxy` and the corresponding framework (e.g., `panel`, `gradio`, etc.).
    * `Spawner profile` - Instance type (i.e. machines with CPU/RAM/GPU resources) required for running your application.
    * `Allow Public Access` - Toggle to share the application with anyone on the internet.

![Create panel app](/img/panel_app_create.png)

3. When ready, click on the "Submit" button.

![Create app submit button](/img/panel_app_create_submit.png)

4. Your App opens automatically.

![Created panel app](/img/panel_app.png)
