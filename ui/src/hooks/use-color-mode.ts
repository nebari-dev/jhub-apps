import {
  applyColorMode,
  type ColorMode,
  getStoredColorMode,
  storeColorMode,
} from '@src/utils/color-mode';
import { useCallback, useEffect, useState } from 'react';

export interface UseColorModeResult {
  colorMode: ColorMode;
  isDark: boolean;
  setColorMode: (mode: ColorMode) => void;
}

// Drives the light/dark/system preference: persists the choice, keeps the
// `.dark` class on <html> in sync, and follows the OS while in "system" mode.
export const useColorMode = (): UseColorModeResult => {
  const [colorMode, setColorModeState] = useState<ColorMode>(() =>
    getStoredColorMode(),
  );
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Keep "system" mode tracking the OS preference as it changes.
  useEffect(() => {
    let mediaQuery: MediaQueryList;
    try {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return;
    }
    const onChange = (event: MediaQueryListEvent) =>
      setSystemPrefersDark(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  // Re-apply whenever the chosen mode or the OS preference changes.
  useEffect(() => {
    applyColorMode(colorMode);
  }, [colorMode, systemPrefersDark]);

  const setColorMode = useCallback((mode: ColorMode) => {
    storeColorMode(mode);
    setColorModeState(mode);
  }, []);

  const isDark =
    colorMode === 'system' ? systemPrefersDark : colorMode === 'dark';

  return { colorMode, isDark, setColorMode };
};
