# JHub Apps Documentation

The documentation for JHub Apps is built with [Docusaurus](https://docusaurus.io/). 

## Installation

Navigate to the `docs` folder of the repository and install the `yarn` dependencies. 

```
$ cd docs
$ yarn
```

## Local development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build the static page

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting 
service. It most closely mimics the production deployment and has a slightly different process than the live-uploading
"local development" above. 

## Documentation deployment

The deployment of the jhub-apps documentation from this repo is managed externally by Vercel. The documentation page
will be automatically redeployed when changes are merged. 

The following commands can be used for manually deploying:

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
