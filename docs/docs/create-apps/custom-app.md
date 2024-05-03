---
sidebar_position: 6
---

# Custom/Generic app

You can create and deploy arbitrary apps with `jhub-apps`, like Python Server, Flask API, etc.

## Environment requirements

Your conda environment (used in JHub Apps Launcher's App creation form) must have the following packages for successful app deployment:

* `jhsingle-native-proxy` >= 0.8.2
* Custom framework used for the app
* Other libraries used in the app

## App creation form requirements

In the JHub Apps Launcher App creation form, select "Custom Command" for the **"Framework"**.
A text field input for a **"Custom Command"** is displayed. This field has a very specific format.

For example, to spin up a Python http server, the command used in JHub Apps is:

```bash
http.server {port}
```

This is different from the typical `python http.server 8000` command in the following ways:

* In `jhub-apps`, Python is picked from the conda environment mentioned in the form, so do NOT mention `python`.
* Specifying the exact port is unnecessary because the created app will be deployed behind a proxy in JuptyterHub. Hence, a placeholder `{port}` is expected that will be substituted with an arbitrary port.

![custom app](/img/custom_app_creation.png)
