import { JhApp } from '@src/types/jupyterhub';
import React from 'react';
import { useRecoilState } from 'recoil';
import AppCard from '../../../../components/app-card/app-card';
import { currentOwnershipValue as defaultOwnershipValue } from '../../../../store';

interface AppsGridProps {
  apps: JhApp[];
}

export const AppGrid = ({ apps }: AppsGridProps): React.ReactElement => {
  const [currentOwnershipValue] = useRecoilState<string>(defaultOwnershipValue);
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
          permissions={app.public ? 'Public' : 'Private' || 'Shared'}
          url={app.url}
          ready={app.ready}
          serverStatus={app.status}
          username={app.username}
          isPublic={app.public}
          isShared={currentOwnershipValue === 'Shared' ? true : false}
        />
      ))}
    </>
  );
};
