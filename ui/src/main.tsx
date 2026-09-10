import { ThemeProvider } from '@src/hooks/theme-provider';
import {
  API_BASE_URL,
  APP_BASE_URL,
  THEME_STORAGE_KEY,
} from '@src/utils/constants.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { App } from './App.tsx';
import { Toaster } from './components/ui/toast';
import { TooltipProvider } from './components/ui/tooltip';
import './index.css';
import { loadRuntimeConfig } from './utils/theme.ts';

// Apply the saved (or OS) colour mode before React renders so there is no
// flash of the wrong theme. This is the inline equivalent of
// `themeBootstrapScript(THEME_STORAGE_KEY)` from src/hooks/use-theme-preference
// (the registry hook is the source of truth for how `dark` is resolved); once
// mounted, <ThemeProvider> owns the `.dark` class on <html>.
const applyInitialThemeMode = () => {
  let mode: string | null = null;
  let prefersDark = false;
  try {
    mode = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    // Storage unavailable (private browsing, disabled) — follow the OS.
  }
  try {
    prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    // matchMedia unavailable — keep the light default.
  }
  document.documentElement.classList.toggle(
    'dark',
    mode === 'dark' || (mode !== 'light' && prefersDark),
  );
};
applyInitialThemeMode();

const currentUrl = new URL(window.location.href);
const queryClient = new QueryClient();

loadRuntimeConfig().finally(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element with id "root" not found');
  }
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>
        <BrowserRouter
          basename={
            currentUrl.pathname.indexOf('hub') === -1
              ? API_BASE_URL
              : APP_BASE_URL
          }
        >
          <RecoilRoot>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <App />
                <Toaster />
              </TooltipProvider>
            </QueryClientProvider>
          </RecoilRoot>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>,
  );
});
