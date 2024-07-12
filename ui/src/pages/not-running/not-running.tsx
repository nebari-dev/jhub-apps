import { Box, CircularProgress } from '@mui/material';
import { AppQueryGetProps } from '@src/types/api';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { APP_BASE_URL } from '@src/utils/constants';
import { getSpawnPendingUrl, storeAppToStart } from '@src/utils/jupyterhub';
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
      axios.get(`/server/${id}`).then((response) => {
        return response.data;
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

    if (formData?.started) {
      window.location.assign(window.location.href.replace('/hub', ''));
    } else if (formData?.pending && currentUser && id) {
      window.location.assign(getSpawnPendingUrl(currentUser, id));
    } else if (formData?.stopped && id) {
      storeAppToStart(id); // TODO: Update this to store in global state when everything is running in single react app
      window.location.assign(APP_BASE_URL);
    } else {
      window.location.assign(APP_BASE_URL);
    }
  }, [formData, id, currentUser]);

  return (
    <Box sx={{ margin: 'auto auto' }}>
      <CircularProgress />
    </Box>
  );
};
