import AddIcon from '@mui/icons-material/AddRounded';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
} from '@mui/material';
import { ButtonGroup } from '@src/components';
import { AppQueryDeleteProps, AppQueryPostProps } from '@src/types/api';
import { JhApp } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { API_BASE_URL } from '@src/utils/constants';
import {
  filterAndSortApps,
  getAppStatus,
  getApps,
} from '@src/utils/jupyterhub';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SetStateAction, SyntheticEvent, useEffect, useState } from 'react';
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
import { AppTable } from './app-table/app-table';

// interface AppsSectionProps {
//   apps: JhApp[];
//   onStartOpen: (app: SetStateAction<null>) => void;
//   onStopOpen: (app: SetStateAction<null>) => void;
//   onDeleteOpen: (app: null) => void;
// }

export const AppsSection = () // {
// apps,
// onStartOpen,
// onStopOpen,
// onDeleteOpen,
// }:
: React.ReactElement => {
  const [apps, setApps] = useState<JhApp[]>([]);
  const [, setAppStatus] = useState('');
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [currentApp, setCurrentApp] = useState<JhApp | null>(null);
  // const [updatedApps, setUpdatedApps] = useState<JhApp[]>(apps); // Added updatedApps state
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isStopOpen, setIsStopOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
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

  const toggleView = () => setIsGridViewActive((prev) => !prev); // Added toggleView function

  useEffect(() => {
    const serverStatus = apps ? apps.map((app) => app.status) : [];
    console.log('APPSa', apps);
    if (!serverStatus) {
      setNotification('Server status id undefined.');
    } else {
      setAppStatus(serverStatus.join(', ')); // Convert the array of strings to a single string
    }
  }, [apps, setNotification, setAppStatus]);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const serverStatus = apps ? apps.map((app) => app.status) : []; // Declare serverStatus variable

  useEffect(() => {
    if (!serverStatus) {
      setNotification('Server status id undefined.');
    } else {
      setAppStatus(serverStatus.join(', ')); // Convert the array of strings to a single string
    }
  }, [serverStatus, setNotification]);

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

  const handleStartRequst = async ({ id }: AppQueryPostProps) => {
    try {
      const response = await axios.post(`/server/${id}`);
      updateStatusAfterOperation(id, 'Running'); // Fix: Pass the id and the new status as arguments
      return response;
    } catch (error) {
      console.error('There was an error!', error);
      setNotification((error as Error).toString());
      setAppStatus('Error'); // Set status back to Ready if there's an error
    }
  };

  const handleDeleteRequst = async ({ id, remove }: AppQueryDeleteProps) => {
    try {
      const response = await axios.delete(`/server/${id}`, {
        params: {
          remove,
        },
      });
      if (remove) {
        updateStatusAfterOperation(id, 'Deleted'); // Handle based on your logic
      } else {
        updateStatusAfterOperation(id, 'Ready'); // Assume or handle based on response
      }
      return response;
    } catch (error) {
      console.error('There was an error!', error);
      setNotification((error as Error).toString());
      setAppStatus('Error'); // Reflect an error state
    }
  };

  const handleStopRequst = async (id: string) => {
    try {
      const response = await axios.post(`/server/${id}/stop`);
      updateStatusAfterOperation(id, 'Ready'); // Set status to Ready after stopping
      return response;
    } catch (error) {
      console.error('There was an error!', error);
      setNotification((error as Error).toString());
      setAppStatus('Error'); // Reflect an error state
    }
  };

  // Handle status update after operations
  const updateStatusAfterOperation = (id: string, newStatus: string) => {
    setUpdatedApps((prevApps) =>
      prevApps.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app,
      ),
    );
  };
  // Mutations
  const { mutate: startQuery } = useMutation({
    mutationFn: handleStartRequst,
    retry: 1,
  });

  const { mutate: deleteQuery } = useMutation({
    mutationFn: handleDeleteRequst,
    retry: 1,
  });

  const { mutate: stopQuery } = useMutation({
    mutationFn: handleStopRequst,
    retry: 1,
  });

  const handleDelete = (id: string) => {
    setSubmitting(true);
    deleteQuery(
      { id, remove: true },
      {
        onSuccess: async () => {
          setSubmitting(false);
          setIsDeleteOpen(false);
          // Invalidate the 'app-state' query to refetch the apps
          queryClient.invalidateQueries({ queryKey: ['app-state'] });

          // Fetch the apps again
          const apps = await queryClient.getQueryData<JhApp[]>(['app-state']);

          // Check if the deleted app still exists in the list
          if (apps && !apps.find((app) => app.id === id)) {
            console.log(`App with ID: ${id} has been successfully deleted.`);
          } else {
            console.log(`Failed to delete app with ID: ${id}.`);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: async (error: any) => {
          setSubmitting(false);
          setNotification(error.message);
        },
      },
    );
  };

  const handleStart = async (id?: string) => {
    const appId = id || currentApp?.id;
    if (!appId) return;
    try {
      setSubmitting(true);
      await startQuery(
        { id: appId },
        {
          onSuccess: async () => {
            setIsStartOpen(false);
            queryClient.invalidateQueries({ queryKey: ['app-state'] });
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (error: any) => {
            setNotification(error.message);
          },
        },
      );
    } catch (error: unknown) {
      console.error('Error in handleStart', error);
      setNotification((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStop = async (id?: string) => {
    const appId = id || currentApp?.id;
    if (!appId) return;
    setSubmitting(true);
    try {
      stopQuery(appId, {
        onSuccess: () => {
          // Update the status of the app to 'Ready' when the stop operation is successful
          updateStatusAfterOperation(appId, 'Ready');
          setIsStopOpen(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
        },
        onError: (error: unknown) => {
          setNotification((error as Error).message);
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        setNotification(error.message);
      } else {
        console.error('An unknown error occurred', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartOpen = (app: SetStateAction<null>) => {
    setIsStartOpen(true);
    setCurrentApp(app);
  };

  const handleStopOpen = (app: SetStateAction<null>) => {
    setIsStopOpen(true);
    setCurrentApp(app);
  };

  const handleDeleteOpen = (app: SetStateAction<null>) => {
    setIsDeleteOpen(true);
    setCurrentApp(app);
  };

  const startModalBody = (
    <>
      <p className="card-dialog-body">
        Are you sure you want to start <b>{currentApp?.name}</b>?
      </p>
      <ButtonGroup>
        <Button
          id="cancel-btn"
          data-testid="cancel-btn"
          variant="text"
          color="secondary"
          onClick={() => setIsStartOpen(false)}
        >
          Cancel
        </Button>
        <Button
          id="start-btn"
          data-testid="start-btn"
          variant="contained"
          color="primary"
          onClick={() => handleStart(currentApp?.id || undefined)}
          disabled={submitting}
        >
          Start
        </Button>
      </ButtonGroup>
    </>
  );

  const stopModalBody = (
    <>
      <p className="card-dialog-body">
        Are you sure you want to stop <b>{currentApp?.name}</b>?
      </p>
      <ButtonGroup>
        <Button
          id="cancel-btn"
          variant="text"
          color="secondary"
          onClick={() => setIsStopOpen(false)}
        >
          Cancel
        </Button>
        <Button
          id="stop-btn"
          variant="contained"
          color="primary"
          onClick={() => handleStop(currentApp?.id || '')}
          disabled={submitting}
        >
          Stop
        </Button>
      </ButtonGroup>
    </>
  );

  const deleteModalBody = (
    <>
      <p className="card-dialog-body">
        Are you sure you want to delete <b>{currentApp?.name}</b>? This action
        is permanent and cannot be reversed.
      </p>
      <ButtonGroup>
        <Button
          id="cancel-btn"
          data-testid="cancel-btn"
          variant="text"
          color="secondary"
          onClick={() => setIsDeleteOpen(false)}
        >
          Cancel
        </Button>

        <Button
          id="delete-btn"
          data-testid="delete-btn"
          variant="contained"
          color="primary"
          onClick={() => handleDelete(currentApp?.id ?? '')}
          disabled={submitting}
        >
          Delete
        </Button>
      </ButtonGroup>
    </>
  );
  return (
    <>
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
                gap: '16px',
                justifyContent: 'flex-start',
                paddingBottom: '48px',
              }}
            >
              {isLoading ? (
                <div className="font-bold">Loading...</div>
              ) : apps.length > 0 ? (
                isGridViewActive ? (
                  <AppGrid
                    apps={apps}
                    onStartOpen={handleStartOpen}
                    onStopOpen={handleStopOpen}
                    onDeleteOpen={handleDeleteOpen}
                  />
                ) : (
                  <AppTable
                    apps={apps}
                    onStartOpen={handleStartOpen}
                    onStopOpen={handleStopOpen}
                    onDeleteOpen={handleDeleteOpen}
                  />
                )
              ) : (
                <div>No apps available</div>
              )}
            </Box>
          </Item>
        </Stack>
      </Box>
      {isStartOpen && (
        <Dialog
          open={isStartOpen}
          onClose={() => setIsStartOpen(false)}
          data-testid="StartModal"
        >
          <DialogTitle>Start {currentApp?.name}</DialogTitle>
          <DialogContent>{startModalBody}</DialogContent>
        </Dialog>
      )}
      {isStopOpen && (
        <Dialog
          open={isStopOpen}
          onClose={() => setIsStopOpen(false)}
          data-testid="StopModal"
        >
          <DialogTitle>Stop {currentApp?.name}</DialogTitle>
          <DialogContent>{stopModalBody}</DialogContent>
        </Dialog>
      )}
      {isDeleteOpen && (
        <Dialog
          open={isDeleteOpen}
          onClose={setIsDeleteOpen}
          data-testid="DeleteModal"
        >
          <DialogTitle>Delete {currentApp?.name}</DialogTitle>
          <DialogContent>{deleteModalBody}</DialogContent>
        </Dialog>
      )}
    </>
  );
};
