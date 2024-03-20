import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { useRecoilState } from 'recoil';
import { Navigation, NotificationBar } from './components';
import { CreateApp } from './pages/create-app/create-app';
import { EditApp } from './pages/edit-app/edit-app';
import { Home } from './pages/home/home';
import { ServerTypes } from './pages/server-types/server-types';
import {
  currentNotification,
  currentJhData as defaultJhData,
  currentUser as defaultUser,
} from './store';
import { JhData } from './types/jupyterhub';
import { UserState } from './types/user';
import axios from './utils/axios';
import { getJhData } from './utils/jupyterhub';

export const App = (): React.ReactElement => {
  const [, setCurrentJhData] = useRecoilState<JhData>(defaultJhData);
  const [, setCurrentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [notification, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );

  const { error, data: userData } = useQuery<UserState, { message: string }>({
    queryKey: ['user-state'],
    queryFn: () =>
      axios
        .get(`/user`)
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
  });

  useEffect(() => {
    if (error) {
      setNotification(error.message);
    }
  }, [error, setNotification]);

  useEffect(() => {
    setCurrentJhData(getJhData());
  }, [setCurrentJhData]);

  useEffect(() => {
    if (userData) {
      setCurrentUser({ ...userData });
    }
  }, [userData, setCurrentUser]);

  return (
    <div>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 9,
          pl: { xs: 1, sm: 33 },
          pr: 1,
        }}
      >
        {notification ? (
          <NotificationBar
            message={notification}
            onClose={() => setNotification(undefined)}
          />
        ) : (
          <></>
        )}
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/create-app" element={<CreateApp />} />
          <Route path="/edit-app" element={<EditApp />} />
          <Route path="/server-types" element={<ServerTypes />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Box>
    </div>
  );
};
