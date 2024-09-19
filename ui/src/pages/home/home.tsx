import CheckIcon from '@mui/icons-material/Check';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Snackbar,
  SvgIcon,
  Typography,
} from '@mui/material';
import { ButtonGroup } from '@src/components';
import {
  AppQueryDeleteProps,
  AppQueryGetProps,
  AppQueryPostProps,
} from '@src/types/api';
import { JhApp } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import {
  clearAppToStart,
  getAppToStart,
  getSpawnUrl,
  isDefaultApp,
} from '@src/utils/jupyterhub';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import {
  currentNotification,
  currentApp as defaultApp,
  currentUser as defaultUser,
  isDeleteOpen as isDeleteOpenState,
  isStartNotRunningOpen as isStartNotRunningOpenState,
  isStartOpen as isStartOpenState,
  isStopOpen as isStopOpenState,
} from '../../../src/store';
import { Item } from '../../styles/styled-item';
import { AppsSection } from './apps-section/apps-section';
import './home.css';
import { ServicesSection } from './services-section/services-section';

const CustomCheckIcon = () => (
  <SvgIcon
    sx={{
      backgroundColor: 'green',
      color: 'white',
      borderRadius: '50%',
      padding: '2px',
    }}
  >
    <CheckIcon />
  </SvgIcon>
);


export const Home = (): React.ReactElement => {
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [currentApp, setCurrentApp] = useRecoilState<JhApp | undefined>(
    defaultApp,
  );
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [isStartOpen, setIsStartOpen] = useRecoilState(isStartOpenState);
  const [isStopOpen, setIsStopOpen] = useRecoilState(isStopOpenState);
  const [isDeleteOpen, setIsDeleteOpen] = useRecoilState(isDeleteOpenState);
  const [isStartNotRunningOpen, setIsStartNotRunningOpen] = useRecoilState(
    isStartNotRunningOpenState,
  );
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success'); // Set severity


  const handleStartRequest = async ({ id }: AppQueryPostProps) => {
    const response = await axios.post(`/server/${id}`);
    return response;
  };

  const handleDeleteRequest = async ({ id, remove }: AppQueryDeleteProps) => {
    const response = await axios.delete(`/server/${id}`, {
      params: {
        remove,
      },
    });
    return response;
  };

  const { data: currentAppData } = useQuery<
    AppQueryGetProps,
    { message: string }
  >({
    queryKey: ['app-form', currentAppId],
    queryFn: () =>
      axios.get(`/server/${currentAppId}`).then((response) => {
        return response.data;
      }),
    enabled: !!currentAppId,
  });

  // Fetch user data and check admin status
  const { data: currentUserData } = useQuery<UserState>({
    queryKey: ['current-user'],
    queryFn: () =>
      axios.get('/user').then((response) => {
        return response.data;
      }),
    enabled: true,
  });    

  // Mutations
  const { mutate: startQuery } = useMutation({
    mutationFn: handleStartRequest,
    retry: 1,
  });

  const { mutate: deleteQuery } = useMutation({
    mutationFn: handleDeleteRequest,
    retry: 1,
  });

  const handleDelete = () => {
    const appId = currentApp?.id || '';
    setSubmitting(true);
    deleteQuery(
      { id: appId, remove: true },
      {
        onSuccess: async () => {
          setSubmitting(false);
          setIsDeleteOpen(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
          setSnackbarMessage('App deleted successfully');
          setSnackbarOpen(true);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: async (error: any) => {
          setSubmitting(false);
          setNotification(error.message);
        },
      },
    );
  };

  // Type guard to check if error has a 'response' property
  const isErrorWithResponse = (error: unknown): error is { response: { status: number } } => {
    return typeof error === 'object' && error !== null && 'response' in error;
  };

  const handleStart = async () => {
    const appId = currentApp?.id || '';
    setSubmitting(true);
  
    // Close the modal immediately when the Start button is clicked
    setIsStartOpen(false);
    setIsStartNotRunningOpen(false);

    // Check if the app is shared and if the user has permissions
    const sharedApp = currentApp?.shared;
    if (sharedApp && !currentUserData?.admin) {
      setSubmitting(false);
      setSnackbarMessage('You don\'t have permission to start this app. Please ask the owner to start it.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    startQuery(
      { id: appId },
      {
        onSuccess: async () => {
          setSubmitting(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
          setSnackbarMessage('App started successfully');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        },
        onError: (error: unknown) => {
          setSubmitting(false);
  
          if (isErrorWithResponse(error)) {
            const status = error.response?.status;
            if (status === 403) {
              setSnackbarMessage('You don\'t have permission to start this app. Please ask the owner to start it.');
            } else if (status === 404) {
              setSnackbarMessage('App not found (404).');
            } else if (status === 500) {
              setSnackbarMessage('Internal server error (500).');
            } else {
              setSnackbarMessage('An unknown server error occurred.');
            }
          } else {
            setSnackbarMessage('An unknown error occurred.');
          }
  
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        },
      },
    );
  };

  const handleStop = async () => {
    const appId = currentApp?.id || '';
    setSubmitting(true);
  
    // Close the modal immediately when the Stop button is clicked
    setIsStopOpen(false);
  
    // Check if the app is shared and if the user has permissions
    const sharedApp = currentApp?.shared;
    if (sharedApp && !currentUserData?.admin) {
      setSubmitting(false);
      setSnackbarMessage('You don\'t have permission to stop this app. Please ask the owner to stop it.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
  
    deleteQuery(
      { id: appId, remove: false },
      {
        onSuccess: () => {
          setSubmitting(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
          setSnackbarMessage('Server stopped successfully');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        },
        onError: (error: unknown) => {
          setSubmitting(false);
          if (isErrorWithResponse(error)) {
            const status = error.response?.status;
            if (status === 403) {
              setSnackbarMessage('You don\'t have permission to stop this app. Please ask the owner to stop it.');
            } else if (status === 404) {
              setSnackbarMessage('App not found (404).');
            } else if (status === 500) {
              setSnackbarMessage('Internal server error (500).');
            } else {
              setSnackbarMessage('An unknown server error occurred.');
            }
          } else {
            setSnackbarMessage('An unknown error occurred.');
          }
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        },
      },
    );
  };
  
  

  const handleStartNotRunning = async () => {
    if (!currentUser || !currentApp) {
      setSubmitting(false);
      return;
    }

    window.location.assign(getSpawnUrl(currentUser, currentApp));
  };

  const startModalBody = (
    <>
      <div className="card-dialog-body-wrapper">
        <p className="card-dialog-body">
          Are you sure you want to start <b>{currentApp?.name}</b>?
        </p>
        <p className="card-dialog-note">
          This action starts a new server that consumes resources.
        </p>
      </div>
      <ButtonGroup className="card-dialog-button-group">
        <Button
          id="cancel-btn"
          data-testid="cancel-btn"
          variant="text"
          color="primary"
          onClick={() => setIsStartOpen(false)}
          sx={{ fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button
          id="start-btn"
          data-testid="start-btn"
          variant="contained"
          color="primary"
          onClick={handleStart}
          disabled={submitting}
        >
          Start
        </Button>
      </ButtonGroup>
    </>
  );

  const stopModalBody = (
    <>
      <div className="card-dialog-body-wrapper">
        <p className="card-dialog-body">
          Are you sure you want to stop <b>{currentApp?.name}</b>?
        </p>
      </div>
      <ButtonGroup className="card-dialog-button-group">
        <Button
          id="cancel-btn"
          variant="text"
          color="primary"
          onClick={() => setIsStopOpen(false)}
          sx={{ fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button
          id="stop-btn"
          variant="contained"
          color="primary"
          onClick={handleStop}
          disabled={submitting}
        >
          Stop
        </Button>
      </ButtonGroup>
    </>
  );

  const deleteModalBody = (
    <>
      <div className="card-dialog-body-wrapper">
        <p className="card-dialog-body">
          Are you sure you want to delete <b>{currentApp?.name}</b>?
        </p>
        <p className="card-dialog-note">
          This action is permanent and cannot be reversed.
        </p>
      </div>
      <ButtonGroup className="card-dialog-button-group">
        <Button
          id="cancel-btn"
          data-testid="cancel-btn"
          variant="text"
          color="primary"
          onClick={() => setIsDeleteOpen(false)}
          sx={{ fontWeight: 700 }}
        >
          Cancel
        </Button>

        <Button
          id="delete-btn"
          data-testid="delete-btn"
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={submitting}
        >
          Delete
        </Button>
      </ButtonGroup>
    </>
  );

  const startNotRunningModalBody = (
    <>
      <div className="card-dialog-body-wrapper">
        <p className="card-dialog-body">
          Would you like to start <b>{currentApp?.name}</b>?
        </p>
        <p className="card-dialog-note">
          This action starts a new server that consumes resources.
        </p>
      </div>
      <ButtonGroup className="card-dialog-button-group">
        <Button
          id="cancel-btn"
          data-testid="cancel-btn"
          variant="text"
          color="primary"
          onClick={() => {
            clearAppToStart();
            setIsStartNotRunningOpen(false);
          }}
          sx={{ fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button
          id="start-btn"
          data-testid="start-btn"
          variant="contained"
          color="primary"
          onClick={() => {
            clearAppToStart();
            if (isDefaultApp(currentApp?.name || '')) {
              handleStartNotRunning();
            } else {
              handleStart();
            }
          }}
          disabled={submitting}
        >
          Start
        </Button>
      </ButtonGroup>
    </>
  );

  useEffect(() => {
    if (currentAppData && !currentAppData.started && currentAppId) {
      let currentAppName = currentAppData.user_options.display_name;
      if (!currentAppName && currentAppId === 'lab') {
        currentAppName = 'JupyterLab';
      } else if (!currentAppName && currentAppId === 'vscode') {
        currentAppName = 'VSCode';
      }
      setCurrentApp({
        id: currentAppId,
        name: currentAppName,
        framework: currentAppData.user_options.framework,
        url: currentAppData.url,
        ready: currentAppData.ready,
        public: currentAppData.user_options.public,
        shared: false,
        last_activity: new Date(currentAppData.last_activity),
        status: 'Ready',
      });

      setIsStartNotRunningOpen(true);
      clearAppToStart();
    }
  }, [currentAppData, currentAppId, setIsStartNotRunningOpen, setCurrentApp]);

  useEffect(() => {
    const appId = getAppToStart();
    if (appId) {
      setCurrentAppId(appId);
    }
  }, [setCurrentAppId]);

  return (
    <Box sx={{ flexGrow: 1 }} className="container">
      <Grid container spacing={2} paddingBottom="24px">
        <Grid item xs={12} md={2}>
          <Item>
            <Typography component="h1" variant="h5">
              Home
            </Typography>
          </Item>
        </Grid>
      </Grid>
      <ServicesSection />
      <AppsSection />
      {isStartOpen && (
        <Dialog
          open={isStartOpen}
          onClose={() => setIsStartOpen(false)}
          data-testid="StartModal"
          sx={{ '.MuiPaper-root': { width: '444px' } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Start App</DialogTitle>
          <DialogContent sx={{ padding: '0px' }}>
            {startModalBody}
          </DialogContent>
        </Dialog>
      )}
      {isStopOpen && (
        <Dialog
          open={isStopOpen}
          onClose={() => setIsStopOpen(false)}
          data-testid="StopModal"
          sx={{ '.MuiPaper-root': { width: '444px' } }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Stop App</DialogTitle>
          <DialogContent sx={{ padding: '0px' }}>{stopModalBody}</DialogContent>
        </Dialog>
      )}
      {isDeleteOpen && (
        <Dialog
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          data-testid="DeleteModal"
          sx={{ '.MuiPaper-root': { width: '444px' } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Delete App</DialogTitle>
          <DialogContent sx={{ padding: '0px' }}>
            {deleteModalBody}
          </DialogContent>
        </Dialog>
      )}
      {isStartNotRunningOpen && (
        <Dialog
          open={isStartNotRunningOpen}
          onClose={() => setIsStartNotRunningOpen(false)}
          data-testid="StartNotRunningModal"
          sx={{ '.MuiPaper-root': { width: '444px' } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Server Not Running</DialogTitle>
          <DialogContent sx={{ padding: '0px' }}>
            {startNotRunningModalBody}
          </DialogContent>
        </Dialog>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '90px !important',
        }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          // Conditionally render either the success or error icon based on severity
          icon={snackbarSeverity === 'success' ? <CustomCheckIcon /> : <ErrorRoundedIcon />}
          sx={{
            width: '100%',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            // Use background and text color based on severity
            backgroundColor: snackbarSeverity === 'success' ? '#D1FAE5' : '#FEE2E2', // Light green for success, light red for error
            color: snackbarSeverity === 'success' ? '#065F46' : '#B91C1C', // Dark green for success, dark red for error
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
