import { AppFrameworkProps, AppQueryGetProps } from '@src/types/api';

export const frameworks: AppFrameworkProps[] = [
  { name: 'panel', display_name: 'Panel', logo: '' },
  { name: 'bokeh', display_name: 'Bokeh', logo: '' },
  { name: 'jupyterlab', display_name: 'JupyterLab', logo: '' },
];

export const app: AppQueryGetProps = {
  name: 'app-1',
  last_activity: '',
  started: null,
  pending: null,
  ready: true,
  stopped: false,
  url: 'http://',
  user_options: {
    jhub_app: true,
    display_name: 'App 1',
    description: 'App Description',
    thumbnail: '',
    filepath: '',
    framework: 'panel',
    custom_command: '',
    conda_env: '',
    profile: '',
  },
  progress_url: '',
  state: {},
};
