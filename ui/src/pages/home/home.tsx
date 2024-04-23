import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import { ButtonGroup } from '@src/components';
import { AppQueryDeleteProps, AppQueryPostProps } from '@src/types/api';
import { JhApp } from '@src/types/jupyterhub';
import axios from '@src/utils/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentNotification,
  currentApp as defaultApp,
  isDeleteOpen as isDeleteOpenState,
  isStartOpen as isStartOpenState,
  isStopOpen as isStopOpenState,
} from '../../../src/store';
import { Item } from '../../styles/styled-item';
import { AppsSection } from './apps-section/apps-section';
import { ServicesSection } from './services-section/services-section';

export const Home = (): React.ReactElement => {
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [currentApp] = useRecoilState<JhApp | undefined>(defaultApp);
  const [isStartOpen, setIsStartOpen] = useRecoilState(isStartOpenState);
  const [isStopOpen, setIsStopOpen] = useRecoilState(isStopOpenState);
  const [isDeleteOpen, setIsDeleteOpen] = useRecoilState(isDeleteOpenState);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleStartRequest = async ({ id }: AppQueryPostProps) => {
    try {
      const response = await axios.post(`/server/${id}`);
      return response;
    } catch (error) {
      console.error('There was an error!', error);
      setNotification((error as Error).toString());
    }
  };

  const handleDeleteRequest = async ({ id, remove }: AppQueryDeleteProps) => {
    try {
      const response = await axios.delete(`/server/${id}`, {
        params: {
          remove,
        },
      });
      return response;
    } catch (error) {
      console.error('There was an error!', error);
      setNotification((error as Error).toString());
    }
  };

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
          // Invalidate the 'app-state' query to refetch the apps
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
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

  const handleStop = async () => {
    const appId = currentApp?.id || '';
    setSubmitting(true);
    try {
      deleteQuery(
        { id: appId, remove: false },
        {
          onSuccess: () => {
            setIsStopOpen(false);
            queryClient.invalidateQueries({ queryKey: ['app-state'] });
          },
          onError: (error: unknown) => {
            setNotification((error as Error).message);
          },
        },
      );
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
          onClick={handleDelete}
          disabled={submitting}
        >
          Delete
        </Button>
      </ButtonGroup>
    </>
  );
  return (
    <Box sx={{ flexGrow: 1 }} className="container">
      <Grid container spacing={2} paddingBottom="32px">
        <Grid item xs={12} md={2}>
          <Item>
            <h1>Home</h1>
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
          onClose={() => setIsDeleteOpen(false)}
          data-testid="DeleteModal"
        >
          <DialogTitle>Delete {currentApp?.name}</DialogTitle>
          <DialogContent>{deleteModalBody}</DialogContent>
        </Dialog>
      )}
    </Box>
  );
};
