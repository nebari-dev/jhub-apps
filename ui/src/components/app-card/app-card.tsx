import React from 'react';
import Tag from '../tag/tag';

interface AppCardProps {
  id: string;
  title: string;
  description?: string;
  imgUrl?: string;
  appType: string;
}

export const AppCard = ({
  id,
  title,
  description,
  imgUrl,
  appType,
}: AppCardProps): React.ReactElement => {
  return (
    <div className="card" id={`card-${id}`}>
      <div className="card-header-media">
        <div className="card-header-img">
          {imgUrl ? <img src={imgUrl} alt="App thumb" /> : undefined}
        </div>
      </div>
      <div className="card-header">
        <h4 className="font-bold">{title}</h4>
      </div>
      <div className="card-body">
        <p className="text-sm">{description}</p>
      </div>
      <div className="card-footer">
        <Tag id={`tag-${id}`}>{appType}</Tag>
      </div>
    </div>
  );
};

export default AppCard;
