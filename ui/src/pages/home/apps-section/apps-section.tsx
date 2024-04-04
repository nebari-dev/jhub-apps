import AddIcon from '@mui/icons-material/AddRounded';
import { Box, Button, Divider, Grid, Stack, TextField } from '@mui/material';
import { JhApp } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { API_BASE_URL } from '@src/utils/constants';
import {
  filterAndSortApps,
  getAppStatus,
  getApps,
} from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentNotification,
  currentSearchValue,
  currentFrameworks as defaultFrameworks,
  currentOwnershipValue as defaultOwnershipValue,
  currentSortValue as defaultSortValue,
  currentUser as defaultUser,
} from '../../../store';
import { Item } from '../../../styles/styled-item';
import { AppFilters } from './app-filters/app-filters';
import { AppGrid } from './app-grid/app-grid';

export const AppsSection = (): React.ReactElement => {
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [, setCurrentSearchValue] = useRecoilState<string>(currentSearchValue);
  const [currentFrameworks] = useRecoilState<string[]>(defaultFrameworks);
  const [currentOwnershipValue] = useRecoilState<string>(defaultOwnershipValue);
  const [currentSortValue] = useRecoilState<string>(defaultSortValue);
  const [apps, setApps] = useState<JhApp[]>([]);

  const {
    isLoading,
    error,
    data: serverData,
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

  const handleSearch = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    setCurrentSearchValue(target.value);
    if (serverData && currentUser) {
      setApps(
        filterAndSortApps(
          serverData,
          currentUser,
          target.value,
          currentOwnershipValue,
          currentFrameworks,
          currentSortValue,
        ),
      );
    }
  };

  useEffect(() => {
    if (!isLoading && serverData) {
      const appsWithStatus = getApps(serverData, 'all', currentUser?.name ?? '')
        .map((app) => ({
          ...app,
          status: getAppStatus(app), // Compute and assign the status here
        }))
        .sort((a, b) => {
          return a.last_activity > b.last_activity ? -1 : 1;
        });
      setApps(appsWithStatus);
    }
  }, [isLoading, serverData, currentUser]);

  useEffect(() => {
    if (error) {
      setCurrentNotification(error.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [error, setCurrentNotification]);

  return (
    <Box>
      <Stack>
        <Item>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Item>
                <h2>Apps</h2>
              </Item>
            </Grid>
            <Grid
              container
              item
              xs={8}
              md={8}
              direction="row"
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                flexWrap: 'nowrap',
              }}
            >
              <Item>
                <TextField
                  id="search"
                  size="small"
                  placeholder="Search..."
                  aria-label="Search for an app"
                  onChange={handleSearch}
                  sx={{
                    width: { sm: '200px', md: '300px', lg: '600px' },
                    pr: '16px',
                  }}
                />
              </Item>
              <Item>
                <Button
                  id="create-app"
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    window.location.href = `${API_BASE_URL}/create-app`;
                  }}
                >
                  Create App
                </Button>
              </Item>
            </Grid>
          </Grid>
        </Item>
        <Item sx={{ pt: '16px', pb: '24px' }}>
          <Divider />
        </Item>
        <Item>
          {serverData && currentUser ? (
            <AppFilters
              data={serverData}
              currentUser={currentUser}
              setApps={setApps}
            />
          ) : (
            <></>
          )}
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
            {isLoading ? (
              <div className="font-bold">Loading...</div>
            ) : apps.length > 0 ? (
              <AppGrid apps={apps} />
            ) : (
              <div>No apps available</div>
            )}
          </Box>
        </Item>
      </Stack>
    </Box>
  );
};
