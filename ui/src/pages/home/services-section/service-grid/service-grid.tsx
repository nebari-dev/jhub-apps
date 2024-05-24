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
          {...app}
          key={`app-${app.id}-${index}`}
          title={app.name}
          serverStatus={app.status}
          isAppCard={false}
          app={app}
        />
      ))}
      {services.map((service: JhServiceApp, index: number) => (
        <AppCard
          {...service}
          key={`app-${service.id}-${index}`}
          title={service.name}
          serverStatus={service.status}
          isAppCard={false}
        />
      ))}
    </>
  );
};
