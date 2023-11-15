import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { useRecoilState } from 'recoil';
import { Home } from './pages/home/home';
import { currentJhData } from './store';
import { JhData } from './types/jupyterhub';
import { getJhData } from './utils/jupyterhub';

const queryClient = new QueryClient();

export const App = (): React.ReactElement => {
  const [, setJhData] = useRecoilState<JhData>(currentJhData);
  useEffect(() => {
    setJhData(getJhData());
  }, [setJhData]);

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <main className="my-6">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </QueryClientProvider>
  );
};
