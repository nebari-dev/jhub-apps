import {
  environments,
  frameworks,
  profiles,
  serverApps,
  services,
} from '@src/data/api';
import { currentUser } from '@src/data/user';
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
    if (
      env === 'development' &&
      response.config.method === 'get' &&
      response.config.url
    ) {
      const url = response.config.url;
      // url data maps for basic endpoints
      const urlPathResponseDataMap = {
        '/user': currentUser,
        '/services/': services,
        '/server/': serverApps,
        '/frameworks/': frameworks,
        '/conda-environments/': environments,
        '/spawner-profiles/': profiles,
      } as any; //eslint-disable-line

      const data = urlPathResponseDataMap[url];
      if (data) {
        response.data = data;
      } else if (url?.match(/^\/server\/.*$/)) {
        const serverApp = serverApps.user_apps.find(
          (app) => app.name === url.split('/')[2],
        );
        if (serverApp) {
          response.data = serverApp;
        }
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
