import { JhService, JhServiceFull } from '../types/jupyterhub';
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
