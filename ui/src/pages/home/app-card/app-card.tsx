import { AppQueryDeleteProps, AppQueryPostProps } from '@src/types/api';
import axios from '@src/utils/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { ButtonGroup } from '../../../components';
import Button from '../../../components/button/button';
import ContextMenu, {
  ContextMenuItem,
} from '../../../components/context-menu/context-menu';
import Modal from '../../../components/modal/modal';
import Tag from '../../../components/tag/tag';
import { currentNotification } from '../../../store';
import AppForm from '../app-form/app-form';

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
  const [isEditOpen, setIsEditOpen] = useState(false);

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
          queryClient.invalidateQueries(['app-state']);
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
          queryClient.invalidateQueries(['app-state']);
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
          queryClient.invalidateQueries(['app-state']);
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
      onClick: () => setIsEditOpen(true),
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
      <p className="w-[400px] mb-6">
        Are you sure you want to start <b>{title}</b>?
      </p>
      <ButtonGroup>
        <Button
          id="cancel-btn"
          variant="secondary"
          onClick={() => setIsStartOpen(false)}
        >
          Cancel
        </Button>
        <Button
          id="start-btn"
          variant="primary"
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
      <p className="w-[400px] mb-6">
        Are you sure you want to stop <b>{title}</b>?
      </p>
      <ButtonGroup>
        <Button
          id="cancel-btn"
          variant="secondary"
          onClick={() => setIsStopOpen(false)}
        >
          Cancel
        </Button>
        <Button
          id="stop-btn"
          variant="primary"
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
      <p className="w-[400px] mb-6">
        Are you sure you want to delete <b>{title}</b>? This action is permanent
        and cannot be reversed.
      </p>
      <ButtonGroup>
        <Button
          id="cancel-btn"
          variant="secondary"
          onClick={() => setIsDeleteOpen(false)}
        >
          Cancel
        </Button>
        <Button
          id="delete-btn"
          variant="primary"
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
            <Modal
              title={`Start ${title}`}
              setIsOpen={setIsStartOpen}
              body={startModalBody}
            />
          )}
          {isStopOpen && (
            <Modal
              title={`Stop ${title}`}
              setIsOpen={setIsStopOpen}
              body={stopModalBody}
            />
          )}
          {isDeleteOpen && (
            <Modal
              title={`Delete ${title}`}
              setIsOpen={setIsDeleteOpen}
              body={deleteModalBody}
            />
          )}
          {isEditOpen && (
            <Modal
              title={`Edit ${title}`}
              setIsOpen={setIsEditOpen}
              body={
                <AppForm
                  id={id}
                  onCancel={() => setIsEditOpen(false)}
                  onSubmit={() => setIsEditOpen(false)}
                />
              }
            />
          )}
        </div>
        <div className="card-header-img flex flex-row">
          {thumbnail ? <img src={thumbnail} alt="App thumb" /> : <></>}
        </div>
      </div>
      <div className="card-header">
        <h3 className="font-bold">
          <a href={url}>{title}</a>
        </h3>
      </div>
      <div className="card-body">
        <p className="text-sm pb-2">{description}</p>
        {username ? (
          <div className="text-sm">
            <span className="font-bold">Author: </span>
            {username}
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="card-footer">
        <Tag id={`tag-${id}`}>{framework}</Tag>
        {isPublic ? (
          <Tag id={`tag-${id}`} className="ml-2 bg-warning-light">
            Public
          </Tag>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default AppCard;
