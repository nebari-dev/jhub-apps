import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import { Button } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { ButtonGroup } from '@src/components';
import { AppQueryDeleteProps, AppQueryPostProps } from '@src/types/api';
import axios from '@src/utils/axios';
import { API_BASE_URL } from '@src/utils/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentNotification } from '../../store';
import ContextMenu, { ContextMenuItem } from '../context-menu/context-menu';
import './app-card.css';
interface AppCardProps {
  id: string;
  title: string;
  description?: string;
  framework: string;
  thumbnail?: string;
  url: string;
  username?: string;
  ready?: boolean;
  isPublic?: boolean;
  isShared?: boolean;
  serverStatus: string;
  sx?: object;
  isAppCard?: boolean; // Use this to determine if it's an app or service
}

export const AppCard = ({
  id,
  title,
  description,
  framework,
  thumbnail,
  url,
  username,
  isPublic = false,
  isShared,
  serverStatus,
  isAppCard = true,
}: AppCardProps): React.ReactElement => {
  const [appStatus, setAppStatus] = useState('');
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isStopOpen, setIsStopOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (!serverStatus) {
      setNotification('Server status id undefined.');
    } else {
      setAppStatus(serverStatus);
    }
  }, [serverStatus, setNotification]);

  // Map status to color

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Ready':
        return {
          bgcolor: '#ffffff',
          border: '1px solid #2E7D32',
          color: '#2E7D32',
        };
      case 'Pending':
        return {
          bgcolor: '#EAB54E',
          color: 'white',
        };
      case 'Running':
        return {
          bgcolor: '#2E7D32',
          color: 'white',
        };
      case 'Unknown':
        return {
          bgcolor: '#BDBDBD',
          color: 'black',
        };
      default:
        return {
          bgcolor: '#F5F5F5',
          color: 'black',
        };
    }
  };

  const getIcon = () => {
    if (!isAppCard)
      return (
        <PushPinRoundedIcon
          sx={{ fontSize: '18px', position: 'relative', bottom: '2px' }}
          data-testid="PushPinRoundedIcon"
        />
      );
    if (isPublic)
      return (
        <PublicRoundedIcon
          sx={{ fontSize: '18px' }}
          data-testid="PublicRoundedIcon"
        />
      );
    if (isShared)
      return (
        <GroupRoundedIcon
          sx={{ fontSize: '18px' }}
          data-testid="GroupRoundedIcon"
        />
      );
    return (
      <LockRoundedIcon
        sx={{ fontSize: '18px' }}
        data-testid="LockRoundedIcon"
      />
    );
  };

  const startRequest = async ({ id }: AppQueryPostProps) => {
    try {
      const response = await axios.post(`/server/${id}`);
      updateStatusAfterOperation('Running');
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
        updateStatusAfterOperation('Deleted'); // Handle based on your logic
      } else {
        updateStatusAfterOperation('Ready'); // Assume or handle based on response
      }
      return response;
    } catch (error) {
      console.error('There was an error!', error);
      setNotification((error as Error).toString());
      setAppStatus('Error'); // Reflect an error state
    }
  };

  // Handle status update after operations
  const updateStatusAfterOperation = (newStatus: string) => {
    setAppStatus(newStatus);
  };

  const { mutate: startQuery } = useMutation({
    mutationFn: startRequest,
    retry: 1,
  });

  const { mutate: deleteQuery } = useMutation({
    mutationFn: deleteRequest,
    retry: 1,
  });

  const handleDelete = () => {
    setSubmitting(true);
    deleteQuery(
      { id, remove: true },
      {
        onSuccess: async () => {
          setSubmitting(false);
          setIsDeleteOpen(false);
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

  const handleStart = () => {
    setSubmitting(true);
    startQuery(
      { id },

      {
        onSuccess: () => {
          setSubmitting(false);
          setIsStartOpen(false);
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          setSubmitting(false);
          console.error(error.message);
        },
      },
    );
  };

  const handleStop = () => {
    setSubmitting(true);
    deleteQuery(
      { id, remove: false },
      {
        onSuccess: async () => {
          setSubmitting(false);
          setIsStopOpen(false);
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

  const menuItems: ContextMenuItem[] = [
    {
      id: 'start',
      title: 'Start',
      onClick: () => setIsStartOpen(true),
      visible: true,
      disabled: serverStatus !== 'Ready',
    },
    {
      id: 'stop',
      title: 'Stop',
      onClick: () => setIsStopOpen(true),
      visible: true,
      disabled: serverStatus !== 'Running' || isShared,
    },
    {
      id: 'edit',
      title: 'Edit',
      onClick: () =>
        (window.location.href = `${API_BASE_URL}/edit-app?id=${id}`),
      visible: true,
      disabled: isShared || id === '' || !isAppCard,
    },
    {
      id: 'delete',
      title: 'Delete',
      onClick: () => setIsDeleteOpen(true),
      visible: true,
      disabled: isShared || id === '' || !isAppCard,
    },
  ];

  const startModalBody = (
    <>
      <p className="card-dialog-body">
        Are you sure you want to start <b>{title}</b>?
      </p>
      <ButtonGroup>
        <Button
          id="cancel-btn"
          variant="text"
          color="secondary"
          onClick={() => setIsStartOpen(false)}
        >
          Cancel
        </Button>
        <Button
          id="start-btn"
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
        Are you sure you want to stop <b>{title}</b>?
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
        Are you sure you want to delete <b>{title}</b>? This action is permanent
        and cannot be reversed.
      </p>
      <ButtonGroup>
        <Button
          id="cancel-btn"
          variant="text"
          color="secondary"
          onClick={() => setIsDeleteOpen(false)}
        >
          Cancel
        </Button>
        <Button
          id="delete-btn"
          variant="contained"
          color="primary"
          onClick={() => handleDelete()}
          disabled={submitting}
        >
          Delete
        </Button>
      </ButtonGroup>
    </>
  );
  return (
    <div className="card" id={`card-${id}`} tabIndex={0}>
      <a href={url}>
        <Card id={`card-${id}`} tabIndex={0} className="Mui-card">
          <div
            className={`card-content-header ${isAppCard ? '' : 'card-content-header-service'}`}
          >
            {framework ? (
              <>
                <div className="chip-container">
                  <div className="menu-chip">
                    <Chip
                      label={appStatus}
                      aria-label="open menu"
                      id={id}
                      children={undefined}
                      size="small"
                      className="chip-chip"
                      sx={{
                        ...getStatusStyles(appStatus),
                        fontSize: '12px',
                        fontWeight: 600,
                        '& .MuiChip-label': {
                          color: getStatusStyles(appStatus).color,
                        },
                      }}
                    />
                  </div>
                </div>
                <ContextMenu id={`card-menu-${id}`} items={menuItems} />
                {isStartOpen && (
                  <Dialog open={isStartOpen} onClose={setIsStartOpen}>
                    <DialogTitle>Start {title}</DialogTitle>
                    <DialogContent>{startModalBody}</DialogContent>
                  </Dialog>
                )}
                {isStopOpen && (
                  <Dialog open={isStopOpen} onClose={setIsStopOpen}>
                    <DialogTitle>Stop {title}</DialogTitle>
                    <DialogContent>{stopModalBody}</DialogContent>
                  </Dialog>
                )}
                {isDeleteOpen && (
                  <Dialog open={isDeleteOpen} onClose={setIsDeleteOpen}>
                    <DialogTitle>Delete {title}</DialogTitle>
                    <DialogContent>{deleteModalBody}</DialogContent>
                  </Dialog>
                )}
              </>
            ) : (
              <></>
            )}
            <CardMedia>
              {thumbnail ? (
                <div
                  className={isAppCard ? 'img-overlay' : 'img-overlay-service'}
                >
                  <img src={thumbnail} alt="App thumb" />
                </div>
              ) : (
                <></>
              )}
            </CardMedia>
          </div>
          <div className="card-content-content">
            {framework && isAppCard ? (
              <div className="chip-container">
                <div className="menu-chip">
                  <Chip
                    color="default"
                    variant="outlined"
                    label={framework}
                    id={`chip-${id}`}
                    size="small"
                    sx={{ mb: '8px' }}
                  />
                </div>
              </div>
            ) : (
              <></>
            )}
            {isAppCard ? (
              <div
                className={`card-content-container ${!description ? 'no-hover' : ''}`}
              >
                <CardContent className="card-inner-content">
                  <span className="inline relative iconic">{getIcon()}</span>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    className="card-title"
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className={`card-author ${!description ? 'no-hover' : ''}`}
                    sx={{ mt: '5px' }}
                  >
                    Created by {username}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="card-description"
                  >
                    {description}
                  </Typography>
                </CardContent>
              </div>
            ) : (
              <div className="card-content-container app-service no-hover">
                <CardContent className="card-inner-content">
                  <span className="inline relative iconic">{getIcon()}</span>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    className="card-title"
                    sx={{ position: 'relative', bottom: '3px' }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="card-description-service"
                    sx={{ mt: '5px' }}
                  >
                    {description}
                  </Typography>
                </CardContent>
              </div>
            )}
          </div>
        </Card>
      </a>
    </div>
  );
};

export default AppCard;
