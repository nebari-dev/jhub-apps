import { AppCard } from '@src/components';
import type { JhApp, JhServiceApp } from '@src/types/jupyterhub';
import type React from 'react';

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
      {apps.map((app: JhApp) => (
        <AppCard
          {...app}
          key={`app-${app.id}`}
          title={app.name}
          serverStatus={app.status}
          isAppCard={false}
          app={app}
        />
      ))}
      {services.map((service: JhServiceApp) => (
        <AppCard
          {...service}
          key={`app-${service.id}`}
          title={service.name}
          serverStatus={service.status}
          isAppCard={false}
        />
      ))}
    </>
  );
};
