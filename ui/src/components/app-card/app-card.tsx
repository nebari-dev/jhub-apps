import React from 'react';
import ContextMenu, { ContextMenuItem } from '../context-menu/context-menu';
import Tag from '../tag/tag';

interface AppCardProps {
  id: string;
  title: string;
  description?: string;
  framework: string;
  thumbnail?: string;
  url: string;
}

export const AppCard = ({
  id,
  title,
  description,
  thumbnail,
  framework,
  url,
}: AppCardProps): React.ReactElement => {
  const handleStart = () => {
    window.location.assign(url);
  };

  const handleStop = () => {
    console.log(`Stopping app with id: ${id}`);
  };

  const handleEdit = () => {
    window.location.assign(`/services/japps/create-app/?name=${id}`);
  };

  const handleDelete = () => {
    window.location.assign('/services/japps');
  };

  const menuItems: ContextMenuItem[] = [
    {
      id: 'start',
      title: 'Start',
      onClick: () => handleStart(),
    },
    {
      id: 'stop',
      title: 'Stop',
      onClick: () => handleStop(),
      disabled: true,
    },
    {
      id: 'edit',
      title: 'Edit',
      onClick: () => handleEdit(),
    },
    {
      id: 'delete',
      title: 'Delete',
      onClick: () => handleDelete(),
    },
  ];

  return (
    <div className="card" id={`card-${id}`}>
      <div className="card-header-media">
        <div className="card-header-menu">
          <ContextMenu id={`card-menu-${id}`} items={menuItems} />
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
