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
For all frameworks, you need to include the `jhsingle-native-proxy >= 0.8.2` package in your environment along with the framework itself (e.g., bokeh, panel, etc.)
Also, be aware that `jhub-apps` may be launching your app from a different directory than you used during development. Therefore, its important to always define absolute paths in your apps. For example, if you use `pathlib` to define a path, you'll need to call `.resolve()` in order to make it absolute. 
Some frameworks may have additional package or code requirements.
Check out their specific documentation pages for details.
:::

## Steps

1. From the JHun App Launcher Home Screen, click on the **"Create App"** button in the top-right corner.

2. Fill in app-creation form with the details below.

| Field                                                              | Description                                                                                                                                                           |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display Name                                                   | Provide meaningful name for your application                                                                                                                          |
| Description (optional)                                         | Add addition information about the application                                                                                                                        |
| Thumbnail (optional)                                           | Choose a meaningful thumbnail for your application. The default thumbnail is the application framework's logo.                                                        |
| Framework                                                      | Select the framework used by your application from the dropdown.                                                                                                      |
| Filepath                                                       | Provide the path (from root in JupyterLab) to your application's code file.                                                                                             |
| Conda Environment                                              | Provide the environment used while developing your notebook/script which has `jhsingle-native-proxy`, the corresponding framework (e.g., `panel`, `gradio`, etc.), and additional requirements documented in framework-specific pages. |
| Environment Variables (optional)                               | The set of environment variables, defined as valid JSON, to set before starting the app. This is useful when creating custom apps.                         |
| Spawner profile                                                | Instance type (i.e. machines with CPU/RAM/GPU resources) required for running your application. Only applicable if you're using `KubeSpawner` as the spawner for JupyterHub.                                                                       |
| Custom Command (required if the Framework is "Custom Command") | Python command to start an arbitrary app.                                                                                                                             |
| Allow Public Access                                            | Toggle to share the application with anyone on the internet, including unauthenticated users.                                                                                                          |
| Sharing                                           | To share the application with a set of users and or groups.                                                                                                                                                                            |

Example:

![Create panel app](/img/panel_app_create.png)

3. When ready, click on the **"Submit"** button.

<p align="center">
    <img src="/img/panel_app_create_submit.png" style={{width: "60%"}} />
</p>

4. Your App opens automatically in a few minutes.

<p align="center">
    <img src="/img/panel_app.png" style={{width: "80%"}} />
</p>

You can now access and manage (start, stop, edit, and delete) this app from the JHub Apps Homepage, under "My Apps".

<p align="center">
    <img src="/img/app_management.png" style={{width: "40%"}} />
</p>
