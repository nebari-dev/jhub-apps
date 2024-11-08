import { CONDA_STORE_LOGO, JUPYTER_LOGO, VSCODE_LOGO } from '@src/data/logos';
import {
  JhApp,
  JhService,
  JhServiceApp,
  JhServiceFull,
} from '@src/types/jupyterhub';
import { JhData } from '@src/types/jupyterhub.ts';
import { UserState } from '@src/types/user';
import {
  APP_BASE_URL,
  APP_TO_START_KEY,
  DEFAULT_PINNED_SERVICES,
} from './constants';

export const getJhData = (): JhData => {
  return window.jhdata;
};

export const getServices = (services: JhServiceFull[], user: string) => {
  const jhServices: JhService[] = [];
  for (const key in services) {
    if (Object.hasOwnProperty.call(services, key)) {
      const service = services[key];
      if (service.display === true && service.info.name) {
        const serviceInfo = service.info;
        if (serviceInfo.url) {
          let url = serviceInfo.url;
          const name = serviceInfo.name;
          if (name === 'VSCode' || name === 'JupyterLab') {
            url = getEncodedServerUrl(user, name);
          }
          jhServices.push({
            name: name,
            url: url,
            external: serviceInfo.external,
            pinned: DEFAULT_PINNED_SERVICES.includes(name),
          });
        }
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
        ...app,
        ...server,
        id: app.name,
        name: app.display_name,
        url: server.url?.replace('/user/', '/hub/user/'),
        framework: getFriendlyFrameworkName(app.framework),
        username: server.username || username,
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
      profile: defaultApp.user_options?.profile,
      url: getEncodedServerUrl(username, 'lab'),
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
      id: '',
      name: 'VSCode',
      description: 'This is your default VSCode server.',
      framework: 'VSCode',
      url: getEncodedServerUrl(username, 'vscode'),
      thumbnail: VSCODE_LOGO,
    });
  }
  return pinnedApps;
};

/**
 * Get a server URL for the given username and server type, with required jupyterhub encoding.
 */
export const getEncodedServerUrl = (username: string, serverType: string) => {
  const encodedUsername = username.replace(/\+/g, '%2B'); // Encode '+' with url encoding
  return `/hub/user/${encodedUsername}/${serverType.toLowerCase()}`;
};

export const getFriendlyDisplayName = (name: string) => {
  return name.replace(/\//g, '').trim();
};

export const getFriendlyFrameworkName = (framework: string) => {
  return framework.charAt(0).toUpperCase() + framework.slice(1);
};

export const getFriendlyDateStr = (date: Date) => {
  const currentDate = new Date();
  const targetDate = new Date(date);

  const timeDiff = currentDate.getTime() - targetDate.getTime();
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? '1 day ago' : days + ' days ago';
  } else if (hours > 0) {
    return hours === 1 ? '1 hour ago' : hours + ' hours ago';
  } else if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : minutes + ' minutes ago';
  } else {
    return 'Just now';
  }
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getFriendlyEnvironmentVariables = (env: any) => {
  if (!env) {
    return null;
  }

  try {
    return JSON.parse(JSON.stringify(env));
  } catch {
    return null;
  }
};

export const getAppLogoUrl = () => {
  if (window.theme?.logo) {
    return window.theme.logo;
  }
};

export const getFullAppUrl = (url: string) => {
  return `${document.location.origin}${url}`;
};

export const getSpawnUrl = (currentUser: UserState, currentApp: JhApp) => {
  const username = currentUser.name;
  let appName = currentApp.name;
  if (currentApp.name === 'JupyterLab') {
    appName = 'lab';
  } else if (currentApp.name === 'VSCode') {
    appName = 'vscode';
  }
  const next = encodeURIComponent(
    `${APP_BASE_URL}/user/${username}/${appName}`,
  );

  return `${APP_BASE_URL}/spawn/${username}?next=${next}`;
};

export const getSpawnPendingUrl = (currentUser: UserState, appId: string) => {
  const username = currentUser?.name;
  const next = encodeURIComponent(`${APP_BASE_URL}/user/${username}/${appId}`);

  return `${APP_BASE_URL}/spawn-pending/${username}/${appId}?next=${next}`;
};

export const isDefaultApp = (name: string) => {
  if (name === 'JupyterLab' || name === 'VSCode') {
    return true;
  } else {
    return false;
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

export const getAppToStart = () => {
  return window.sessionStorage.getItem(APP_TO_START_KEY);
};

export const storeAppToStart = (appId: string) => {
  window.sessionStorage.setItem(APP_TO_START_KEY, appId);
};

export const clearAppToStart = () => {
  window.sessionStorage.removeItem(APP_TO_START_KEY);
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const filterAndSortApps = (
  data: any,
  currentUser: UserState,
  searchValue: string,
  ownershipValue: string,
  frameworkValues: string[],
  sortByValue: string,
  currentServerStatuses: string[],
) => {
  const searchToLower = searchValue.toLowerCase();
  const ownershipType =
    ownershipValue === 'Owned by me'
      ? 'mine'
      : ownershipValue === 'Shared with me'
        ? 'shared'
        : 'all';

  // Get Apps based on ownership type and search value
  const apps = getApps(data, ownershipType, currentUser.name)
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
    })
    .filter((app) => {
      if (currentServerStatuses.length > 0) {
        return currentServerStatuses.includes(app.status);
      }
      return true;
    });

  // Sort Apps based on sort value
  apps.sort((a, b) => {
    if (sortByValue === 'Recently modified') {
      return a.last_activity > b.last_activity ? -1 : 1;
    } else if (sortByValue === 'Name: A-Z') {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    }
    return a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1;
  });
  return apps;
};
