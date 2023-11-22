# Welcome to the JupyterHub UI!

## Table of Contents

1. [Running the Project Locally](#running-the-project-locally)
2. [Applying UI Changes to JupyterHub](#applying-ui-changes-to-jupyterhub)
3. [Running Unit Tests](#running-unit-tests)
4. [Running Code Quality Checks](#running-code-quality-checks)

## Running the Project Locally

_Note: the below commands must be ran from the `ui` directory_

1. To install dependencies, run the following:

```sh
npm install
```

2. To start the app, run the following:

```sh
npm run dev
```

3. To load the UI, navigate to the following:

```
http://localhost:8080/hub/home
```

## Applying UI Changes to JupyterHub

1. To run a production build and apply changes, run the following:

```sh
npm run buildCopy
```

2. Restart JupyterHub to verify changes
   _Note: a hard refresh may be necessary to see ui changes_

## Running Unit Tests

To make sure your changes do not break any unit tests, run the following:

```sh
npm run test
```

Ensure to review the coverage directory for code coverage details.

```sh
npm run coverage
```

## Running Code Quality Checks

To make sure your changes adhere to additional code quality standards, run the following:

```sh
npm run lint
npm run format
```

You can also see the `.vscode/settings.json` file to find how to enable auto-formatting on save.
