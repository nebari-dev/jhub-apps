---
sidebar_position: 6
---

# Custom/Generic app

You can create and deploy arbitrary apps with `jhub-apps`, such as a Python Server or Flask API.

## Environment requirements

Your conda environment (used in JHub Apps Launcher's App deployment form) must have the following packages for successful app deployment:

* `jhsingle-native-proxy` >= 0.8.2
* Custom framework used for the app
* Other libraries used in the app

## App deployment form requirements

In the JHub Apps Launcher App deployment form, select "Custom Command" for the **"Framework"**.
A text field input for a **"Custom Command"** is displayed. 

![custom app form fields](/img/custom_app_creation.png)

The **Custom Command** field has a very specific format.

For example, to spin up a Python http server, the command used in JHub Apps is:

```bash
http.server {port}
```

This is different from the typical `python http.server 8000` command in the following ways:

* In `jhub-apps`, Python is pulled from the conda environment mentioned in the form, so 
do NOT include `python`.
* Specifying the exact port is unnecessary because the created app will be deployed 
behind a proxy in JupyterHub. Hence, jhub-apps will substitude the placeholder `{port}` 
with an arbitrary port.
