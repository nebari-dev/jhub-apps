import { Box, CircularProgress } from '@mui/material';
import { AppQueryGetProps } from '@src/types/api';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { APP_BASE_URL } from '@src/utils/constants';
import {
  getSpawnPendingUrl,
  isDefaultServer,
  storeAppToStart,
} from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { currentUser as defaultUser } from '../../store';

export const NotRunning = (): React.ReactElement => {
  const [id, setId] = React.useState<string | null>(null);
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const { data: formData } = useQuery<AppQueryGetProps, { message: string }>({
    queryKey: ['app-form', id],
    queryFn: () =>
      axios
        .get(`/server/${id}`)
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          return { message: error.message };
        }),
    enabled: !!id,
  });

  useEffect(() => {
    if (currentUser) {
      const currentId = window.location.pathname
        .replace(/\/$/, '')
        .split('/')
        .pop();
      if (currentId) {
        setId(currentId);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!formData) {
      return;
    }

    // If app is started, redirect to the app
    if (formData?.started) {
      window.location.assign(window.location.href.replace('/hub', ''));
    }
    // If pending, redirect to spawn pending page
    else if (formData?.pending && currentUser && id) {
      window.location.assign(getSpawnPendingUrl(currentUser, id));
    }
    // If stopped and default server, redirect to spawn pending page
    else if (
      formData?.stopped &&
      currentUser &&
      id &&
      isDefaultServer(formData.name)
    ) {
      window.location.assign(getSpawnPendingUrl(currentUser, id));
    }
    // If stopped and not default server, redirect home store app id for automated start
    else if (formData?.stopped && id && !isDefaultServer(formData.name)) {
      storeAppToStart(id); // TODO: Update this to store in global state when everything is running in single react app
      window.location.assign(APP_BASE_URL);
    }
    // If error, redirect to home page
    else {
      window.location.assign(APP_BASE_URL);
    }
  }, [formData, id, currentUser]);

  return (
    <Box sx={{ margin: 'auto auto' }}>
      <CircularProgress />
    </Box>
  );
};
