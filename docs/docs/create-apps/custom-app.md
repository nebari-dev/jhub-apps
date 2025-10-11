---
sidebar_position: 6
---

# Custom/Generic app

You can create and deploy arbitrary apps with `jhub-apps`, including Python apps, Node.js servers, Go applications, Ruby apps, or any executable that can run as a web server.

## Environment requirements

Your conda environment (used in JHub Apps Launcher's App deployment form) should have:

* The runtime/executable for your app (Python, Node.js, Go, Ruby, etc.)
* Custom framework used for the app
* Other libraries/dependencies used in the app

**Note:** `jhsingle-native-proxy` is no longer required - JHub Apps now uses `jhub-app-proxy` which is automatically installed when deploying custom apps.

## App deployment form requirements

In the JHub Apps Launcher App deployment form, select "Custom Command" for the **"Framework"**.
A text field input for a **"Custom Command"** is displayed.

![custom app form fields](/img/custom_app_creation.png)

## Command format

The **Custom Command** field accepts the complete command to run your application. The command should be exactly as you would run it, with the following consideration:

* Use `{port}` as a placeholder for the port number - JHub Apps will substitute this with the actual port allocated by JupyterHub

## Examples

### Python applications

**Python HTTP server:**
```bash
python -m http.server {port}
```

**Flask application:**
```bash
python -m flask run --port {port} --host 0.0.0.0
```

**Python script:**
```bash
python /path/to/app.py {port}
```

**Custom Python module:**
```bash
python -c "from mymodule import app; app.run(port={port})"
```

### Non-Python applications

**Node.js server:**
```bash
node server.js --port {port}
```

**Go application:**
```bash
./my-go-app --port {port}
```

**Ruby server:**
```bash
ruby app.rb -p {port}
```

**Shell script:**
```bash
bash /path/to/start.sh {port}
```

## Advanced configuration

### Environment variables

You can set environment variables for your custom app through:

1. **Via the UI**: Add environment variables in the app creation form
2. **Via configuration**: Set environment variables in `startup_apps` configuration

Example using `startup_apps`:
```python
c.JAppsConfig.startup_apps = [
    {
        "username": "my-user",
        "servername": "my-custom-app",
        "user_options": {
            "display_name": "My Custom App",
            "filepath": "app.py",
            "framework": "custom",
            "custom_command": "python app.py {port}",
            "env": {
                "MY_VAR": "value",
                "DEBUG": "true"
            },
            "conda_env": "my-env"
        }
    }
]
```

### Custom proxy version

You can specify a custom version of `jhub-app-proxy` to use:

**Per-app (via environment variable):**
```python
"env": {
    "JHUB_APP_PROXY_VERSION": "v0.6"
}
```

**Globally (in jupyterhub_config.py):**
```python
c.JAppsConfig.jhub_app_proxy_version = "v0.6"
```

Priority: App-specific environment variable > Global config > Default (v0.5)
