import { JhApp, JhService, JhServiceFull } from '@src/types/jupyterhub';
import { JhData } from '@src/types/jupyterhub.ts';
import { DEFAULT_APP_THUMBNAIL } from './constants';

export const getJhData = (): JhData => {
  return window.jhdata;
};

export const getServices = (services: JhServiceFull[], user: string) => {
  const jhServices: JhService[] = [];
  for (const key in services) {
    if (Object.hasOwnProperty.call(services, key)) {
      const service = services[key];
      if (service.display === true && service.info.name) {
        jhServices.push({
          name: service.info.name,
          url: service.info.url?.replace('[USER]', user),
          external: service.info.external,
        });
      }
    }
  }
  return jhServices;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getApps = (servers: any, appType: string) => {
  const serverApps = [];
  const filteredApps: JhApp[] = [];
  if (appType.toLowerCase() === 'shared') {
    serverApps.push(...servers.shared_apps);
  } else {
    serverApps.push(...servers.user_apps);
    // Add default app manually
    const defaultApp = serverApps.find(
      (app: any) => app.name === '' && !app.user_options?.jhub_app,
    );

    if (defaultApp) {
      filteredApps.push({
        id: '',
        name: 'JupyterLab',
        description: 'This is your default JupyterLab server.',
        framework: 'JupyterLab',
        url: defaultApp.url,
        thumbnail: DEFAULT_APP_THUMBNAIL,
        ready: defaultApp.ready,
        public: false,
      });
    }
  }

  serverApps.forEach((server: any) => {
    if (server.user_options?.jhub_app) {
      const app = server.user_options;
      filteredApps.push({
        id: app.name,
        name: app.display_name,
        description: app.description,
        framework: getFriendlyFrameworkName(app.framework),
        url: server.url,
        thumbnail: app.thumbnail,
        username: server.username,
        ready: server.ready,
        public: app.public,
      });
    }
  });

  return filteredApps;
};

export const getFriendlyFrameworkName = (framework: string) => {
  return framework.charAt(0).toUpperCase() + framework.slice(1);
};
