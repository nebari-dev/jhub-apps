import AddIcon from '@mui/icons-material/AddRounded';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

import {
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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
  currentServerStatuses as defaultServerStatuses,
  currentSortValue as defaultSortValue,
  currentUser as defaultUser,
} from '../../../store';
import { Item } from '../../../styles/styled-item';
import { AppFilters } from './app-filters/app-filters';
import { AppGrid } from './app-grid/app-grid';
import { AppTable } from './app-table/app-table';

export const AppsSection = (): React.ReactElement => {
  const [apps, setApps] = useState<JhApp[]>([]);
  const [, setAppStatus] = useState('');
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [focused, setFocused] = useState(false);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );

  const [isGridViewActive, setIsGridViewActive] = useState<boolean>(true);
  const [, setCurrentSearchValue] = useRecoilState<string>(currentSearchValue);
  const [currentFrameworks] = useRecoilState<string[]>(defaultFrameworks);
  const [currentOwnershipValue] = useRecoilState<string>(defaultOwnershipValue);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [currentSortValue] = useRecoilState<string>(defaultSortValue);
  const [currentServerStatuses] = useRecoilState<string[]>(
    defaultServerStatuses,
  );
  const toggleView = () => setIsGridViewActive((prev) => !prev); // Added toggleView function

  const {
    isLoading,
    error,
    data: serverData,
  } = useQuery<UserState, { message: string }>({
    queryKey: ['app-state'],
    queryFn: () =>
      axios
        .get('/server/')
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
          currentServerStatuses,
        ),
      );
    }
  };

  useEffect(() => {
    const serverStatus = apps.map((app) => app.status);
    if (serverStatus) {
      setAppStatus(serverStatus.join(', ')); // Convert the array of strings to a single string
    }
  }, [apps, setNotification, setAppStatus]);

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
    <>
      <Box>
        <Stack>
          <Item>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4} sx={{ padding: '0' }}>
                <Item>
                  <Typography component="h2" variant="h6">
                    App Library
                  </Typography>
                </Item>
              </Grid>
              <Grid
                alignItems="center"
                container
                item
                xs={12}
                md={8}
                direction="row"
                sx={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                <Item>
                  <TextField
                    id="search"
                    size="small"
                    placeholder="Search Apps..."
                    aria-label="Search for an app"
                    onChange={handleSearch}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    sx={{
                      my: '0',
                      width: { sm: '200px', md: '300px', lg: '600px' },
                      mr: '16px',
                      color: 'rgba(15, 16, 21, 0.56)',
                      backgroundColor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(15, 16, 21, 0.12)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(15, 16, 21, 0.56)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ba18da',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {!focused && (
                            <SearchIcon
                              style={{ fill: 'rgba(15, 16, 21, 0.56)' }}
                            />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Item>
                <Item>
                  <Button
                    id="create-app"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      window.location.href = `${API_BASE_URL}/create-app`;
                    }}
                  >
                    Deploy App
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
                isGridViewActive={isGridViewActive}
                toggleView={toggleView} // Added toggleView function
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
                gap: 2,
                rowGap: 2,
                justifyContent: 'flex-start',
                paddingBottom: '48px',
              }}
            >
              {isLoading ? (
                <div className="font-bold">Loading...</div>
              ) : apps.length > 0 ? (
                isGridViewActive ? (
                  <AppGrid apps={apps} />
                ) : (
                  <AppTable apps={apps} />
                )
              ) : (
                <div>No apps available</div>
              )}
            </Box>
          </Item>
        </Stack>
      </Box>
    </>
  );
};
