import { app } from '@src/data/api';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { currentUser as defaultUser } from '../../../src/store';
import { NotRunning } from './not-running';

describe('NotRunning', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  beforeEach(() => {
    queryClient.clear();
    mock.reset();
    sessionStorage.clear();
  });

  const componentWrapper = (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NotRunning />
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { assign: vi.fn() },
    });
  });

  beforeEach(() => {
    sessionStorage.clear();
  });

  test('should render successfully', async () => {
    const { baseElement } = render(componentWrapper);
    await act(async () => {
      expect(baseElement).toBeTruthy();
      expect(
        baseElement.querySelector('.MuiCircularProgress-root'),
      ).toBeTruthy();
    });
  });

  test('renders with no mock data', async () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/user/app-1' },
    });

    mock.onGet(new RegExp('/server/app-1')).reply(200, null);
    queryClient.setQueryData(['app-form', 'app-1'], null);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <NotRunning />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeTruthy();
    expect(window.location.pathname).toBe('/user/app-1');
  });

  test('renders with mock data', async () => {
    const mockResponse = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/user/app-1',
        hash: {
          endsWith: mockResponse,
          includes: mockResponse,
        },
        assign: mockResponse,
      },
      writable: true,
    });

    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    queryClient.setQueryData(['app-form', 'app-1'], app);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <NotRunning />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeTruthy();
    // TODO: Update this test when everything is running in single react app
    expect(window.location.pathname).toBe('/user/app-1');
  });

  test('renders for started server', async () => {
    const mockResponse = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/hub',
        pathname: '/user/app-1',
        hash: {
          endsWith: mockResponse,
          includes: mockResponse,
        },
        assign: mockResponse,
      },
      writable: true,
    });

    const appData = { ...app, started: '2024-01-01' };
    mock.onGet(new RegExp('/server/app-1')).reply(200, appData);
    queryClient.setQueryData(['app-form', 'app-1'], appData);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <NotRunning />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeTruthy();
    // TODO: Update this test when everything is running in single react app
    expect(window.location.pathname).toBe('/user/app-1');
  });

  test('renders for pending server', async () => {
    const mockResponse = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/hub',
        pathname: '/user/app-1',
        hash: {
          endsWith: mockResponse,
          includes: mockResponse,
        },
        assign: mockResponse,
      },
      writable: true,
    });

    const appData = { ...app, pending: true };
    mock.onGet(new RegExp('/server/app-1')).reply(200, appData);
    queryClient.setQueryData(['app-form', 'app-1'], appData);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <NotRunning />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeTruthy();
    // TODO: Update this test when everything is running in single react app
    expect(window.location.pathname).toBe('/user/app-1');
  });

  test('renders for stopped server', async () => {
    const mockResponse = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/hub',
        pathname: '/user/app-1',
        hash: {
          endsWith: mockResponse,
          includes: mockResponse,
        },
        assign: mockResponse,
      },
      writable: true,
    });

    const appData = { ...app, stopped: true };
    mock.onGet(new RegExp('/server/app-1')).reply(200, appData);
    queryClient.setQueryData(['app-form', 'app-1'], appData);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <NotRunning />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeTruthy();
    // TODO: Update this test when everything is running in single react app
    expect(window.location.pathname).toBe('/user/app-1');
  });
});
