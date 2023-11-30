import React, { useState } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const handleStart = () => {
    window.location.assign(url);
  };

  const handleStop = () => {
    console.log(`Stopping app with id: ${id}`);
  };

  const handleEdit = () => {
    window.location.assign(`/services/japps/create-app/?name=${id}`);
  };

  const handleDeletePrompt = () => {
    setIsOpen(true);
  };

  const handleDelete = () => {
    // window.location.assign('/services/japps');
    console.log(`Deleting app with id: ${id}`);
    setIsOpen(false);
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

  const body = (
    <p className="w-[400px]">
      Are you sure you want to delete <b>{title}</b>? This action permanent and
      cannot be reversed.
    </p>
  );

  const footer = (
    <div className="modal-btn-group">
      <Button
        id="cancel-btn"
        variant="secondary"
        onClick={() => setIsOpen(false)}
      >
        Cancel
      </Button>
      <Button id="delete-btn" variant="primary" onClick={() => handleDelete()}>
        Delete
      </Button>
    </div>
  );

  return (
    <div className="card" id={`card-${id}`} tabIndex={0}>
      <div className="card-header-media">
        <div className="card-header-menu">
          <ContextMenu id={`card-menu-${id}`} items={menuItems} />
          {isOpen && (
            <Modal
              title={`Delete ${title}`}
              setIsOpen={setIsOpen}
              body={body}
              footer={footer}
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
