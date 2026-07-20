export const COLOR_MODES = ['light', 'dark', 'system'] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

const STORAGE_KEY = 'jhub-apps:color-mode';
const DARK_CLASS = 'dark';

export const isColorMode = (value: string): value is ColorMode =>
  (COLOR_MODES as readonly string[]).includes(value);

const prefersDark = (): boolean => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
};

// Reads the persisted preference, defaulting to "system" on first visit (no
// saved choice) so the app follows the OS via `prefers-color-scheme`.
export const getStoredColorMode = (): ColorMode => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== null && isColorMode(raw)) {
      return raw;
    }
  } catch {
    // Storage unavailable (private browsing, disabled, security error).
  }
  return 'system';
};

export const storeColorMode = (mode: ColorMode): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage unavailable; the in-memory preference still applies this session.
  }
};

// Resolves a mode to whether dark styling should currently be active.
export const isDarkMode = (mode: ColorMode): boolean =>
  mode === 'system' ? prefersDark() : mode === 'dark';

// Toggles the `.dark` class the runtime CSS-variable token set keys off of.
export const applyColorMode = (mode: ColorMode): void => {
  document.documentElement.classList.toggle(DARK_CLASS, isDarkMode(mode));
};

// Applies the stored (or system) preference as early as possible — before
// React renders — so there is no flash of the wrong theme (FOUC).
export const initColorMode = (): ColorMode => {
  const mode = getStoredColorMode();
  applyColorMode(mode);
  return mode;
};
