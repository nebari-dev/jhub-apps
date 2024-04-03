import {
  AppFrameworkProps,
  AppProfileProps,
  AppQueryGetProps,
} from '@src/types/api';
import { JhApp } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import { DEFAULT_APP_LOGO } from './logos';

export const frameworks: AppFrameworkProps[] = [
  { name: 'panel', display_name: 'Panel', logo: '' },
  { name: 'bokeh', display_name: 'Bokeh', logo: '' },
  { name: 'streamlit', display_name: 'Streamlit', logo: '' },
  { name: 'jupyterlab', display_name: 'JupyterLab', logo: '' },
  { name: 'custom', display_name: 'Custom Command', logo: '' },
];

export const environments = ['env-1', 'env-2', 'env-3', 'env-4', 'env-5'];

export const profiles: AppProfileProps[] = [
  {
    display_name: 'Small',
    slug: 'small0',
    description: 'Stable environment with 1 CPU / 4GB RAM',
  },
  {
    display_name: 'Small',
    slug: 'small1',
    description: 'Stable environment with 2 CPU / 8GB RAM',
  },
  {
    display_name: 'Medium Instance',
    slug: 'medium0',
    description: 'Stable environment with 4 CPU / 16GB RAM',
  },
  {
    display_name: 'Medium Instance',
    slug: 'medium1',
    description: 'Stable environment with 6 CPU / 20GB RAM',
  },
  {
    display_name: 'Large GPU Instance',
    slug: 'large0',
    description:
      'Stable environment with 8 CPU / 32GB RAM and 1 NVIDIA Tesla T4',
  },
  {
    display_name: 'Large GPU Instance',
    slug: 'large1',
    description:
      'Stable environment with 16 CPU / 64GB RAM and 2 NVIDIA Tesla T4',
  },
];

export const app: AppQueryGetProps = {
  name: 'app-1',
  last_activity: '',
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
    env: null,
    public: false,
  },
  progress_url: '',
  state: {},
};

export const serverApps = {
  user_apps: [
    {
      name: '',
      url: '/user/test',
      ready: true,
      user_options: {},
      last_activity: new Date(),
    },
    {
      name: 'test-app',
      url: '/user/test/test-app/',
      started: '2021-07-01T00:00:00',
      pending: false,
      ready: true,
      last_activity: new Date().getHours() - 1,
      stopped: false,
      user_options: {
        name: 'test-app',
        jhub_app: true,
        display_name: 'Test App',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
        thumbnail: DEFAULT_APP_LOGO,
        framework: 'panel',
        conda_env: 'env-1',
        profile: 'small1',
        filepath: '/shared/users/panel_basic.py',
        env: null,
        public: true,
      },
    },
    {
      name: 'test-app-2',
      url: '/user/test/test-app-2/',
      started: null,
      pending: true,
      ready: false,
      last_activity: new Date().getHours() - 2,
      stopped: false,
      user_options: {
        name: 'test-app-2',
        jhub_app: true,
        display_name: 'Test App 2',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Bras.',
        thumbnail: DEFAULT_APP_LOGO,
        framework: 'streamlit',
        conda_env: 'env-2',
        profile: 'small0',
        env: { key: 'value' },
        public: false,
      },
    },
    {
      name: 'test-app-3',
      url: '/user/test/test-app-3/',
      started: null,
      pending: false,
      ready: false,
      last_activity: new Date().getHours() - 3,
      stopped: true,
      user_options: {
        name: 'test-app-3',
        jhub_app: true,
        display_name: 'Test App 3',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Dras.',
        thumbnail: DEFAULT_APP_LOGO,
        framework: 'jupyterlab',
        conda_env: 'env-1',
        profile: 'small0',
        env: null,
        public: false,
      },
    },
    {
      name: 'test-app-4',
      url: '/user/test/test-app-4/',
      started: null,
      pending: false,
      ready: false,
      last_activity: new Date().getHours() - 4,
      stopped: false,
      user_options: {
        name: 'test-app-4',
        jhub_app: true,
        display_name: 'Test App 4',
        description: '',
        thumbnail: DEFAULT_APP_LOGO,
        framework: 'streamlit',
        conda_env: 'env-1',
        profile: 'small0',
        env: null,
        public: false,
      },
    },
  ],
  shared_apps: [
    {
      name: 'shared-app',
      url: '/shared/test/shared-app/',
      started: '2021-01-01T00:00:00.000Z',
      pending: null,
      ready: true,
      last_activity: new Date().getHours() - 8,
      stopped: false,
      user_options: {
        name: 'shared-app',
        jhub_app: true,
        display_name: 'Shared App',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
        thumbnail: DEFAULT_APP_LOGO,
        framework: 'panel',
        conda_env: 'env-1',
        profile: 'small0',
        env: null,
        public: false,
        username: 'Test User',
      },
    },
  ],
};

export const apps: JhApp[] = [
  {
    id: 'test-app-1',
    name: 'test-app-1',
    description: 'Test App 1',
    framework: 'streamlit',
    url: '/user/test/test-app-1/',
    thumbnail: '',
    username: 'test',
    ready: true,
    public: false,
    shared: false,
    last_activity: new Date(),
    pending: false,
    stopped: false,
    status: 'running',
  },
  {
    id: 'test-app-2',
    name: 'test-app-2',
    description: 'Test App 2',
    framework: 'panel',
    url: '/user/test/test-app-2/',
    thumbnail: '',
    username: 'test',
    ready: false,
    public: false,
    shared: false,
    last_activity: new Date(),
    pending: false,
    stopped: false,
    status: 'ready',
  },
];

export const services = {
  Environments: {
    display: true,
    info: {
      name: 'Environments',
      url: '/hub/conda-store',
      external: true,
    },
  },
  Argo: {
    display: true,
    info: {
      name: 'Argo Workflows',
      url: '/hub/argo',
      external: true,
    },
  },
  Users: {
    display: true,
    info: {
      name: 'User Management',
      url: '/auth/admin/nebari/console/',
      external: true,
    },
  },
  Monitoring: {
    display: true,
    info: {
      name: 'Monitoring',
      url: '/hub/monitoring',
      external: true,
    },
  },
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
