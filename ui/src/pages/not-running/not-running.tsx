import { Box, Stack, Typography } from '@mui/material';
import { AppQueryGetProps } from '@src/types/api';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { APP_BASE_URL } from '@src/utils/constants';
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
      setId(currentId ?? null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!formData) {
      return;
    }

    if (formData?.started) {
      window.location.assign(window.location.href.replace('/hub', ''));
    } else {
      window.location.assign(APP_BASE_URL);
    }
  }, [formData]);

  return (
    <Stack>
      <Box sx={{ margin: 'auto auto' }}>
        <Typography component="h1" variant="body1">
          Redirecting back to home...
        </Typography>
      </Box>
    </Stack>
  );
};
