import { AppCard } from '@src/components';
import { JhApp, JhServiceApp } from '@src/types/jupyterhub';
import React from 'react';

interface ServiceGridProps {
  services: JhServiceApp[];
  apps: JhApp[];
}

export const ServiceGrid = ({
  services,
  apps,
}: ServiceGridProps): React.ReactElement => {
  return (
    <>
      {apps.map((app: JhApp, index: number) => (
        <AppCard
          id={app.id}
          key={`app-${app.id}-${index}`}
          title={app.name}
          description={app.description}
          thumbnail={app.thumbnail}
          framework={app.framework}
          url={app.url}
          ready={app.ready}
          serverStatus={app.status}
          username={app.username}
          isAppCard={false}
          app={app}
        />
      ))}
      {services.map((service: JhServiceApp, index: number) => (
        <AppCard
          id={service.id}
          key={`app-${service.id}-${index}`}
          title={service.name}
          description={service.description}
          thumbnail={service.thumbnail}
          framework={service.framework}
          url={service.url}
          serverStatus={service.status}
          username={service.username}
          isAppCard={false}
        />
      ))}
    </>
  );
};
