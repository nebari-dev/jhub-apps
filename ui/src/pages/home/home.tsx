
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error'; 
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

interface ErrorResponse {
  status: number;
  data: {
    detail?: string;
  };
}

interface CustomError extends Error {
  response?: ErrorResponse;
}

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

const CustomErrorIcon = () => (
  <SvgIcon
    sx={{
      backgroundColor: 'red',
      color: 'white',
      borderRadius: '50%',
      padding: '2px',
    }}
  >
    <ErrorIcon />
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
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleRequestError = (error: CustomError) => {
    setSnackbarSeverity('error');
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) {
        // setSnackbarMessage(`Bad Request: ${data.detail}`);
        setSnackbarMessage('Bad Request');
      } else if (status === 403) {
        setSnackbarMessage('Access denied. You don\'t have permission to perform this action.');
      } else if (status === 404) {
        setSnackbarMessage(`Resource not found: ${data.detail}`);
      } else if (status === 500) {
        setSnackbarMessage('Internal server error. Please try again later.');
      } else {
        setSnackbarMessage(data.detail || 'An unexpected error occurred.');
      }
    } else {
      setSnackbarMessage('An unexpected error occurred. Please check your connection.');
    }
    setSnackbarOpen(true);
    setNotification(error.message);
  };

  const handleStartRequest = async ({ id }: AppQueryPostProps) => {
    const response = await axios.post(`/server/${id}`);
    
    return response;
  };
   
   
   
  // const handleStartRequest = async ({ id }: AppQueryPostProps) => {
  //   throw {
  //     response: {
  //       status: 500,
  //       data: { detail: 'Internal server error' },
  //     },
  //   };
  // };

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

  const { mutate: startQuery } = useMutation({
    mutationFn: handleStartRequest,
    retry: 1,
    onError: handleRequestError, 
  });

  const { mutate: deleteQuery } = useMutation({
    mutationFn: handleDeleteRequest,
    retry: 1,
    onError: handleRequestError, 
  });

  const handleStart = async () => {
    const appId = currentApp?.id || '';
    setSubmitting(true);
    
    startQuery(
      { id: appId },
      {
        onSuccess: async () => {
    
  
          setSubmitting(false);
          setSnackbarSeverity('success');
          setSnackbarMessage('App started successfully');
          setSnackbarOpen(true);
          setIsStartOpen(false); // Close the modal
          setIsStartNotRunningOpen(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
        },
        onError: (error) => {
          //eslint-disable-next-line
          console.log('Start Query Error:', error); // Log the error response
  
          setSubmitting(false);
          setIsStartOpen(false); // Close the modal on error as well
          handleRequestError(error);
        },
      },
    );
  };
  
  

  const handleDelete = () => {
    const appId = currentApp?.id || '';
    setSubmitting(true);
    deleteQuery(
      { id: appId, remove: true },
      {
        onSuccess: async () => {
          setSubmitting(false);
          setSnackbarSeverity('success');
          setSnackbarMessage('App deleted successfully');
          setSnackbarOpen(true);
          setIsDeleteOpen(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
        },
        onError: (error: CustomError) => {
          setSubmitting(false);
          handleRequestError(error); // Handle errors using the common function
        },
      },
    );
  };
  

  const handleStop = async () => {
    const appId = currentApp?.id || '';
    setSubmitting(true);
    deleteQuery(
      { id: appId, remove: false },
      {
        onSuccess: () => {
          setSubmitting(false);
          setSnackbarSeverity('success');
          setSnackbarMessage('Server stopped successfully');
          setSnackbarOpen(true);
          setIsStopOpen(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
        },
        onError: (error: CustomError) => {
          setSubmitting(false);
          handleRequestError(error); // Handle errors using the common function
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
        data-testid="snackbar-id"
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '90px !important',
        }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity} // Error severity set here
          icon={
            snackbarSeverity === 'success' ? (
              <CustomCheckIcon />
            ) : (
              <CustomErrorIcon />
            )
          }
          sx={{
            width: '100%',
            backgroundColor:
              snackbarSeverity === 'success' ? 'success.main' : 'error-light',
            color:
              snackbarSeverity === 'success'
                ? 'rgba(30, 70, 32, 1)'
                : 'error.dark)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

