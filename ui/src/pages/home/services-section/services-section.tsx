import { Box, Divider, Grid, Stack } from '@mui/material';
import { JhApp, JhServiceApp, JhServiceFull } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { getPinnedApps, getPinnedServices } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentNotification,
  currentUser as defaultUser,
} from '../../../store';
import { Item } from '../../../styles/styled-item';
import { ServiceGrid } from './service-grid/service-grid';

export const ServicesSection = (): React.ReactElement => {
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [services, setServices] = useState<JhServiceApp[]>([]);
  const [apps, setApps] = useState<JhApp[]>([]);

  const {
    isLoading: servicesLoading,
    error: servicesError,
    data: servicesData,
  } = useQuery<JhServiceFull[], { message: string }>({
    queryKey: ['service-data'],
    queryFn: () =>
      axios
        .get('/services/')
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
    enabled: !!currentUser,
  });

  const {
    isLoading: appsLoading,
    error: appsError,
    data: appsData,
  } = useQuery<UserState, { message: string }>({
    queryKey: ['app-state'],
    queryFn: () =>
      axios
        .get(`/server/`)
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (!servicesLoading && servicesData && currentUser) {
      setServices(() => getPinnedServices(servicesData, currentUser.name));
    }
  }, [servicesLoading, servicesData, currentUser]);

  useEffect(() => {
    if (!appsLoading && appsData && currentUser) {
      setApps(() => getPinnedApps(appsData, currentUser.name));
    }
  }, [appsLoading, appsData, currentUser]);

  useEffect(() => {
    if (servicesError) {
      setCurrentNotification(servicesError.message);
    } else if (appsError) {
      setCurrentNotification(appsError.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [servicesError, appsError, setCurrentNotification]);

  return (
    <Box>
      <Stack>
        <Item>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Item>
                <h2>Services</h2>
              </Item>
            </Grid>
          </Grid>
        </Item>
        <Item sx={{ pt: '16px', pb: '24px' }}>
          <Divider />
        </Item>
        <Item>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'flex-start',
              paddingBottom: '48px',
            }}
          >
            {servicesLoading || appsLoading ? (
              <div className="font-bold">Loading...</div>
            ) : services.length > 0 || apps.length > 0 ? (
              <ServiceGrid services={services} apps={apps} />
            ) : (
              <div>No services available</div>
            )}
          </Box>
        </Item>
      </Stack>
    </Box>
  );
};
