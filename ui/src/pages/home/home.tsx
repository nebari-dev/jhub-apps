import { ButtonGroup } from '@src/components';
import { Button } from '@src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog';
import type {
  AppQueryDeleteProps,
  AppQueryGetProps,
  AppQueryPostProps,
} from '@src/types/api';
import type { JhApp } from '@src/types/jupyterhub';
import type { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import {
  clearAppToStart,
  getAppToStart,
  getSpawnUrl,
  isDefaultApp,
} from '@src/utils/jupyterhub';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { toast } from 'sonner';
import {
  currentNotification,
  currentApp as defaultApp,
  currentUser as defaultUser,
  isDeleteOpen as isDeleteOpenState,
  isStartNotRunningOpen as isStartNotRunningOpenState,
  isStartOpen as isStartOpenState,
  isStopOpen as isStopOpenState,
} from '../../../src/store';
import { AppsSection } from './apps-section/apps-section';
import './home.css';
import { ServicesSection } from './services-section/services-section';

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

  const handleStartRequest = async ({ id, full_name }: AppQueryPostProps) => {
    const creatorName = full_name?.split('/')[0];
    const requestConfig = {
      method: 'post',
      url: `/server/${id}`,
      params: { owner: creatorName || '' },
    };

    const response = await axios(requestConfig);

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

  const { data: currentUserData } = useQuery<UserState>({
    queryKey: ['current-user'],
    queryFn: () =>
      axios.get('/user').then((response) => {
        return response.data;
      }),
    enabled: true,
  });

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
          toast.success('App deleted successfully');
        },
        onError: async (error: Error) => {
          setSubmitting(false);
          setNotification(error.message);
        },
      },
    );
  };

  const isErrorWithResponse = (
    error: unknown,
  ): error is { response: { status: number } } => {
    return typeof error === 'object' && error !== null && 'response' in error;
  };

  const messageFromStatus = (status: number | undefined, action: string) => {
    if (status === 403) {
      return `You don't have permission to ${action} this app. Please ask the owner to ${action} it.`;
    }
    if (status === 404) return 'App not found (404).';
    if (status === 500) return 'Internal server error (500).';
    return 'An unknown server error occurred.';
  };

  const handleStart = async () => {
    const appId = currentApp?.id || '';
    const fullName = currentApp?.full_name || '';
    setSubmitting(true);

    setIsStartOpen(false);
    setIsStartNotRunningOpen(false);

    const sharedApp = currentApp?.shared;
    if (sharedApp && !currentUserData?.admin) {
      setSubmitting(false);
      toast.error(
        "You don't have permission to start this app. Please ask the owner to start it.",
      );
      return;
    }

    startQuery(
      { id: appId, full_name: fullName },
      {
        onSuccess: async () => {
          setSubmitting(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
          toast.success('App started successfully');
        },
        onError: (error: unknown) => {
          setSubmitting(false);
          const status = isErrorWithResponse(error)
            ? error.response?.status
            : undefined;
          toast.error(messageFromStatus(status, 'start'));
        },
      },
    );
  };

  const handleStop = async () => {
    const appId = currentApp?.id || '';
    setSubmitting(true);

    setIsStopOpen(false);

    const sharedApp = currentApp?.shared;
    if (sharedApp && !currentUserData?.admin) {
      setSubmitting(false);
      toast.error(
        "You don't have permission to stop this app. Please ask the owner to stop it.",
      );
      return;
    }

    deleteQuery(
      { id: appId, remove: false },
      {
        onSuccess: () => {
          setSubmitting(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
          toast.success('Server stopped successfully');
        },
        onError: (error: unknown) => {
          setSubmitting(false);
          const status = isErrorWithResponse(error)
            ? error.response?.status
            : undefined;
          toast.error(messageFromStatus(status, 'stop'));
        },
      },
    );
  };

  const handleStartNotRunning = async () => {
    if (!currentUser || !currentApp) {
      setSubmitting(false);
      return;
    }

    if (isDefaultApp(currentApp.name)) {
      window.location.assign(getSpawnUrl(currentUser, currentApp));
      return;
    }

    const creatorName = currentApp.full_name?.split('/')[0];

    try {
      const response = await axios.post(`/server/${currentApp.id}`, {
        params: { owner: creatorName || '' },
      });

      if (response.status === 200) {
        toast.success('App started successfully');
      }
    } catch (error) {
      const status = isErrorWithResponse(error)
        ? error.response?.status
        : undefined;
      toast.error(messageFromStatus(status, 'start'));
    } finally {
      setSubmitting(false);
    }
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
          variant="ghost"
          onClick={() => setIsStartOpen(false)}
          className="font-bold"
        >
          Cancel
        </Button>
        <Button
          id="start-btn"
          data-testid="start-btn"
          variant="default"
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
          variant="ghost"
          onClick={() => setIsStopOpen(false)}
          className="font-bold"
        >
          Cancel
        </Button>
        <Button
          id="stop-btn"
          variant="default"
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
          variant="ghost"
          onClick={() => setIsDeleteOpen(false)}
          className="font-bold"
        >
          Cancel
        </Button>

        <Button
          id="delete-btn"
          data-testid="delete-btn"
          variant="destructive"
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
          variant="ghost"
          onClick={() => {
            clearAppToStart();
            setIsStartNotRunningOpen(false);
          }}
          className="font-bold"
        >
          Cancel
        </Button>
        <Button
          id="start-btn"
          data-testid="start-btn"
          variant="default"
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
    <div className="container">
      <div className="pb-6">
        <h1>Home</h1>
      </div>
      <ServicesSection />
      <AppsSection />
      <Dialog open={isStartOpen} onOpenChange={setIsStartOpen}>
        <DialogContent data-testid="StartModal" className="w-[444px] gap-0 p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="font-bold">Start App</DialogTitle>
          </DialogHeader>
          {startModalBody}
        </DialogContent>
      </Dialog>
      <Dialog open={isStopOpen} onOpenChange={setIsStopOpen}>
        <DialogContent data-testid="StopModal" className="w-[444px] gap-0 p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="font-bold">Stop App</DialogTitle>
          </DialogHeader>
          {stopModalBody}
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent
          data-testid="DeleteModal"
          className="w-[444px] gap-0 p-0"
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="font-bold">Delete App</DialogTitle>
          </DialogHeader>
          {deleteModalBody}
        </DialogContent>
      </Dialog>
      <Dialog
        open={isStartNotRunningOpen}
        onOpenChange={setIsStartNotRunningOpen}
      >
        <DialogContent
          data-testid="StartNotRunningModal"
          className="w-[444px] gap-0 p-0"
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="font-bold">Server Not Running</DialogTitle>
          </DialogHeader>
          {startNotRunningModalBody}
        </DialogContent>
      </Dialog>
    </div>
  );
};
