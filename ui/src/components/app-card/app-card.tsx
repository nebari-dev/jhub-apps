import React from 'react';
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
  return (
    <div className="card" id={`card-${id}`}>
      <div className="card-header-media">
        <div className="card-header-img">
          {thumbnail ? <img src={thumbnail} alt="App thumb" /> : undefined}
        </div>
      </div>
      <div className="card-header">
        <h4 className="font-bold">
          <a href={url}>{title}</a>
        </h4>
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
