# Welcome to the Nebari Hub UI!

## Table of Contents

1. [Running the Project Locally](#running-the-project-locally)
2. [Running Unit Tests](#running-unit-tests)
3. [Running Code Quality Checks](#running-code-quality-checks)

## Running the Project Locally

1. To install dependencies, run the following:

```sh
npm install
```

2. To run locally with SSO, add a file called `.env.local` to the `ui` directory. Copy and paste the template below and replace the placeholder values with your own (optional):

```
SSO_AUTHORITY=[SOME_KEYCLOAK_REALM_URL] # Ex: http://localhost:8088/realms/dev
SSO_CLIENT_ID=[SOME_CLIENT_ID] # Ex: dev-client
```

3. To start the app, run the following:

```sh
npm run dev
```

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
