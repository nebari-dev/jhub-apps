import { serverApps, services } from '@src/data/api';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import { currentUser as defaultUser } from '../../../store';
import { ServicesSection } from './services-section';

describe('ServicesSection', () => {
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

  test('renders a default grid successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ServicesSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h2');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Quick Access');
  });

  test('renders a message when no services', () => {
    queryClient.setQueryData(['service-data'], null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ServicesSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No services available');
  });

  test('renders a loading message', () => {
    queryClient.isFetching = vi.fn().mockReturnValue(true);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <ServicesSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('Loading...');
  });

  test('renders with mocked data', async () => {
    mock.onGet(new RegExp('/services')).reply(200, services);
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['service-data'], services);
    queryClient.setQueryData(['app-state'], serverApps);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <ServicesSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelectorAll('.card')).toHaveLength(3);
  });

  test('renders with data error', async () => {
    mock.onGet(new RegExp('/services')).reply(500, { message: 'Some error' });
    mock.onGet(new RegExp('/server/')).reply(500, { message: 'Some error' });
    queryClient.setQueryData(['service-data'], null);
    queryClient.setQueryData(['app-state'], null);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <ServicesSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelectorAll('.card')).toHaveLength(0);
  });

  test('handles button click for external URL', () => {
    const mockResponse = vi.fn();
    Object.defineProperty(window, 'open', {
      value: mockResponse,
      writable: true,
    });

    mock.onGet(new RegExp('/services')).reply(200, services);
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['service-data'], services);
    queryClient.setQueryData(['app-state'], serverApps);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <ServicesSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const button = baseElement.querySelectorAll(
      'button',
    )[0] as HTMLButtonElement;
    fireEvent.click(button);
  });

  test('handles button click for internal URL', () => {
    const mockResponse = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        hash: {
          endsWith: mockResponse,
          includes: mockResponse,
        },
        assign: mockResponse,
      },
      writable: true,
    });

    mock.onGet(new RegExp('/services')).reply(200, services);
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['service-data'], services);
    queryClient.setQueryData(['app-state'], serverApps);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <ServicesSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const button = baseElement.querySelectorAll(
      'button',
    )[1] as HTMLButtonElement;
    fireEvent.click(button);
  });
});
