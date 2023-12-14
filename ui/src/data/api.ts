import { AppFrameworkProps, AppQueryGetProps } from '@src/types/api';
import { UserState } from '@src/types/user';

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

export const userState: UserState = {
  admin: false,
  auth_state: null,
  created: null,
  groups: ['group1', 'group2'],
  kind: 'user',
  last_activity: null,
  name: 'test',
  pending: null,
  roles: ['role1', 'role2'],
  scopes: ['scope1', 'scope2'],
  server: null,
  servers: [app],
  session_id: null,
};
