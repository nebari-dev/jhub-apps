import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';

import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { Navigation, NotificationBar } from './components';
import { CreateApp } from './pages/create-app/create-app';
import { EditApp } from './pages/edit-app/edit-app';
import { Home } from './pages/home/home';
import { NotRunning } from './pages/not-running/not-running';
import { ServerTypes } from './pages/server-types/server-types';
import { StopPending } from './pages/stop-pending/stop-pending';
import {
  currentNotification,
  isHeadless as defaultIsHeadless,
  currentJhData as defaultJhData,
  currentProfiles as defaultProfiles,
  currentUser as defaultUser,
} from './store';
import { AppProfileProps } from './types/api';
import { JhData } from './types/jupyterhub';
import { UserState } from './types/user';
import axios from './utils/axios';
import { getJhData } from './utils/jupyterhub';

export const App = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const [, setCurrentJhData] = useRecoilState<JhData>(defaultJhData);
  const [, setCurrentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [, setCurrentProfiles] =
    useRecoilState<AppProfileProps[]>(defaultProfiles);
  const [notification, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [isHeadless, setIsHeadless] =
    useRecoilState<boolean>(defaultIsHeadless);

  const { error: userError, data: userData } = useQuery<
    UserState,
    { message: string }
  >({
    queryKey: ['user-state'],
    queryFn: () =>
      axios
        .get('/user')
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
  });

  const { error: profileError, data: profileData } = useQuery<
    AppProfileProps[],
    { message: string }
  >({
    queryKey: ['server-types'],
    queryFn: () =>
      axios
        .get('/spawner-profiles/')
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
  });

  useEffect(() => {
    if (userError) {
      setNotification(userError.message);
    } else if (profileError) {
      setNotification(profileError.message);
    }
  }, [userError, profileError, setNotification]);

  useEffect(() => {
    setCurrentJhData(getJhData());
  }, [setCurrentJhData]);

  useEffect(() => {
    if (userData) {
      setCurrentUser({ ...userData });
    }
  }, [userData, setCurrentUser]);

  useEffect(() => {
    if (profileData) {
      setCurrentProfiles([...profileData]);
    }
  }, [profileData, setCurrentProfiles]);

  useEffect(() => {
    if (searchParams.get('headless') === 'true') {
      setIsHeadless(true);
    }
  }, [searchParams]);

  return (
    <div>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: isHeadless ? 1 : 9,
          pl: { xs: 1, sm: isHeadless ? 1 : 33 },
          pr: 1,
          backgroundColor: '#fafbfc',
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
          <Route path="/user/:id/*" element={<NotRunning />} />
          <Route path="/create-app" element={<CreateApp />} />
          <Route path="/edit-app" element={<EditApp />} />
          <Route path="/server-types" element={<ServerTypes />} />
          <Route path="/stop-pending" element={<StopPending />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Box>
    </div>
  );
};
