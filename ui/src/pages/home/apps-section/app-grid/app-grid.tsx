import { JhApp } from '@src/types/jupyterhub';
import React, { SetStateAction } from 'react';
import AppCard from '../../../../components/app-card/app-card';

interface AppsGridProps {
  apps: JhApp[];
  onStartOpen: (app: SetStateAction<null>) => void;
  onStopOpen: (app: SetStateAction<null>) => void;
  onDeleteOpen: (app: null) => void;
}

export const AppGrid = ({
  apps,
  onStartOpen,
  onStopOpen,
  onDeleteOpen,
}: AppsGridProps): React.ReactElement => {
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
          lastModified={app.last_activity}
          username={app.username}
          isPublic={app.public}
          isShared={app.shared}
          onStartOpen={() => onStartOpen(app)}
          onStopOpen={() => onStopOpen(app)}
          onDeleteOpen={() => onDeleteOpen(app)}
        />
      ))}
    </>
  );
};
