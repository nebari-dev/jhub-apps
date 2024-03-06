import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { useRecoilState } from 'recoil';
import { NotificationBar } from './components';
import { CreateApp } from './pages/create-app/create-app';
import { EditApp } from './pages/edit-app/edit-app';
import { Home } from './pages/home/home';
import { ServerTypes } from './pages/server-types/server-types';
import { currentJhData, currentNotification } from './store';
import { JhData } from './types/jupyterhub';
import { getJhData, storeJhData } from './utils/jupyterhub';

const queryClient = new QueryClient();

export const App = (): React.ReactElement => {
  const [, setJhData] = useRecoilState<JhData>(currentJhData);
  const [notification] = useRecoilState<string | undefined>(
    currentNotification,
  );

  useEffect(() => {
    setJhData(getJhData());
    storeJhData(getJhData());
  }, [setJhData]);

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <main>
          {notification ? <NotificationBar message={notification} /> : <></>}
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/create-app" element={<CreateApp />} />
            <Route path="/edit-app" element={<EditApp />} />
            <Route path="/server-types" element={<ServerTypes />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </QueryClientProvider>
  );
};
