import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Route, Routes } from 'react-router';
import { Home } from './pages/home/home';

const queryClient = new QueryClient();

export const App = (): React.ReactElement => (
  <QueryClientProvider client={queryClient}>
    <div>
      <main id="mainSection">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  </QueryClientProvider>
);
