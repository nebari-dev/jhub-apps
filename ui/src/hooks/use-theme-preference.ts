import { useCallback, useEffect, useSyncExternalStore } from 'react';

const THEME_MODES = ['light', 'dark', 'system'] as const;

type ThemeMode = (typeof THEME_MODES)[number];

/** Storage key used when the caller doesn't pass one. */
const DEFAULT_THEME_STORAGE_KEY = 'nebari:themeMode';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function isThemeMode(value: unknown): value is ThemeMode {
  return (
    typeof value === 'string' &&
    (THEME_MODES as readonly string[]).includes(value)
  );
}

interface UseThemePreferenceOptions {
  /**
   * `localStorage` key the preference persists under. Keep an app's existing
   * key so users don't lose their saved preference.
   *
   * Pass a stable value — changing it mid-session re-reads the preference
   * from (and redirects writes to) the new key.
   *
   * @default 'nebari:themeMode'
   */
  storageKey?: string;
}

interface UseThemePreferenceResult {
  /** The persisted preference: `'light'`, `'dark'`, or `'system'`. */
  themeMode: ThemeMode;
  /** The resolved appearance — in `'system'` mode this follows the OS. */
  isDarkMode: boolean;
  /** Update (and persist) the preference. */
  setThemeMode: (mode: ThemeMode) => void;
}

// The preference lives outside React (localStorage plus the listener set
// below) and is read through `useSyncExternalStore`, so the server render and
// the hydration render both see the same defaults (`'system'`, light) while
// client renders see the real stored/OS values — no hydration mismatch.
const themeModeListeners = new Set<() => void>();

// Session fallback for when `localStorage` throws (private browsing, disabled
// cookies): the preference still updates in memory.
const inMemoryThemeModes = new Map<string, ThemeMode>();

function subscribeToThemeMode(onStoreChange: () => void): () => void {
  themeModeListeners.add(onStoreChange);
  return () => {
    themeModeListeners.delete(onStoreChange);
  };
}

function readStoredMode(storageKey: string): ThemeMode {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return isThemeMode(stored) ? stored : 'system';
  } catch {
    return inMemoryThemeModes.get(storageKey) ?? 'system';
  }
}

function writeStoredMode(storageKey: string, mode: ThemeMode): void {
  try {
    window.localStorage.setItem(storageKey, mode);
    // Storage is the source of truth again — drop any stale fallback.
    inMemoryThemeModes.delete(storageKey);
  } catch {
    // Storage unavailable — the in-memory copy carries the session.
    inMemoryThemeModes.set(storageKey, mode);
  }
  for (const listener of themeModeListeners) {
    listener();
  }
}

function serverThemeMode(): ThemeMode {
  return 'system';
}

// Both `matchMedia` and the `MediaQueryList` event API are guarded: an engine
// missing either (Safari < 14 has no `addEventListener` here) keeps the light
// default instead of throwing.
function subscribeToSystemScheme(onStoreChange: () => void): () => void {
  try {
    const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
    mediaQuery.addEventListener('change', onStoreChange);
    return () => mediaQuery.removeEventListener('change', onStoreChange);
  } catch {
    return () => {};
  }
}

function prefersDark(): boolean {
  try {
    return window.matchMedia(DARK_SCHEME_QUERY).matches;
  } catch {
    return false;
  }
}

function serverPrefersDark(): boolean {
  return false;
}

/**
 * Theme/dark-mode state for apps built on the Nebari theme tokens. Persists a
 * `light` / `dark` / `system` preference, follows the OS while in `system`
 * mode, and toggles the `.dark` class on `<html>` so every token-styled
 * component re-themes automatically.
 *
 * SSR-safe: the server render and the hydration render both resolve to
 * `'system'` / light, then the real stored/OS values apply immediately after
 * hydration — pair with `themeBootstrapScript` so the pre-paint class already
 * matches and there is no flash.
 *
 * Mount it exactly once (directly or via `ThemeProvider`) — multiple instances
 * would compete over the `<html>` class.
 */
function useThemePreference(
  options: UseThemePreferenceOptions = {},
): UseThemePreferenceResult {
  const { storageKey = DEFAULT_THEME_STORAGE_KEY } = options;

  const readThemeMode = useCallback(
    () => readStoredMode(storageKey),
    [storageKey],
  );
  const themeMode = useSyncExternalStore(
    subscribeToThemeMode,
    readThemeMode,
    serverThemeMode,
  );
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemScheme,
    prefersDark,
    serverPrefersDark,
  );

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      writeStoredMode(storageKey, mode);
    },
    [storageKey],
  );

  const isDarkMode =
    themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return { themeMode, isDarkMode, setThemeMode };
}

/**
 * Inline script that applies the saved (or OS) theme before first paint,
 * eliminating the flash of the wrong theme. It resolves `dark` exactly like
 * `useThemePreference` does, from the same storage key and default.
 *
 * Paste the returned string into a `<script>` at the top of `<head>` in
 * `index.html` (or inject it from an HTML template/SSR layer).
 */
function themeBootstrapScript(
  storageKey: string = DEFAULT_THEME_STORAGE_KEY,
): string {
  // Each browser API gets its own try so one failing (storage disabled,
  // matchMedia missing) doesn't stop the others — mirroring how the hook
  // guards them independently.
  return [
    '(function () {',
    '  var mode = null;',
    '  var prefersDark = false;',
    '  try {',
    `    mode = localStorage.getItem(${JSON.stringify(storageKey)});`,
    '  } catch (e) {}',
    '  try {',
    `    prefersDark = window.matchMedia('${DARK_SCHEME_QUERY}').matches;`,
    '  } catch (e) {}',
    "  var isDark = mode === 'dark' || (mode !== 'light' && prefersDark);",
    '  try {',
    "    document.documentElement.classList.toggle('dark', isDark);",
    '  } catch (e) {}',
    '})();',
  ].join('\n');
}

export type { ThemeMode, UseThemePreferenceOptions, UseThemePreferenceResult };
export {
  DEFAULT_THEME_STORAGE_KEY,
  isThemeMode,
  THEME_MODES,
  themeBootstrapScript,
  useThemePreference,
};
