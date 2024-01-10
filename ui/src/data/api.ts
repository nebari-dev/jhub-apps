import {
  AppFrameworkProps,
  AppProfileProps,
  AppQueryGetProps,
} from '@src/types/api';
import { UserState } from '@src/types/user';

export const frameworks: AppFrameworkProps[] = [
  { name: 'panel', display_name: 'Panel', logo: '' },
  { name: 'bokeh', display_name: 'Bokeh', logo: '' },
  { name: 'jupyterlab', display_name: 'JupyterLab', logo: '' },
  { name: 'custom', display_name: 'Custom Command', logo: '' },
];

export const environments = ['env-1', 'env-2', 'env-3', 'env-4', 'env-5'];

export const profiles: AppProfileProps[] = [
  { display_name: 'Small', slug: 'small' },
  { display_name: 'Medium', slug: 'medium' },
  { display_name: 'Large', slug: 'large' },
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
    },
    {
      name: 'test-app',
      url: '/user/test/test-app/',
      ready: true,
      user_options: {
        name: 'test-app',
        jhub_app: true,
        display_name: 'Test App',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
        imgUrl:
          'https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg',
        framework: 'Panel',
        public: true,
      },
    },
    {
      name: 'test-app-2',
      url: '/user/test/test-app-2/',
      ready: false,
      user_options: {
        name: 'test-app-2',
        jhub_app: true,
        display_name: 'Test App 2',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Bras.',
        imgUrl:
          'https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg',
        framework: 'Streamlit',
        public: false,
      },
    },
    {
      name: 'test-app-3',
      url: '/user/test/test-app-3/',
      ready: false,
      user_options: {
        name: 'test-app-3',
        jhub_app: true,
        display_name: 'Test App 3',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Dras.',
        imgUrl: null,
        framework: 'JupyterLab',
        public: false,
      },
    },
    {
      name: 'test-app-4',
      url: '/user/test/test-app-4/',
      ready: false,
      user_options: {
        name: 'test-app-4',
        jhub_app: true,
        display_name: 'Test App 4',
        description: 'Cras.',
        imgUrl: null,
        framework: 'Streamlit',
        public: false,
      },
    },
  ],
  shared_apps: [
    {
      name: 'shared-app',
      url: '/shared/test/shared-app/',
      ready: true,
      user_options: {
        name: 'shared-app',
        jhub_app: true,
        display_name: 'Shared App',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
        imgUrl:
          'https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg',
        framework: 'Panel',
        public: false,
        username: 'Test User',
      },
    },
  ],
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
