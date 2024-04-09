import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { ButtonGroup, StatusChip } from '@src/components';
import { AppQueryDeleteProps, AppQueryPostProps } from '@src/types/api';
import { JhApp } from '@src/types/jupyterhub';
import axios from '@src/utils/axios';
import { API_BASE_URL } from '@src/utils/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentNotification } from '../../../../store';
import './app-table.css';

// Define the props for AppTable
interface AppTableProps {
  apps: JhApp[];
}

export const AppTable = ({ apps }: AppTableProps): React.ReactElement => {
  const [, setAppStatus] = useState('');
  const [currentApp, setCurrentApp] = useState<JhApp | null>(null);
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isStopOpen, setIsStopOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [updatedApps, setUpdatedApps] = useState<JhApp[]>(apps);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const serverStatus = apps.map((app) => app.status);
  useEffect(() => {
    if (!serverStatus) {
      setNotification('Server status id undefined.');
    } else {
      setAppStatus(serverStatus.join(', ')); // Convert the array of strings to a single string
    }
  }, [serverStatus, setNotification]);

  useEffect(() => {
    setUpdatedApps(apps);
  }, [apps]);

  const rows = updatedApps.map((app) => ({
    id: app.id, // DataGrid requires each row to have a unique 'id' property
    name: app.name,
    username: app.username,
    framework: app.framework,
    status: app.status,
    public: app.public,
    shared: app.shared,
  }));

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      sortable: false,
      width: 234,
      editable: false,
      renderCell: (params: GridRenderCellParams<JhApp>) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getIcon(params.row.public, params.row.shared)}
            <span className="inline relative icon-text">{params.value}</span>
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: false,
      width: 206,
      editable: false, // Status might not be directly editable
      renderCell: (params: GridRenderCellParams) => (
        <StatusChip status={params.value} />
      ),
    },
    {
      field: 'username',
      headerName: 'Created by',
      width: 206,
      sortable: false,
      editable: false,
      renderCell: (params: GridCellParams) => {
        return <div className="truncate">{params.row.username}</div>;
      },
    },
    {
      field: 'framework',
      headerName: 'Tags',
      width: 206,
      sortable: false,
      editable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} variant="outlined" size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      display: 'flex',
      sortable: false,
      filterable: false,
      renderCell: (params: GridCellParams) => {
        return (
          <Box
            className="actions"
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '100%',
              paddingLeft: 0,
            }}
          >
            {params.row.status === 'Stopped' ||
            params.row.status === 'Ready' ? (
              <Button
                onClick={() => {
                  setIsStartOpen(true);
                  setCurrentApp(params.row);
                }}
                disabled={submitting}
                color="inherit"
                size="small"
                className="action-button"
                data-testid="PlayCircleRoundedIcon"
              >
                <PlayCircleRoundedIcon className="button-icon" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setIsStopOpen(true);
                  setCurrentApp(params.row);
                }}
                disabled={submitting}
                color="inherit"
                size="small"
                className="action-button"
                sx={{ fontSize: 'inherit' }}
                data-testid="StopCircleRoundedIcon"
              >
                <StopCircleRoundedIcon className="button-icon" />
              </Button>
            )}
            <Button
              onClick={() =>
                (window.location.href = `${API_BASE_URL}/edit-app?id=${params.id}`)
              }
              color="inherit"
              size="small"
              className="action-button"
              data-testid="EditRoundedIcon"
            >
              <EditRoundedIcon className="button-icon" />
            </Button>
            <Button
              onClick={() => {
                setIsDeleteOpen(true);
                setCurrentApp(params.row);
              }}
              disabled={submitting}
              color="inherit"
              size="small"
              className="action-button"
              data-testid="DeleteRoundedIcon"
            >
              <DeleteRoundedIcon className="button-icon" />
            </Button>
          </Box>
        );
      },
    },
  ];

  const getIcon = (isPublic: boolean, isShared: boolean) => {
    if (isPublic)
      return (
        <PublicRoundedIcon data-testid="PublicRoundedIcon" fontSize="small" />
      );
    if (isShared)
      return (
        <GroupRoundedIcon data-testid="GroupRoundedIcon" fontSize="small" />
      );
    return <LockRoundedIcon data-testid="LockRoundedIcon" fontSize="small" />;
  };
  const startRequest = async ({ id }: AppQueryPostProps) => {
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

  const deleteRequest = async ({ id, remove }: AppQueryDeleteProps) => {
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

  const stopRequest = async (id: string) => {
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

  const { mutate: startQuery } = useMutation({
    mutationFn: startRequest,
    retry: 1,
  });

  const { mutate: deleteQuery } = useMutation({
    mutationFn: deleteRequest,
    retry: 1,
  });

  const { mutate: stopQuery } = useMutation({
    mutationFn: stopRequest,
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
  // MODALs
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
          onClick={() => handleStart()}
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
          onClick={() => handleStop()}
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
      <Box sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection={false}
          disableColumnFilter // Disabling filtering across all columns
          hideFooter
          sx={{
            '& .MuiDataGrid-main': {
              height: '100vh',
            },
          }}
        />
      </Box>
      {isStartOpen && (
        <Dialog
          open={isStartOpen}
          onClose={setIsStartOpen}
          data-testid="StartModal"
        >
          <DialogTitle>Start {currentApp?.name}</DialogTitle>
          <DialogContent>{startModalBody}</DialogContent>
        </Dialog>
      )}
      {isStopOpen && (
        <Dialog
          open={isStopOpen}
          onClose={setIsStopOpen}
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
