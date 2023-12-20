import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    token: process.env.JUPYERHUB_API_TOKEN,
  },
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response.status;
    if (error.response.status === 401 || status === 403) {
      window.location.href = '/services/japps/jhub-login';
    }
  },
);

export default instance;
