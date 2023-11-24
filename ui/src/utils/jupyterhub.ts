import { JhApp, JhService, JhServiceFull } from '@src/types/jupyterhub';
import { JhData } from '@src/types/jupyterhub.ts';
import { UserState } from '@src/types/user';

export const getJhData = (): JhData => {
  return window.jhdata;
};

export const getServices = (services: JhServiceFull[], user: string) => {
  const jhServices: JhService[] = [];
  for (const key in services) {
    if (Object.hasOwnProperty.call(services, key)) {
      const service = services[key];
      if (service.display === true) {
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

export const getApps = (userState: UserState, appType: string) => {
  const servers = userState.servers;
  const apps: JhApp[] = [];
  for (const key in servers) {
    if (Object.hasOwnProperty.call(servers, key)) {
      const server = servers[key];
      if (server.user_options?.jhub_app) {
        const app = server.user_options;
        apps.push({
          id: app.name,
          name: app.display_name,
          description: app.description,
          framework: getFriendlyFrameworkName(app.framework),
          url: server.url,
          thumbnail: app.imgUrl,
          shared: false,
          ready: app.ready,
        });
      }
    }
  }

  if (appType.toLowerCase() === 'shared') {
    return apps.filter((app: JhApp) => app.shared === true);
  } else {
    return apps.filter((app: JhApp) => app.shared === false);
  }
};

export const getFriendlyFrameworkName = (framework: string) => {
  return framework.charAt(0).toUpperCase() + framework.slice(1);
};
