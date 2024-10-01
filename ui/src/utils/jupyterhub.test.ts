import { apps, serverApps } from '@src/data/api';
import { servicesFull } from '@src/data/jupyterhub';
import { currentUser } from '@src/data/user';
import { JhServiceFull } from '@src/types/jupyterhub';
import {
  clearAppToStart,
  filterAndSortApps,
  getAppLogoUrl,
  getApps,
  getAppToStart,
  getEncodedServerUrl,
  getFriendlyDateStr,
  getFriendlyDisplayName,
  getFriendlyEnvironmentVariables,
  getFriendlyFrameworkName,
  getJhData,
  getServices,
  getSpawnPendingUrl,
  getSpawnUrl,
  isDefaultApp,
  navigateToUrl,
  storeAppToStart,
} from './jupyterhub';

vi.mock('./jupyterhub', async () => {
  // Require the actual module to spread its properties
  const actual = await vi.importActual('./jupyterhub');

  return {
    ...actual,
    navigateToUrl: vi.fn(),
  };
});

describe('JupyterHub utils', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

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
      name: 'Environments',
      url: 'http://service1.com/service1',
      external: true,
      pinned: true,
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
    expect(result.length).toEqual(2);
  });

  test('returns an array of JhApp for non-shared apps', () => {
    const result = getApps(serverApps, 'mine', 'testUser');
    expect(result.length).toEqual(4);
  });

  test('returns an array of JhApp for all apps', () => {
    const result = getApps(serverApps, 'all', 'testUser');
    expect(result.length).toEqual(6);
  });

  test('returns a jupyterhub friendly url for JupyterLab with no encoding needed', () => {
    const result = getEncodedServerUrl('testuser', 'lab');
    expect(result).toBe('/hub/user/testuser/lab');
  });

  test('returns a jupyterhub friendly url for JupyterLab with encoding needed', () => {
    const result = getEncodedServerUrl('testuser+123@email.com', 'lab');
    expect(result).toBe('/hub/user/testuser%2B123@email.com/lab');
  });

  test('returns a jupyterhub friendly url for VSCode with no encoding needed', () => {
    const result = getEncodedServerUrl('testuser', 'vscode');
    expect(result).toBe('/hub/user/testuser/vscode');
  });

  test('returns a jupyterhub friendly url for VSCode with encoding needed', () => {
    const result = getEncodedServerUrl('testuser+123@email.com', 'vscode');
    expect(result).toBe('/hub/user/testuser%2B123@email.com/vscode');
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

  test('returns environment variables as JSON object', () => {
    const env = { key: 'value' };
    const result = getFriendlyEnvironmentVariables(env);
    expect(result).toEqual(env);
  });

  test('returns null when no environment variables', () => {
    const result = getFriendlyEnvironmentVariables(null);
    expect(result).toBeNull();
  });

  test('gets app theme url window object', () => {
    const result = getAppLogoUrl();
    expect(result).toBe('/img/logo.png');
  });

  test('gets spawn url for app', () => {
    const url = getSpawnUrl(currentUser, apps[0]);
    expect(url).toContain('/spawn/testuser1@email.com?next=%2F');
    expect(url).toContain('test-app-1');
  });

  test('gets spawn url for JupyterLab', () => {
    const app = { ...apps[0], name: 'JupyterLab' };
    const url = getSpawnUrl(currentUser, app);
    expect(url).toContain('/spawn/testuser1@email.com?next=%2F');
    expect(url).toContain('lab');
  });

  test('gets spawn url for VSCode', () => {
    const app = { ...apps[0], name: 'VSCode' };
    const url = getSpawnUrl(currentUser, app);
    expect(url).toContain('/spawn/testuser1@email.com?next=%2F');
    expect(url).toContain('vscode');
  });

  test('gets spawn pending url', () => {
    const url = getSpawnPendingUrl(currentUser, 'test-app-1');
    expect(url).toContain(
      '/spawn-pending/testuser1@email.com/test-app-1?next=%2F',
    );
  });

  test('verifies custom app is not default app', () => {
    expect(isDefaultApp('app1')).toBe(false);
  });

  test('verifies JupyterLab is default app', () => {
    expect(isDefaultApp('JupyterLab')).toBe(true);
  });

  test('verifies VSCode is default app', () => {
    expect(isDefaultApp('VSCode')).toBe(true);
  });

  test('stores and clears startAppId storage', () => {
    storeAppToStart('test-app-1');
    expect(sessionStorage.getItem('startAppId')).toBe('test-app-1');
    expect(getAppToStart()).toBe('test-app-1');

    clearAppToStart();
    expect(sessionStorage.getItem('startAppId')).toBeNull();
  });

  test('navigates to the specified URL', () => {
    const mockUrl = 'http://localhost';
    navigateToUrl(mockUrl);
    expect(document.location.href).toContain(mockUrl);
  });

  test('filters and sorts apps by recently modified', () => {
    const apps = filterAndSortApps(
      serverApps,
      currentUser,
      '',
      'all',
      [],
      'Recently modified',
      [],
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
      [],
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
      [],
    );
    expect(apps[0].name).toBe('TEST App 3');
  });
});
