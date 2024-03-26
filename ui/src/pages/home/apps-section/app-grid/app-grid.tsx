import { JhApp } from '@src/types/jupyterhub';
import React from 'react';
import AppCard from '../../../../components/app-card/app-card';

interface AppsGridProps {
  apps: JhApp[];
}

export const AppGrid = ({ apps }: AppsGridProps): React.ReactElement => {
  return (
    <>
      {apps.map((app: JhApp) => (
        <AppCard
          id={app.id}
          key={`app-${app.id}`}
          title={app.name}
          description={app.description}
          thumbnail={app.thumbnail}
          framework={app.framework}
          url={app.url}
          ready={app.ready}
          serverStatus={app.status}
          username={app.username}
          isPublic={app.public}
          isShared={app.shared}
        />
      ))}
    </>
  );
};
