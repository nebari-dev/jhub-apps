import { JhApp, JhService, JhServiceFull } from '../types/jupyterhub';
export const services: JhService[] = [
  {
    name: 'JupyterLab',
    url: 'http://127.0.0.1:8000/user/jbouder/lab',
    external: true,
  },
  {
    name: 'Argo Workflows',
    url: '/hub/argo',
    external: false,
  },
  {
    name: 'User Management',
    url: '/auth/admin/nebari/console/',
    external: false,
  },
  {
    name: 'Environments',
    url: '/hub/conda-store',
    external: false,
  },
  {
    name: 'Monitoring',
    url: '/hub/monitoring',
    external: false,
  },
];

export const servicesFull: JhServiceFull[] = [
  {
    display: true,
    info: {
      name: 'Service 1',
      url: 'http://service1.com/[USER]',
      external: true,
    },
    prefix: '/services',
    kind: '',
    admin: true,
    roles: [],
    pid: 0,
    url: '',
    name: 'service1',
    command: [],
  },
  {
    display: false,
    info: {
      name: 'Service 2',
      url: 'http://service2.com/[USER]',
      external: false,
    },
    prefix: '/services',
    kind: '',
    admin: false,
    roles: [],
    pid: 0,
    url: '',
    name: 'service1',
    command: [],
  },
];

export const apps: JhApp[] = [
  {
    id: '1',
    name: 'Awesome App 1',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    framework: 'Gradio',
    thumbnail:
      'https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg',
    url: '/hub/app1',
    shared: false,
  },
  {
    id: '2',
    name: 'Awesome App 2',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    framework: 'Panel',
    thumbnail:
      'https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg',
    url: '/hub/app2',
    shared: false,
  },
  {
    id: '3',
    name: 'Awesome App 3',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    framework: 'Some Framework',
    url: '/hub/app3',
    shared: false,
  },
  {
    id: '4',
    name: 'Awesome App 4',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    framework: 'Some Framework',
    url: '/hub/app4',
    shared: false,
  },
  {
    id: '5',
    name: 'Awesome App 5',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    framework: 'Some Framework',
    url: '/hub/app5',
    shared: false,
  },
  {
    id: '6',
    name: 'Awesome App 6',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    framework: 'Some Framework',
    url: '/hub/app6',
    shared: true,
  },
];

export const userData = {
  last_activity: '2023-11-14T19:48:13.969796Z',
  auth_state: null,
  groups: [],
  server: '/user/test/',
  admin: true,
  roles: ['admin', 'user'],
  pending: null,
  name: 'test',
  created: '2023-11-01T17:54:28.957281Z',
  kind: 'user',
  servers: {
    'test-app': {
      name: 'test-app',
      last_activity: '2023-11-14T15:08:24.602062Z',
      started: null,
      pending: null,
      ready: false,
      stopped: true,
      url: '/user/test/test-app/',
      user_options: {
        name: 'test-app',
        jhub_app: true,
        display_name: 'Test App',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
        thumbnail: null,
        filepath: '',
        framework: '',
        custom_command: '',
        env: null,
      },
      progress_url: '/hub/api/users/test/servers/test-ap/progress',
      state: {},
    },
  },
};
