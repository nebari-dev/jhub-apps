import { ThemeProvider } from '@mui/material/styles';
import { serverApps } from '@src/data/api';
import { servicesFull } from '@src/data/jupyterhub';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { JSX } from 'react/jsx-runtime';
import { RecoilRoot } from 'recoil';
import { Navigation } from '..';
import {
  isHeadless as defaultIsHeadless,
  currentUser as defaultUser,
} from '../../store';
import { theme } from '../../theme/theme';
describe('Navigation', () => {
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
  });

  // Wrap your components with the ThemeProvider and provide the theme
  const renderWithTheme = (
    component:
      | string
      | number
      | boolean
      | JSX.Element
      | Iterable<ReactNode>
      | null
      | undefined,
  ) => render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);

  test('renders default top navigation successfully', () => {
    const { baseElement } = renderWithTheme(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Navigation />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('.MuiToolbar-root')).toBeTruthy();
  });

  test('renders side navigation with services', async () => {
    mock.onGet(new RegExp('/services')).reply(200, servicesFull);
    queryClient.setQueryData(['service-data'], servicesFull);

    const { baseElement } = renderWithTheme(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Navigation />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('.MuiDrawer-root')).toBeTruthy();
    expect(baseElement.querySelectorAll('.MuiListItem-root')).not.toHaveLength(
      0,
    );
  });

  test('renders side navigation with apps and services', async () => {
    mock.onGet(new RegExp('/services')).reply(200, servicesFull);
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['service-data'], servicesFull);
    queryClient.setQueryData(['app-state'], serverApps);

    const { baseElement } = renderWithTheme(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Navigation />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('.MuiDrawer-root')).toBeTruthy();
    expect(baseElement.querySelectorAll('.MuiListItem-root')).not.toHaveLength(
      0,
    );
  });

  test('renders with data error', async () => {
    mock.onGet(new RegExp('/services')).reply(500, { message: 'Some error' });
    queryClient.setQueryData(['service-data'], null);
    const { baseElement } = renderWithTheme(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <Navigation />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelectorAll('.MuiListItem-root')).not.toHaveLength(
      0,
    );
  });

  test('does not render navigation when headless', async () => {
    const { baseElement } = renderWithTheme(
      <RecoilRoot initializeState={({ set }) => set(defaultIsHeadless, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Navigation />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    waitFor(() => {
      expect(baseElement.querySelector('.MuiListItem-root')).toBeFalsy();
      expect(baseElement.querySelector('.MuiDrawer-root')).toBeFalsy();
    });
  });

  test('handles profile menu click', async () => {
    const { baseElement } = renderWithTheme(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <Navigation />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const button = baseElement.querySelector(
      '#profile-menu-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(button);
    });
    expect(baseElement.querySelectorAll('#profile-menu-list li')).toHaveLength(
      3,
    );

    // Nav error expected, disable console.error
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const items = baseElement.querySelectorAll('#profile-menu-list li');
    await act(async () => {
      fireEvent.click(items[0]);
    });
    await act(async () => {
      fireEvent.click(items[1]);
    });
    await act(async () => {
      fireEvent.click(items[2]);
    });

    expect(window.location.pathname).toBe('/');
  });
});
