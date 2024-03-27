import { JhService, JhServiceApp, JhServiceFull } from '../types/jupyterhub';

export const services: JhService[] = [
  {
    name: 'Argo Workflows',
    url: '/hub/argo',
    external: false,
    pinned: false,
  },
  {
    name: 'User Management',
    url: '/auth/admin/nebari/console/',
    external: false,
    pinned: false,
  },
  {
    name: 'Environments',
    url: '/hub/conda-store',
    external: false,
    pinned: true,
  },
  {
    name: 'Monitoring',
    url: '/hub/monitoring',
    external: false,
    pinned: false,
  },
];

export const serviceApps: JhServiceApp[] = [
  {
    id: '1',
    name: 'Service 1',
    description: 'Service 1 description',
    thumbnail: 'service1.png',
    framework: 'service',
    url: 'http://service1.com/[USER]',
    status: 'running',
    username: 'test',
  },
  {
    id: '2',
    name: 'Service 2',
    description: 'Service 2 description',
    thumbnail: 'service2.png',
    framework: 'service',
    url: 'http://service2.com/[USER]',
    status: 'running',
    username: 'test',
  },
  {
    id: '3',
    name: 'Service 3',
    description: 'Service 3 description',
    thumbnail: 'service3.png',
    framework: 'service',
    url: 'http://service3.com/[USER]',
    status: 'running',
    username: 'test',
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
    name: 'service2',
    command: [],
  },
  {
    display: true,
    info: {
      name: 'Service 3',
      url: 'http://service3.com/[USER]',
      external: false,
    },
    prefix: '/services',
    kind: '',
    admin: true,
    roles: [],
    pid: 0,
    url: '',
    name: 'service3',
    command: [],
  },
];

export const jhData = {
  base_url: '/hub/',
  prefix: '/',
  user: 'test',
  admin_access: false,
  options_form: false,
  xsrf_token: '2|12345|12345|12345',
};
