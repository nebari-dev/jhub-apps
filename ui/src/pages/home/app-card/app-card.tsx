import { AppQueryDeleteProps } from '@src/types/api';
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
  ready?: boolean;
  isPublic?: boolean;
}

export const AppCard = ({
  id,
  title,
  description,
  thumbnail,
  framework,
  url,
  isPublic = false,
}: AppCardProps): React.ReactElement => {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deleteRequest = async ({ id }: AppQueryDeleteProps) => {
    const response = await axios.delete(`/server/${id}`);
    return response;
  };

  const { mutate: deleteQuery } = useMutation({
    mutationFn: deleteRequest,
    retry: 1,
  });

  const handleDelete = () => {
    setSubmitting(true);
    deleteQuery(
      { id },
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

  const menuItems: ContextMenuItem[] = [
    {
      id: 'edit',
      title: 'Edit',
      onClick: () => setIsEditOpen(true),
      visible: true,
    },
    {
      id: 'delete',
      title: 'Delete',
      onClick: () => setIsDeleteOpen(true),
      visible: true,
    },
  ];

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
        {isPublic ? (
          <Tag id={`tag-${id}`} className="ml-2 bg-warning-light">
            Public
          </Tag>
        ) : undefined}
      </div>
    </div>
  );
};

export default AppCard;
