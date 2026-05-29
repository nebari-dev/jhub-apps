import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useEffect } from 'react';
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
import { Success } from './pages/success/success';
import {
  currentNotification,
  isHeadless as defaultIsHeadless,
  currentJhData as defaultJhData,
  currentProfiles as defaultProfiles,
  currentUser as defaultUser,
} from './store';
import type { AppProfileProps } from './types/api';
import type { JhData } from './types/jupyterhub';
import type { UserState } from './types/user';
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
      <main
        data-headless={isHeadless ? 'true' : undefined}
        className={
          isHeadless
            ? 'flex-grow bg-[#fafbfc] pl-1 pr-1 pt-1'
            : 'flex-grow bg-[#fafbfc] pl-1 pr-1 pt-[72px] sm:pl-[264px]'
        }
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
          <Route path="/success" element={<Success />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
};
