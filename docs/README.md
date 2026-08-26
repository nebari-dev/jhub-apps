# JHub Apps Documentation

The documentation for JHub Apps is built with [Astro](https://astro.build/) +
[Starlight](https://starlight.astro.build/), themed with the shared
[`@nebari/starlight`](https://github.com/nebari-dev/starlight) plugin.

## Installation

Install [Bun](https://bun.sh/), then install the dependencies:

```
cd docs
bun install
```

## Local development

```
bun run dev
```

This starts a local dev server at `http://localhost:4321`. Most changes are
reflected live without restarting the server.

## Build the static site

```
bun run build
```

This generates the static site into `dist/`. Preview the production build
locally with:

```
bun run preview
```

Run the build smoke tests (they build the site and check that every page and
internal link resolves) with:

```
bun test test
```

## Layout

- `src/content/docs/` — the documentation pages (Markdown/MDX). The sidebar is
  defined explicitly in `astro.config.mjs`.
- `public/` — static assets served verbatim (`/img/...`, `favicon.ico`, and
  the Cloudflare Pages `_redirects` file).
- `src/components/Head.astro` — wraps the theme head to add Google Analytics
  (consent denied by default) and the cookie-consent banner.

## Deployment

The site deploys to Cloudflare Pages via GitHub Actions
([`.github/workflows/docs.yml`](../.github/workflows/docs.yml)): every push to
`main` that touches `docs/**` builds and deploys production at
<https://jhub-apps.nebari.dev/>, and pull requests get a preview deployment
whose URL is posted as a PR comment. Preview deployments are cleaned up when
the PR closes
([`.github/workflows/docs-preview-cleanup.yml`](../.github/workflows/docs-preview-cleanup.yml)).
