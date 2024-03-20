---
sidebar_position: 5
---

# Create App Form

The Create App form has over half a dozen fields, this doc describes the purpose of each of them.  

### Display Name

Name of the app to be created that is displayed to the user. 

### Description

Description of the app.

### Thumbnail

Thumbnail of the created app.

<img src="/img/thumbnail.png" style={{width: "25%"}} />


### Framework

The framework of the app you would like to deploy. One of the following:

- Panel
- Bokeh
- Streamlit
- Plotly Dash
- Voila
- Gradio
- JupyterLab
- Custom Command

### Filepath

The path of the file, where your app code lives.

### Conda Environment

The conda environment which will be used to start the app. You'd need to make sure your environment
contains the following:

- `<chosen-framework>`
- `jhsingle-native-proxy>=0.8.2`
- `plotlydash-tornado-cmd` (If your framework is Plotly Dask)
- `bokeh-root-cmd` (If your framework is Panel or Bokeh)

### Environment Variables

The set of environment variables to set before starting the app. This is specially
useful when creating custom apps. Imagine creating a RAG app and you'd like to setup
OpenAPI keys. This field expects a valid json, for example:

```json
{"KEY_1":"VALUE_1","KEY_2":"VALUE_2"}
```

### Spawner Profile

This is for selecting the spawner profile as in the pod configuration to use to
spin up the app. This is only application when you're using `KubeSpawner` as the
spawner for JupyterHub.

![spawner profile options](/img/spawner-profiles-dropdown.png)

### Custom Command

This is applicable only when you have selected **Custom Command** as the
chosen framework. This is a way to spin up custom apps as in any arbitrary app, for example
a Flask API, python server, etc.

This has a very specific format, imagine you'd like to spinup a python http server, the
command you'd usually use for that is:

```bash
python http.server 8000
```

In `jhub-apps` the python is picked from the conda environment which you'd have picked
above, so it is necessary that you do not specify that. Specifying the exact port is
pointless as the created app will be deployed behind a proxy, so we expect you to
provide a placeholder for the same, so that we can substitute that with an arbitrary port.
The equivalent command for the same would be:

```bash
http.server {port}
```

### Allow Public Access

This is a toggle to expose app to the public, including to unauthenticated users.
