# MUI → shadcn/ui Migration Plan

This is the working plan for migrating the `/ui` app from Material-UI to shadcn/ui. Work through each phase in order; check off tasks as they're completed.

The migration assumes a predefined Figma component library exists. Every phase below references the Figma frame(s) it implements as the source of truth for visual design.

---

## Overview

Migrate the `/ui` React app from Material-UI (MUI) to shadcn/ui (Tailwind CSS + Radix primitives), aligning all visual output with the predefined Figma component designs. The migration is incremental, leaf-first, with MUI and shadcn coexisting until the final teardown.

### Goals
- Replace `@mui/material`, `@mui/icons-material`, `@mui/lab`, `@emotion/react`, `@emotion/styled`, and `sass` with Tailwind + shadcn/ui + `lucide-react`.
- Match the predefined Figma designs for every component, page, and interaction state (hover/focus/disabled/error).
- Keep the existing 24 test files green throughout; update only selectors that depend on MUI internals.
- No regressions on any of the 7 routes or the `?headless=true` flag.

### Source of truth
- **Visual design**: Figma component library (variants, color tokens, spacing, typography, breakpoints, states). Each phase below references the Figma frame(s) it implements.
- **Behavior**: existing components in `/ui/src/**`.

### Scope
- **73 TS/TSX files** (24 tests). 50 `@mui/material` imports, 49 `@mui/icons-material` imports, 1 `@mui/lab` use.
- Custom MUI theme at `ui/src/theme/theme.tsx` to be replaced by Tailwind tokens derived from Figma.
- 18 files use `sx`, 5 use `styled()`, 3 use `useTheme`/`useMediaQuery`.

### Strategy
Incremental, leaf-first. MUI and shadcn coexist; Tailwind preflight is **disabled** during the migration to avoid CssBaseline conflicts and re-enabled at teardown.

### Top risks
- Tailwind preflight vs MUI `CssBaseline` collisions during coexistence.
- Hidden `.MuiDrawer-paper` / `.Mui*` selectors in `.css` files breaking silently at teardown.
- `app-form.tsx` and `app-sharing.tsx` are disproportionately complex.
- Test selectors using MUI test ids (e.g. `data-testid="PublicRoundedIcon"` in `app-table.tsx`) become wrong once icons swap to Lucide.

### Effort estimate
~2–3 weeks of focused work for one engineer.

### Out of scope
- Storybook setup (optional; can be a follow-up).
- Backend changes.
- Adding new features during migration — visual parity with Figma only.

---

## Pre-flight: Test-selector audit

Can run in parallel with Phase 1. Find and replace test selectors and CSS selectors that depend on MUI internals, before they silently break during the migration.

- [ ] Grep `ui/src/` for `data-testid="…RoundedIcon"`, `data-testid="…Icon"`, and other MUI-icon-derived test ids. Replace with neutral test ids set by us. Known site: `app-table.tsx` uses `data-testid="PublicRoundedIcon"`.
- [ ] Grep test files for `.MuiDrawer-paper`, `.MuiButton-`, etc. — replace with role/text/test-id selectors.
- [ ] Grep all 15 component `.css` files for `.Mui*` selectors. Document each occurrence; address in the relevant phase below.
- [ ] All `data-testid="…RoundedIcon"`-style ids replaced before the icon swap happens in that file.

---

## Phase 1: Foundation (Tailwind + shadcn install, Figma token mapping)

Install Tailwind CSS + shadcn/ui alongside MUI without breaking the existing app. Port design tokens from the Figma component library into the Tailwind config and shadcn CSS variables.

**Design source**: Figma — global tokens frame (colors, typography, spacing, radii, shadows, breakpoints).

### Tasks
- [ ] Snapshot current visuals on all 7 routes + dialogs for regression checks.
- [ ] Install: `tailwindcss`, `postcss`, `autoprefixer`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `@hookform/resolvers`.
- [ ] Generate `tailwind.config.js` and `postcss.config.js`. `content: ['./index.html', './src/**/*.{ts,tsx}']`.
- [ ] **Set `corePlugins: { preflight: false }`** for the duration of the migration.
- [ ] Configure breakpoints to match the Figma breakpoint tokens (verify against current MUI defaults: 0/600/900/1200/1536).
- [ ] Configure `theme.extend.colors` with HSL values from the Figma color tokens. Add semantic aliases per shadcn convention: `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `destructive`, `muted`, `accent`, `border`, `input`, `ring`, `background`, `foreground`.
- [ ] Configure `theme.extend.fontFamily` from Figma typography tokens (likely `Inter`); load font via `<link>` or self-host.
- [ ] Run `npx shadcn@latest init` (TypeScript, CSS variables = yes).
- [ ] Replace shadcn's generated `globals.css`:
  - CSS variables sourced from Figma tokens.
  - Keep load-bearing rules from `ui/src/index.css` (`.container`, `.grid-spacer`, `.grid-heading-*`) for now — they're used by class name in pages.
- [ ] Wrap `<App />` in `<TooltipProvider>` (keep MUI `<ThemeProvider>` for now).
- [ ] Verify the app still builds, all tests pass, all 7 routes render unchanged.

### Done when
- `npm run dev`, `npm run build`, `npm test` all succeed.
- No visual regressions vs the snapshots taken at the start.
- Tailwind classes work in a smoke-test file (delete after verification).

---

## Phase 2: Shared primitives & helpers

Add the shadcn primitives the migration will need, plus the few helpers required because shadcn doesn't ship direct equivalents of some MUI patterns. Match Figma variant/state designs exactly.

**Design source**: Figma — component library: Button (all variants & states), Input, Select, Combobox, Dialog, Sheet, Card, Badge, Alert, Toast, Table, DataTablePagination, Form fields.

### Tasks
- [ ] Add shadcn components: `npx shadcn@latest add button input label textarea select checkbox radio-group switch dialog sheet dropdown-menu popover tooltip card badge separator alert sonner table form command`.
- [ ] Mount `<Toaster />` (sonner) in `App.tsx`.
- [ ] **Button variants via CVA** matching Figma: primary/secondary/destructive × contained/outlined/text, plus sizes (sm/default/lg/icon). Cover hover/focus/active/disabled states from Figma.
- [ ] **Typography helper** — class-string map (or tiny `<Text variant="…">` component) for h1–h6, subtitle1, subtitle2, body1, body2, caption, overline, sourced from Figma type styles.
- [ ] **`<InputWithIcon>`** helper for `InputAdornment` use cases (3 call sites).
- [ ] **`<Combobox>`** built from `Command` + `Popover` for the async user/group picker in `app-sharing.tsx`.
- [ ] **`<DataTablePagination>`** for the custom paginated table in `app-sharing.tsx`.
- [ ] Build a `useMediaQuery` hook (small wrapper over `matchMedia`) for the 3 files that currently use MUI's hook.

### Done when
- Each primitive renders in isolation matching its Figma frame (manual visual check at minimum).
- Button variant matrix verified across all states against Figma.
- Combobox handles async data loading + empty + error states per Figma.
- All existing tests pass.

---

## Phase 3: Migrate leaf components

Migrate the smallest, most-reused components — they are leaves and don't depend on MUI parents. Match each component's Figma frame.

**Design source**: Figma — components: NotificationBar/Alert, StatusChip/Badge, CustomLabel, Thumbnail, ButtonGroup, EnvironmentVariables.

### Files
- [x] `ui/src/components/notification-bar/notification-bar.tsx` — `Alert` → shadcn `Alert`.
- [x] `ui/src/components/status-chip/status-chip.tsx` — `Chip` → `Badge` (use Figma badge variants).
- [x] `ui/src/components/custom-label/custom-label.tsx` — `Typography`/`Box` → `<span>`/`<div>` + Tailwind.
- [x] `ui/src/components/thumbnail/thumbnail.tsx` — drop `useTheme`; replace `sx` with Tailwind classes.
- [x] `ui/src/components/button-group/button-group.tsx` — flex of shadcn buttons.
- [x] `ui/src/components/environment-variables/environment-variables.tsx` — TextField → `Input` + `Label`.

### Done when
- Each migrated component visually matches its Figma frame in all states.
- No `@mui/*` imports remain in these files.
- Existing tests pass; selectors updated where needed.

---

## Phase 4a: Migrate `context-menu`

Replace the MUI `Menu`/`MenuItem`/`Divider` implementation with shadcn `DropdownMenu`, matching the Figma context-menu design.

**Design source**: Figma — ContextMenu / DropdownMenu component (item, separator, destructive item, disabled item, hover/focus states).

### Tasks
- [ ] `ui/src/components/context-menu/context-menu.tsx` — replace `Menu` + `MenuItem` + `Divider` with `DropdownMenu` + `DropdownMenuItem` + `DropdownMenuSeparator`.
- [ ] Drop `useTheme` usage; rely on Tailwind classes.
- [ ] Map any MUI icons to `lucide-react` equivalents.
- [ ] Update any tests that select on MUI internals.

### Done when
- Visual + interaction parity with the Figma menu design.
- All call sites of `<ContextMenu>` continue to work.
- Tests pass.

---

## Phase 4b: Migrate `app-card`

Replace MUI `Card`/`CardContent`/`CardMedia`/`Chip`/`Tooltip`/`Typography` with shadcn `Card` + `Badge` + `Tooltip`, matching the Figma app-card design across all states.

**Design source**: Figma — AppCard component (default, hover, pinned, error, with thumbnail, without thumbnail).

### Files
- [ ] `ui/src/components/app-card/app-card.tsx`
- [ ] `ui/src/components/app-card/app-card.css` — audit for `.Mui*` selectors and remove.

### Done when
- Visual parity with Figma in every state.
- Tests pass; any MUI-icon-derived test ids replaced with neutral ids.

---

## Phase 4c: Migrate `app-sharing` (Autocomplete + TablePagination)

The most MUI-dependent component in the codebase. It uses `Autocomplete`, `TablePagination`, `ClickAwayListener`, `Table*`, `Switch`, `Alert`, and `InputAdornment`. Match the Figma sharing UI.

**Design source**: Figma — AppSharing frames (user picker, group picker, permissions table, pagination, empty state, loading state, error states).

### Tasks (`ui/src/components/app-sharing/app-sharing.tsx`)
- [ ] Replace `Autocomplete` with the `<Combobox>` helper from Phase 2 (async user/group loading).
- [ ] Replace `TablePagination` with the `<DataTablePagination>` helper.
- [ ] Replace `ClickAwayListener` — Radix `Popover` already handles outside clicks; remove it.
- [ ] Replace `Table*` with shadcn `Table` subcomponents.
- [ ] Replace `Switch`, `Alert`, `InputAdornment` with shadcn equivalents (`InputWithIcon` from Phase 2).
- [ ] Map all icons to `lucide-react`.

### Done when
- Visual parity with Figma across all interaction states.
- Async loading, empty, and error UX matches Figma.
- Tests pass; manual UAT on adding/removing users and groups.

### Risks
- Async data loading + keyboard nav in the Combobox is the gnarliest part. Test thoroughly.

---

## Phase 4d: Migrate `app-form`

Convert the largest single component to shadcn `Form` + `FormField` (built on the existing `react-hook-form`). Match the Figma form designs precisely — every field's spacing, label, helper, and error state.

**Design source**: Figma — AppForm frames (all field types, validation states, dialogs, loading, success).

### Tasks
- [ ] Pre-work: write a manual checklist of every field's behavior (label, helper, validation message, default, conditional visibility) to verify after refactor.
- [ ] `ui/src/components/app-form/app-form.tsx` — replace MUI form primitives field-by-field using shadcn `Form` pattern with `Controller` (already in use).
- [ ] Replace `Dialog` → shadcn `Dialog`.
- [ ] Replace `LoadingButton` (`@mui/lab`) → `Button` + `Loader2` from `lucide-react`.
- [ ] Replace `CircularProgress` → `Loader2` with `animate-spin`.
- [ ] Replace `Switch`, `Select`/`MenuItem` directly.
- [ ] Audit any colocated CSS for `.Mui*` selectors.

### Done when
- Every field matches its Figma frame including error/disabled/required states.
- Validation behavior unchanged (verified field-by-field against the pre-work checklist).
- All existing form tests pass.

### Risks
- This is the largest single chunk of work in the migration. Manual UAT required.

---

## Phase 5a: Migrate small pages

Migrate the simpler pages. Match each page's Figma frame.

**Design source**: Figma — page frames: Success, StopPending, NotRunning, ServerTypes, CreateApp, EditApp.

### Files
- [ ] `ui/src/pages/success/success.tsx`
- [ ] `ui/src/pages/stop-pending/stop-pending.tsx`
- [ ] `ui/src/pages/not-running/not-running.tsx`
- [ ] `ui/src/pages/server-types/server-types.tsx` — Grid → Tailwind grid utilities.
- [ ] `ui/src/pages/create-app/create-app.tsx`
- [ ] `ui/src/pages/edit-app/edit-app.tsx`

### Done when
- Each page visually matches Figma at each breakpoint.
- Tests pass.

---

## Phase 5b: Migrate `home` subtree + Snackbar → Sonner

Migrate the home page and its subtree (filters, table, grid, services). Replace the Snackbar/Alert state machine with Sonner toasts. Match the Figma home design.

**Design source**: Figma — Home, AppFilters, AppTable, AppGrid, ServicesSection, ServiceGrid, confirmation dialogs (start/stop/delete), toast notifications.

### Files
- [ ] `ui/src/pages/home/apps-section/app-filters/app-filters.tsx` — fold `ui/src/styles/styled-filter-button.tsx` into a shadcn Button variant from Figma.
- [ ] `ui/src/pages/home/apps-section/app-table/app-table.tsx` — Table → shadcn Table; drop Paper. **Replace MUI-icon test ids** (e.g. `data-testid="PublicRoundedIcon"`) with neutral ids set by us.
- [ ] `ui/src/pages/home/apps-section/app-grid/app-grid.tsx` — Grid → Tailwind grid.
- [ ] `ui/src/pages/home/apps-section/apps-section.tsx`
- [ ] `ui/src/pages/home/services-section/services-section.tsx`
- [ ] `ui/src/pages/home/services-section/service-grid/service-grid.tsx`
- [ ] `ui/src/pages/home/home.tsx` — replace `Snackbar`/`Alert` state with `toast()` from Sonner; replace confirmation `Dialog`s with shadcn `Dialog`; drop `SvgIcon` wrapper for the custom check icon.

### Done when
- Visual parity with Figma at all breakpoints, table view + grid view + services.
- Toast behavior matches Figma toast designs.
- All confirmation dialogs (start/stop/delete) match Figma.
- Tests pass.

---

## Phase 6: Navigation shell + `App.tsx`

Migrate the app shell — the most complex layout file after `app-form` and `app-sharing`. Match the Figma navigation design at all breakpoints.

**Design source**: Figma — Navigation frames: desktop persistent sidebar, mobile collapsed, mobile expanded (sheet), header, user menu.

### Tasks
- [ ] `ui/src/components/navigation/navigation.tsx` — replace `AppBar` + `Toolbar` with semantic `<header>` + Tailwind classes from Figma.
- [ ] Replace `Drawer` with shadcn `Sheet` for mobile + plain `<aside>` for the persistent desktop sidebar.
- [ ] Replace `Menu` with shadcn `DropdownMenu`.
- [ ] Replace `useMediaQuery` with the `useMediaQuery` hook from Phase 2 (or Tailwind responsive utilities where possible).
- [ ] Inline all `styled()` definitions as Tailwind classes.
- [ ] `ui/src/components/navigation/navigation.css` — remove `.MuiDrawer-paper` and other `.Mui*` selectors.
- [ ] `ui/src/App.tsx` — replace `<Box component="main" sx={…}>` with `<main className="…">`. Headless mode (`?headless=true`) toggles padding via classes / data attribute.

### Done when
- Visual parity with Figma at desktop, tablet, and mobile breakpoints.
- Drawer open/close behavior matches Figma — mobile sheet, persistent on desktop.
- `?headless=true` works as before.
- Tests pass.

---

## Phase 7: Teardown — remove MUI, re-enable preflight

Remove MUI entirely, re-enable Tailwind preflight, and clean up.

### Tasks
- [ ] Re-enable Tailwind preflight: remove `corePlugins: { preflight: false }`. Triage and fix any preflight-driven regressions (button background, h-tag margins).
- [ ] Remove `<ThemeProvider>` and `<CssBaseline />` from `ui/src/main.tsx`.
- [ ] Delete `ui/src/theme/` directory.
- [ ] Delete `ui/src/styles/styled-form-section.tsx`, `styled-form-paragraph.tsx`, `styled-item.tsx`, `styled-filter-button.tsx`.
- [ ] Reconcile `ui/src/index.css` with shadcn `globals.css` — single source of truth from Figma tokens.
- [ ] Audit all 15 component CSS files for any remaining `.Mui*` selectors.
- [ ] Uninstall: `@mui/material`, `@mui/icons-material`, `@mui/lab`, `@emotion/react`, `@emotion/styled`, `sass`. Replace `classnames` with `clsx` + `tailwind-merge` if any uses remain.
- [ ] Run `npx eslint src/ --fix` and `npx prettier src --write`.
- [ ] Run `npm test`; fix any final selector regressions.
- [ ] Manual smoke-test all 7 routes + `?headless=true`.

### Done when
- `grep -r "@mui\|@emotion" ui/src/` returns nothing.
- `package.json` has no MUI/emotion/sass entries.
- Bundle size measurably reduced (record before/after).
- All tests pass; all routes render correctly with preflight on.
