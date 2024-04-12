import { serverApps } from '@src/data/api';
import { servicesFull } from '@src/data/jupyterhub';
import { currentUser } from '@src/data/user';
import { JhServiceFull } from '@src/types/jupyterhub';
import {
  filterAndSortApps,
  getAppLogoUrl,
  getApps,
  getFriendlyDateStr,
  getFriendlyDisplayName,
  getFriendlyFrameworkName,
  getJhData,
  getServices,
  navigateToUrl,
} from './jupyterhub';

jest.mock('./jupyterhub', () => ({
  ...jest.requireActual('./jupyterhub'),
  navigateToUrl: jest.fn(),
}));
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

  test('returns a friendly display name with no trailing spaces', () => {
    const result = getFriendlyDisplayName('Test App 1 ');
    expect(result).toBe('Test App 1');
  });

  test('returns a friendly display name with no forward slashes', () => {
    const result = getFriendlyDisplayName('Test App 1 //');
    expect(result).toBe('Test App 1');
  });

  test('returns the framework name with the first letter capitalized', () => {
    const result = getFriendlyFrameworkName('python');
    expect(result).toBe('Python');
  });

  test('returns a friendly date string for recent change', () => {
    const result = getFriendlyDateStr(new Date());
    expect(result).toBe('Just now');
  });

  test('returns a friendly date string for change within 1 minute', () => {
    const currentDate = new Date();
    const result = getFriendlyDateStr(
      new Date(currentDate.setMinutes(currentDate.getMinutes() - 1)),
    );
    expect(result).toBe('1 minute ago');
  });

  test('returns a friendly date string for change within minutes', () => {
    const currentDate = new Date();
    const result = getFriendlyDateStr(
      new Date(currentDate.setMinutes(currentDate.getMinutes() - 5)),
    );
    expect(result).toBe('5 minutes ago');
  });

  test('returns a friendly date string for change within hours', () => {
    const currentDate = new Date();
    const result = getFriendlyDateStr(
      new Date(currentDate.setHours(currentDate.getHours() - 5)),
    );
    expect(result).toBe('5 hours ago');
  });

  test('returns a friendly date string for change within days', () => {
    const currentDate = new Date();
    const result = getFriendlyDateStr(
      new Date(currentDate.setHours(currentDate.getHours() - 120)),
    );
    expect(result).toBe('5 days ago');
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

  test('filters and sorts apps by recently modified', () => {
    const apps = filterAndSortApps(
      serverApps,
      currentUser,
      '',
      'all',
      [],
      'Recently modified',
    );
    expect(apps[0].name).toBe('Test App');
  });

  test('filters and sorts apps by name asc', () => {
    const apps = filterAndSortApps(
      serverApps,
      currentUser,
      '',
      'all',
      [],
      'Name: A-Z',
    );
    expect(apps[0].name).toBe('App with a long name that should be truncated');
  });

  test('filters and sorts apps by name desc', () => {
    const apps = filterAndSortApps(
      serverApps,
      currentUser,
      '',
      'all',
      [],
      'Name: Z-A',
    );
    expect(apps[0].name).toBe('TEST App 3');
  });
});
