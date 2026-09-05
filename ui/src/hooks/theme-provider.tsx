import {
  type UseThemePreferenceOptions,
  type UseThemePreferenceResult,
  useThemePreference,
} from '@src/hooks/use-theme-preference';
import { createContext, type ReactNode, useContext } from 'react';

const ThemeContext = createContext<UseThemePreferenceResult | null>(null);

interface ThemeProviderProps extends UseThemePreferenceOptions {
  children?: ReactNode;
}

/**
 * Mounts `useThemePreference` once at the app root and shares its state, so
 * any descendant can read or set the theme via `useTheme` without competing
 * `<html>` class writers.
 */
function ThemeProvider({ children, ...options }: ThemeProviderProps) {
  const theme = useThemePreference(options);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

function useTheme(): UseThemePreferenceResult {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }
  return context;
}

export { ThemeProvider, useTheme };
