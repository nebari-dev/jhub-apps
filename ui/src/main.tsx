import { API_BASE_URL, APP_BASE_URL } from '@src/utils/constants.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { App } from './App.tsx';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import './index.css';
import { initColorMode } from './utils/color-mode.ts';
import { loadRuntimeConfig } from './utils/theme.ts';

// Apply the saved (or OS) color mode before React renders so there is no
// flash of the wrong theme (FOUC).
initColorMode();

const currentUrl = new URL(window.location.href);
const queryClient = new QueryClient();

loadRuntimeConfig().finally(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element with id "root" not found');
  }
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
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
    </React.StrictMode>,
  );
});
