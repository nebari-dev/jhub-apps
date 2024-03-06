import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { AppQueryDeleteProps, AppQueryPostProps } from '@src/types/api';
import axios from '@src/utils/axios';
import { API_BASE_URL } from '@src/utils/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { ButtonGroup } from '../../../components';
import ContextMenu, {
  ContextMenuItem,
} from '../../../components/context-menu/context-menu';
import { currentNotification } from '../../../store';
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
}

export const AppCard = ({
  id,
  title,
  description,
  thumbnail,
  framework,
  url,
  username,
  ready = false,
  isPublic = false,
  isShared = false,
}: AppCardProps): React.ReactElement => {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isStopOpen, setIsStopOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const startRequest = async ({ id }: AppQueryPostProps) => {
    const response = await axios.post(`/server/${id}`);
    return response;
  };

  const deleteRequest = async ({ id, remove }: AppQueryDeleteProps) => {
    const response = await axios.delete(`/server/${id}`, {
      params: {
        remove,
      },
    });
    return response;
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
        onSuccess: async () => {
          setSubmitting(false);
          setIsStartOpen(false);
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
      disabled: ready,
    },
    {
      id: 'stop',
      title: 'Stop',
      onClick: () => setIsStopOpen(true),
      visible: true,
      disabled: !ready || isShared,
    },
    {
      id: 'edit',
      title: 'Edit',
      onClick: () =>
        (window.location.href = `${API_BASE_URL}/edit-app?id=${id}`),
      visible: true,
      disabled: isShared || id === '',
    },
    {
      id: 'delete',
      title: 'Delete',
      onClick: () => setIsDeleteOpen(true),
      visible: true,
      disabled: isShared || id === '',
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
          variant="outlined"
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
          variant="outlined"
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
          variant="outlined"
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
      <div className="card-header-media">
        <div className="card-header-menu">
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
        </div>
        <div className="card-header-img">
          {thumbnail ? <img src={thumbnail} alt="App thumb" /> : <></>}
        </div>
      </div>
      <div className="card-header">
        <h3 className="font-bold">
          <a href={url}>{title}</a>
        </h3>
      </div>
      <div className="card-body">
        <p>{description}</p>
        {username ? (
          <div>
            <span className="font-bold">Author: </span>
            {username}
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="card-footer">
        <Chip id={`tag-${id}`} label={framework} size="small" />
        {isPublic ? (
          <Chip id={`tag-${id}`} label="Public" color="warning" size="small" />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default AppCard;
