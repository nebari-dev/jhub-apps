import { JhApp } from '@src/types/jupyterhub';
import React from 'react';
import AppCard from '../../../../components/app-card/app-card';

interface AppsGridProps {
  apps: JhApp[];
}

export const AppGrid = ({ apps }: AppsGridProps): React.ReactElement => {
  return (
    <>
      {apps.map((app: JhApp, index: number) => (
        <AppCard
          {...app}
          key={`app-${app.id}-${index}`}
          title={app.name}
          serverStatus={app.status}
          lastModified={app.last_activity}
          isPublic={app.public}
          isShared={app.shared}
          app={app}
        />
      ))}
    </>
  );
};
