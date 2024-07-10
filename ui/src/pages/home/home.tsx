import CheckIcon from '@mui/icons-material/Check';
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
import { APP_BASE_URL } from '@src/utils/constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const action = searchParams.get('action');
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [currentApp, setCurrentApp] = useRecoilState<JhApp | undefined>(
    defaultApp,
  );
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
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
    queryKey: ['app-form', id],
    queryFn: () =>
      axios.get(`/server/${id}`).then((response) => {
        return response.data;
      }),
    enabled: !!id,
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

  const handleStart = async () => {
    const appId = currentApp?.id || '';
    setSubmitting(true);
    startQuery(
      { id: appId },
      {
        onSuccess: async () => {
          setIsStartOpen(false);
          setIsStartNotRunningOpen(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          setSubmitting(false);
          setNotification(error.message);
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
          setIsStopOpen(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
          setSnackbarMessage('Server stopped successfully');
          setSnackbarOpen(true);
        },
        onError: (error: unknown) => {
          setSubmitting(false);
          setNotification((error as Error).message);
        },
      },
    );
  };

  const handleStartNotRunning = async () => {
    // hub/spawn/jbouder@metrostar.com?next=%2Fhub%2Fuser%2Fjbouder%40metrostar.com%2Flab
    const username = currentUser?.name;
    let next = encodeURIComponent(`/hub/user/${username}/lab`);
    if (id === 'vscode') {
      next = next.replace('lab', 'vscode');
    }
    document.location.assign(`/hub/spawn/${username}?next=${next}`);
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
          onClick={() => document.location.assign(APP_BASE_URL)}
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
            if (id === 'lab' || id === 'vscode') {
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
    if (action === 'start-server' && id && currentAppData) {
      if (!currentAppData.started) {
        setIsStartNotRunningOpen(true);
        let currentAppName = currentAppData.name;
        if (!currentAppName && id === 'lab') {
          currentAppName = 'JupyterLab';
        } else if (!currentAppName && id === 'vscode') {
          currentAppName = 'VSCode';
        }

        setCurrentApp({
          id,
          name: currentAppName,
          framework: currentAppData.user_options.framework,
          url: currentAppData.url,
          ready: currentAppData.ready,
          public: currentAppData.user_options.public,
          shared: false,
          last_activity: new Date(currentAppData.last_activity),
          status: 'Ready',
        });
      }
    }
  }, [currentAppData, action, id, setIsStartNotRunningOpen, setCurrentApp]);

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
          severity="success"
          icon={<CustomCheckIcon />}
          sx={{
            width: '100%',
            backgroundColor: 'success.main',
            color: 'rgba(30, 70, 32, 1)',
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
