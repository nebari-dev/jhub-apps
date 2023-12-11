import { AppDelete } from '@src/types/app';
import axios from '@src/utils/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { AppForm } from '..';
import Button from '../button/button';
import ContextMenu, { ContextMenuItem } from '../context-menu/context-menu';
import Modal from '../modal/modal';
import Tag from '../tag/tag';

interface AppCardProps {
  id: string;
  title: string;
  description?: string;
  framework: string;
  thumbnail?: string;
  url: string;
  ready: boolean;
}

export const AppCard = ({
  id,
  title,
  description,
  thumbnail,
  framework,
  url,
  ready = false,
}: AppCardProps): React.ReactElement => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleStart = () => {
    window.location.assign(url);
  };

  const handleStop = () => {
    console.log(`Stopping app with id: ${id}`);
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDeletePrompt = () => {
    setIsDeleteOpen(true);
  };

  const deleteProjectRequest = async ({ id }: AppDelete) => {
    const response = await axios.delete(`/server/${id}`);
    return response;
  };

  const { mutate: deleteProjectQuery } = useMutation({
    mutationFn: deleteProjectRequest,
    retry: 1,
  });

  const handleDelete = () => {
    deleteProjectQuery(
      { id },
      {
        onSuccess: async () => {
          setIsDeleteOpen(false);
          queryClient.invalidateQueries(['app-state']);
        },
      },
    );
  };

  const handleUpdate = () => {
    // window.location.assign('/services/japps');
    console.log(`Editing app with id: ${id}`);
    setIsEditOpen(false);
  };

  const menuItems: ContextMenuItem[] = [
    {
      id: 'start',
      title: 'Start',
      onClick: () => handleStart(),
      disabled: ready,
    },
    {
      id: 'stop',
      title: 'Stop',
      onClick: () => handleStop(),
      disabled: !ready,
    },
    {
      id: 'edit',
      title: 'Edit',
      onClick: () => handleEdit(),
    },
    {
      id: 'delete',
      title: 'Delete',
      onClick: () => handleDeletePrompt(),
    },
  ];

  const deleteModalBody = (
    <p className="w-[400px]">
      Are you sure you want to delete <b>{title}</b>? This action is permanent
      and cannot be reversed.
    </p>
  );

  const deleteModalFooter = (
    <div className="modal-btn-group">
      <Button
        id="cancel-btn"
        variant="secondary"
        onClick={() => setIsDeleteOpen(false)}
      >
        Cancel
      </Button>
      <Button id="delete-btn" variant="primary" onClick={() => handleDelete()}>
        Delete
      </Button>
    </div>
  );

  const editModalFooter = (
    <div className="modal-btn-group">
      <Button
        id="cancel-btn"
        variant="secondary"
        onClick={() => setIsEditOpen(false)}
      >
        Cancel
      </Button>
      <Button id="save-btn" variant="primary" onClick={handleUpdate}>
        Save
      </Button>
    </div>
  );

  return (
    <div className="card" id={`card-${id}`} tabIndex={0}>
      <div className="card-header-media">
        <div className="card-header-menu">
          <ContextMenu id={`card-menu-${id}`} items={menuItems} />
          {isDeleteOpen && (
            <Modal
              title={`Delete ${title}`}
              setIsOpen={setIsDeleteOpen}
              body={deleteModalBody}
              footer={deleteModalFooter}
            />
          )}
          {isEditOpen && (
            <Modal
              title={`Edit ${title}`}
              setIsOpen={setIsEditOpen}
              body={<AppForm id={id} />}
              footer={editModalFooter}
            />
          )}
        </div>
        <div className="card-header-img">
          {thumbnail ? <img src={thumbnail} alt="App thumb" /> : undefined}
        </div>
      </div>
      <div className="card-header">
        <h3 className="font-bold">
          <a href={url}>{title}</a>
        </h3>
      </div>
      <div className="card-body">
        <p className="text-sm">{description}</p>
      </div>
      <div className="card-footer">
        <Tag id={`tag-${id}`}>{framework}</Tag>
      </div>
    </div>
  );
};

export default AppCard;
