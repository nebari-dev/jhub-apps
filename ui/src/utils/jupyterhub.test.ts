import { serverApps } from '@src/data/api';
import { servicesFull } from '@src/data/jupyterhub';
import { currentUser } from '@src/data/user';
import { JhServiceFull } from '@src/types/jupyterhub';
import {
  filterAndSortApps,
  getAppLogoUrl,
  getApps,
  getFriendlyFrameworkName,
  getJhData,
  getServices,
  navigateToUrl,
} from './jupyterhub';

describe('JupyterHub utils', () => {
  test('returns empty object from no jhdata', () => {
    window.jhdata = {};
    const result = getJhData();
    expect(result).toEqual({});
  });

  test('returns empty jhdata from window object', () => {
    const mockJhdata = {};
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
    window.jhdata = mockJhdata;
    const result = getJhData();
    expect(result).toEqual(mockJhdata);
  });

  test('returns an array of JhService for given services', () => {
    const user = 'testUser';
    const result = getServices(servicesFull, user);
    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({
      name: 'Service 1',
      url: 'http://service1.com/testUser',
      external: true,
      pinned: false,
    });
  });

  test('returns an empty array of JhService for no services', () => {
    const services: JhServiceFull[] = [];
    const user = 'testUser';
    const result = getServices(services, user);
    expect(result.length).toEqual(0);
  });

  test('returns an array of JhApp for shared apps', () => {
    const result = getApps(serverApps, 'shared', 'testUser');
    expect(result.length).toEqual(1);
  });

  test('returns an array of JhApp for non-shared apps', () => {
    const result = getApps(serverApps, 'mine', 'testUser');
    expect(result.length).toEqual(4);
  });

  test('returns an array of JhApp for all apps', () => {
    const result = getApps(serverApps, 'all', 'testUser');
    expect(result.length).toEqual(5);
  });

  test('returns the framework name with the first letter capitalized', () => {
    const result = getFriendlyFrameworkName('python');
    expect(result).toBe('Python');
  });

  test('gets app theme url window object', () => {
    const result = getAppLogoUrl();
    expect(result).toBe('/img/logo.png');
  });

  test('navigates to the specified URL', () => {
    const mockUrl = 'http://localhost/';
    navigateToUrl(mockUrl);
    expect(document.location.href).toBe(mockUrl);
  });

  test('filters and sorts apps', () => {
    const apps = filterAndSortApps(
      serverApps,
      currentUser,
      '',
      'all',
      [],
      'name',
    );
    expect(apps.length).toBe(5);
  });
});
