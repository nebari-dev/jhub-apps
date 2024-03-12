import { CssBaseline, ThemeProvider } from '@mui/material';
import { API_BASE_URL, APP_BASE_URL } from '@src/utils/constants.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { App } from './App.tsx';
import './index.css';
import { theme } from './theme/theme.tsx';

const currentUrl = new URL(window.location.href);
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      basename={
        currentUrl.pathname.indexOf('hub') === -1 ? API_BASE_URL : APP_BASE_URL
      }
    >
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ThemeProvider>
      </RecoilRoot>
    </BrowserRouter>
  </React.StrictMode>,
);
