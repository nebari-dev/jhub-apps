import { CONDA_STORE_LOGO, JUPYTER_LOGO, VSCODE_LOGO } from '@src/data/logos';
import {
  JhApp,
  JhService,
  JhServiceApp,
  JhServiceFull,
} from '@src/types/jupyterhub';
import { JhData } from '@src/types/jupyterhub.ts';
import { UserState } from '@src/types/user';
import { DEFAULT_PINNED_SERVICES } from './constants';

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
          pinned: DEFAULT_PINNED_SERVICES.includes(service.info.name),
        });
      }
    }
  }
  return jhServices;
};

export const getPinnedServices = (
  services: JhServiceFull[],
  username: string,
) => {
  const jhServices = getServices(services, username);
  const pinnedServices: JhServiceApp[] = [];
  jhServices
    .filter((service) => DEFAULT_PINNED_SERVICES.includes(service.name))
    .forEach((service, index) => {
      pinnedServices.push({
        id: `service-${index}`,
        name: service.name,
        description: 'This is conda-store, your environments manager.',
        framework: '',
        url: service.url,
        thumbnail: CONDA_STORE_LOGO,
        username: username,
        status: 'Ready',
      });
    });
  return pinnedServices;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getApps = (
  servers: any,
  ownershipType: string,
  username: string,
) => {
  const serverApps = [];
  const filteredApps: JhApp[] = [];
  if (ownershipType === 'shared' || ownershipType === 'all') {
    serverApps.push(
      ...servers.shared_apps.map((server: any) => ({
        ...server,
        shared: true,
      })),
    );
  }
  if (ownershipType === 'mine' || ownershipType === 'all') {
    serverApps.push(
      ...servers.user_apps.map((server: any) => ({ ...server, shared: false })),
    );
  }

  serverApps.forEach((server: any) => {
    if (server.user_options?.jhub_app) {
      const app = server.user_options;
      const appStatus = getAppStatus(server);
      filteredApps.push({
        id: app.name,
        name: app.display_name,
        description: app.description,
        framework: getFriendlyFrameworkName(app.framework),
        url: server.url,
        thumbnail: app.thumbnail,
        username: server.username || username,
        ready: server.ready,
        pending: server.pending,
        stopped: server.stopped,
        public: app.public,
        shared: server.shared,
        last_activity: server.last_activity,
        status: appStatus,
      });
    }
  });

  return filteredApps;
};

export const getPinnedApps = (servers: any, username: string) => {
  const pinnedApps: JhApp[] = [];
  const defaultApp = servers.user_apps.find(
    (app: any) => app.name === '' && !app.user_options?.jhub_app,
  );

  if (defaultApp) {
    const appStatus = getAppStatus(defaultApp);
    const jupyterLabApp = {
      id: '',
      name: 'JupyterLab',
      description: 'This is your default JupyterLab server.',
      framework: 'JupyterLab',
      url: `/hub/user/${username}/lab`,
      thumbnail: JUPYTER_LOGO,
      username: username,
      ready: defaultApp.ready,
      public: false,
      shared: false,
      last_activity: defaultApp.last_activity,
      status: appStatus,
    };
    pinnedApps.push(jupyterLabApp);
    pinnedApps.push({
      ...jupyterLabApp,
      id: 'vscode',
      name: 'VSCode',
      description: 'This is your default VSCode server.',
      framework: 'VSCode',
      url: `/hub/user/${username}/vscode`,
      thumbnail: VSCODE_LOGO,
    });
  }
  return pinnedApps;
};

export const getFriendlyFrameworkName = (framework: string) => {
  return framework.charAt(0).toUpperCase() + framework.slice(1);
};

export const getAppLogoUrl = () => {
  if (window.theme?.logo) {
    return window.theme.logo;
  }
};

export const navigateToUrl = (url: string) => {
  document.location.href = url;
};

export const getAppStatus = (app: JhApp): string => {
  if (app.stopped) {
    return 'Ready';
  } else if (app.pending) {
    return 'Pending';
  } else if (app.ready) {
    return 'Running';
  } else {
    return 'Unknown';
  }
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const filterAndSortApps = (
  data: any,
  currentUser: UserState,
  searchValue: string,
  ownershipValue: string,
  frameworkValues: string[],
  sortByValue: string,
) => {
  const searchToLower = searchValue.toLowerCase();
  const ownershipType =
    ownershipValue === 'Owned by me'
      ? 'mine'
      : ownershipValue === 'Shared with me'
        ? 'shared'
        : 'all';

  // Get Apps based on ownership type and search value
  const apps = getApps(data, ownershipType, currentUser?.name ?? '')
    .filter(
      (app) =>
        app.name.toLowerCase().includes(searchToLower) ||
        app.description?.toLowerCase().includes(searchToLower) ||
        app.framework?.toLowerCase().includes(searchToLower),
    )
    .filter((app) => {
      if (frameworkValues.length > 0) {
        return frameworkValues.includes(app.framework);
      }
      return true;
    });

  // Sort Apps based on sort value
  apps.sort((a, b) => {
    if (sortByValue === 'Recently modified') {
      return a.last_activity > b.last_activity ? -1 : 1;
    } else if (sortByValue === 'Name: A-Z') {
      return a.name > b.name ? 1 : -1;
    }
    return a.name > b.name ? -1 : 1;
  });
  return apps;
};
