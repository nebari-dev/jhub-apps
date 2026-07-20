import { serverApps } from '@src/data/api';
import { servicesFull } from '@src/data/jupyterhub';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { Navigation } from '..';
import {
  isHeadless as defaultIsHeadless,
  currentUser as defaultUser,
} from '../../store';
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

  test('renders default top navigation successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Navigation />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('#toolbar')).toBeTruthy();
  });

  test('renders side navigation with services', async () => {
    mock.onGet(new RegExp('/services')).reply(200, servicesFull);
    queryClient.setQueryData(['service-data'], servicesFull);

    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Navigation />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('[data-testid="nav-drawer"]')).toBeTruthy();
    expect(baseElement.querySelectorAll('nav li')).not.toHaveLength(0);
  });

  test('renders side navigation with apps and services', async () => {
    mock.onGet(new RegExp('/services')).reply(200, servicesFull);
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['service-data'], servicesFull);
    queryClient.setQueryData(['app-state'], serverApps);

    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Navigation />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('[data-testid="nav-drawer"]')).toBeTruthy();
    expect(baseElement.querySelectorAll('nav li')).not.toHaveLength(0);
  });

  test('renders with data error', async () => {
    mock.onGet(new RegExp('/services')).reply(500, { message: 'Some error' });
    queryClient.setQueryData(['service-data'], null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <Navigation />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelectorAll('nav li')).not.toHaveLength(0);
  });

  test('does not render navigation when headless', async () => {
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultIsHeadless, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Navigation />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    waitFor(() => {
      expect(baseElement.querySelector('nav li')).toBeFalsy();
      expect(
        baseElement.querySelector('[data-testid="nav-drawer"]'),
      ).toBeFalsy();
    });
  });

  test('handles profile menu click', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <Navigation />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const button = baseElement.querySelector(
      '#profile-menu-btn',
    ) as HTMLButtonElement;
    await user.click(button);

    await waitFor(() => {
      expect(
        baseElement.querySelectorAll(
          '#profile-menu-list [role="menuitem"]',
        ),
      ).toHaveLength(3);
    });

    // Nav error expected, disable console.error
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const items = baseElement.querySelectorAll(
      '#profile-menu-list [role="menuitem"]',
    );
    await user.click(items[0] as HTMLElement);

    expect(window.location.pathname).toBe('/');
  });

  test('toggles color mode from the profile menu', async () => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    const user = userEvent.setup();
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <Navigation />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await user.click(
      baseElement.querySelector('#profile-menu-btn') as HTMLButtonElement,
    );

    const darkOption = await waitFor(() => {
      const option = baseElement.querySelector(
        '[aria-label="Dark mode"]',
      ) as HTMLElement;
      expect(option).toBeTruthy();
      return option;
    });

    await user.click(darkOption);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    expect(window.localStorage.getItem('jhub-apps:color-mode')).toBe('dark');

    // The profile menu items remain unchanged aside from the added toggle.
    expect(
      baseElement.querySelectorAll('#profile-menu-list [role="menuitem"]'),
    ).toHaveLength(3);
  });
});
