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

export default instance;
