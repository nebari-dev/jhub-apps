import { servicesFull } from '@src/data/jupyterhub';
import { JhServiceFull } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import {
  getApps,
  getFriendlyFrameworkName,
  getJhData,
  getServices,
} from './jupyterhub';

describe('JupyterHub utils', () => {
  const userState: UserState = {
    admin: true,
    auth_state: 'current',
    created: '',
    groups: [],
    kind: '',
    last_activity: '',
    name: 'test',
    pending: false,
    roles: [],
    scopes: [],
    server: '',
    session_id: '',
    servers: {
      server1: {
        user_options: {
          jhub_app: true,
          name: 'app1',
          display_name: 'App 1',
          description: 'Description 1',
          framework: 'python',
          imgUrl: 'image1.jpg',
        },
        url: 'server1-url',
      },
    },
  };

  test('returns empty jhdata from window object', () => {
    const mockJhdata = {};
    // @ts-ignore
    window.jhdata = mockJhdata;
    const result = getJhData();
    expect(result).toEqual(mockJhdata);
  });

  test('returns full jhdata from window object', () => {
    const mockJhdata = {
      base_url: '/hub/',
      prefix: '/',
      user: 'test',
      admin_access: false,
      options_form: false,
      xsrf_token: '2|12345|12345|12345',
    };
    // @ts-ignore
    window.jhdata = mockJhdata;
    const result = getJhData();
    expect(result).toEqual(mockJhdata);
  });

  test('returns an array of JhService for given services', () => {
    const user = 'testUser';
    const result = getServices(servicesFull, user);
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual({
      name: 'Service 1',
      url: 'http://service1.com/testUser',
      external: true,
    });
  });

  test('returns an empty array of JhService for no services', () => {
    const services: JhServiceFull[] = [];
    const user = 'testUser';
    const result = getServices(services, user);
    expect(result.length).toEqual(0);
  });

  test('returns an array of JhApp for shared apps', () => {
    const result = getApps(userState, 'Shared');
    expect(result.length).toEqual(0);
    expect(result.every((app) => app.shared === true)).toBe(true);
  });

  test('returns an array of JhApp for non-shared apps', () => {
    const result = getApps(userState, 'My');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((app) => app.shared === false)).toBe(true);
  });

  test('returns the framework name with the first letter capitalized', () => {
    const result = getFriendlyFrameworkName('python');
    expect(result).toBe('Python');
  });
});
