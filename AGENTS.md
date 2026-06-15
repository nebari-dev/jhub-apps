# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## What this is

JHub Apps is a JupyterHub extension that lets users launch web apps (Panel, Bokeh, Streamlit, Plotly Dash, Voila, Gradio, JupyterLab, or a generic Python command) as named JupyterHub servers. It plugs into an existing JupyterHub via `install_jhub_apps(c, SpawnerClass)` in a `jupyterhub_config.py`, then runs as a FastAPI service alongside the Hub plus a React UI that replaces the Hub home page.

## Repository layout

Two codebases in one repo:
- `jhub_apps/` — Python backend (FastAPI service, spawner subclass, Hub API client).
- `ui/` — React + TypeScript + Vite frontend. Built artifacts are copied into `jhub_apps/static/` and served by the FastAPI service.

## Architecture

The integration model is the key thing to understand — there is no standalone "app". Everything attaches to a host JupyterHub:

1. **`install_jhub_apps(c, spawner_to_subclass)`** (`jhub_apps/configuration.py`) is the entry point. Called from a `jupyterhub_config.py`, it mutates the Hub config `c` to:
   - Swap the spawner class for a runtime subclass via `subclass_spawner()` (`jhub_apps/spawner/spawner_creation.py`).
   - Register the `japps` FastAPI service (run as `uvicorn jhub_apps.service.app:app` on port 10202) and a `japps-initialize-startup-apps` service.
   - Declare JupyterHub roles/scopes the service needs (`admin:servers`, `tokens`, `shares` on JupyterHub 5, etc.).

2. **FastAPI service** (`jhub_apps/service/`) — runs as a Hub-managed service behind the `/services/japps` prefix.
   - `app.py` builds the `FastAPI` app, mounts static files, includes routers. OpenAPI docs live at `<hub>/services/japps/docs`.
   - `routes.py` / `japps_routes.py` — the API routers. All routes are defined under the router prefix so they resolve correctly behind the Hub proxy.
   - `auth.py` / `security.py` — OAuth2 against the Hub plus a JWT cookie (`JHUB_APPS_AUTH_COOKIE_NAME`). Requires `JHUB_APP_JWT_SECRET_KEY`.
   - `models.py` — Pydantic models (`ServerCreation`, `JHubAppConfig`, `StartupApp`, `User`, etc.).

3. **Hub client** (`jhub_apps/hub_client/hub_client.py`) — wraps the JupyterHub REST API (start/stop named servers, list users, manage shares). `utils.is_jupyterhub_5()` gates behavior that differs between JupyterHub 4 and 5 — both are supported and tested.

4. **Spawner** (`jhub_apps/spawner/`) — `command.py` maps each `Framework` (see `types.py`) to the actual command used to serve it, often via `jhub-app-proxy` (installed from a pinned version, see `DEFAULT_JHUB_APP_PROXY_VERSION` in `config_utils.py`). `env.py` handles proxy args.

5. **Config** (`jhub_apps/config_utils.py`) — `JAppsConfig` is a traitlets `SingletonConfigurable`. User-facing options (`c.JAppsConfig.*`: `apps_auth_type`, `conda_envs`, `python_exec`, `startup_apps`, `additional_services`, etc.) are traits here. Pydantic models are embedded into traits via the custom `PydanticModelTrait`.

JupyterHub 4 vs. 5 compatibility is a recurring concern — when touching Hub API or sharing behavior, check `is_jupyterhub_5()` usage.

## Common commands

### Backend
```bash
uv sync --extra dev                  # install deps + dev extras
ruff check .                         # lint (CI gate; excludes k3s-dev/)
pytest jhub_apps/tests/tests_unit    # unit tests
pytest jhub_apps/tests/tests_unit/test_foo.py::test_bar   # single test
pytest jhub_apps/tests/tests_e2e -vvv -s --headed         # Playwright e2e
pytest -m "not k3s"                  # skip k3s-only tests
```

CI tests against a JupyterHub-4 and a JupyterHub-5 matrix using conflicting uv dependency groups — install the matching group when reproducing a version-specific failure:
```bash
uv sync --group test-jupyterhub-4 --extra dev   # or test-jupyterhub-5
uv run --group test-jupyterhub-5 --extra dev pytest jhub_apps/tests/tests_unit
```

### Frontend (run from `ui/`)
```bash
npm install
npm run dev          # Vite dev server on http://localhost:8080/hub/home
npm run watch        # rebuild on change (use alongside a running Hub)
npm run build        # production build; build-and-copy.sh copies assets into jhub_apps/static/
npm run test         # vitest (run mode); 80% coverage thresholds enforced
npm run ci           # biome ci — lint + format check (CI gate)
npm run check:fix    # biome auto-fix lint + format
```

`npm run build` triggers `ui/build-and-copy.sh`, which copies the hashed `index-*.js`/`.css` into `jhub_apps/static/`. UI changes are not visible to the Hub until a build + Hub restart + hard refresh.

### Running locally
Backend and frontend run as two processes:
```bash
export JHUB_APP_JWT_SECRET_KEY=$(openssl rand -hex 32)
jupyterhub -f jupyterhub_config.py          # Hub + japps service; UI at http://127.0.0.1:8000/hub/home
cd ui && npm run watch                       # in a second terminal
```

For Kubernetes/KubeSpawner testing, `cd k3s-dev && make up` (needs k3d, Tilt, Helm, kubectl); `make down` to tear down. Login with any username and password `password`.

## Conventions

- Backend logging uses `structlog` (`structlog.get_logger(__name__)`), not stdlib `logging`.
- Frontend: React 18, MUI 6, TanStack Query for data fetching, Recoil for state (`src/store.ts`), react-hook-form for forms, axios for HTTP (`src/data/api.ts`). A shadcn/ui migration is in progress — see `ui/SHADCN_MIGRATION.md`.
- Frontend lint/format is Biome (single quotes, space indent), not ESLint/Prettier. Config in `ui/biome.json`; husky runs checks pre-commit.
- `conda-project` is pinned to `0.4.2` and `setuptools` capped `<81` because conda-project still imports `pkg_resources` — don't bump without verifying.
