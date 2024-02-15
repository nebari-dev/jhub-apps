import {
  environments,
  frameworks,
  profiles,
  serverApps,
  services,
} from '@src/data/api';
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.response.use(
  (response) => {
    const env = process.env.NODE_ENV;
    // If development, mock api calls
    if (env === 'development' && response.config.method === 'get') {
      const url = response.config.url;
      if (url === '/services/') {
        response.data = services;
      } else if (url === '/server/') {
        response.data = serverApps;
      } else if (url?.match(/^\/server\/.*$/)) {
        const serverApp = serverApps.user_apps.find(
          (app) => app.name === url.split('/')[2],
        );
        if (serverApp) {
          response.data = serverApp;
        }
      } else if (url === '/frameworks/') {
        response.data = frameworks;
      } else if (url === '/conda-environments/') {
        response.data = environments;
      } else if (url === '/spawner-profiles/') {
        response.data = profiles;
      }
    }

    return response;
  },
  (error) => {
    const status = error.response.status;
    if (error.response.status === 401 || status === 403) {
      window.location.href = '/services/japps/jhub-login';
    }
  },
);

export default instance;
