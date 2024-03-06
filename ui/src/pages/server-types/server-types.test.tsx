import { profiles } from '@src/data/api';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { ServerTypes } from './server-types';

describe('ServerTypes', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);
  let originalLocation = '';

  beforeAll(() => {
    mock.reset();
  });

  beforeEach(() => {
    queryClient.clear();
    mock.reset();
    originalLocation = window.location.href;
  });

  afterEach(() => {
    window.location.href = originalLocation;
  });

  // Loading state test
  test('renders a loading message', () => {
    queryClient.isFetching = jest.fn().mockReturnValue(true);
    mock.onGet(new RegExp('/spawner-profiles/')).reply(200, null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServerTypes />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('Loading...');
  });

  // Error state test
  test('renders a message when no servers', () => {
    queryClient.setQueryData(['serverTypes'], null);
    mock.onGet(new RegExp('/server/')).reply(200, null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServerTypes />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No servers available');
  });

  // Servers type test
  test('renders server types correctly', async () => {
    queryClient.setQueryData(['serverTypes'], null);
    mock.onGet(new RegExp('/spawner-profiles/')).reply(200, [
      { slug: 'type1', display_name: 'Small', description: 'Description 1' },
      { slug: 'type2', display_name: 'Small', description: 'Description 2' },
    ]);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServerTypes />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    await waitFor(() => expect(baseElement).toHaveTextContent('Small'));
  });

  test('selects a server type', async () => {
    queryClient.setQueryData(['serverTypes'], profiles);
    mock.onGet(new RegExp('/spawner-profiles/')).reply(200, profiles);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServerTypes />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    await waitFor(() => expect(baseElement).toHaveTextContent('Small'));
    const cards = baseElement.querySelectorAll('.server-type-card');
    if (cards) {
      const radio = cards[0] as HTMLElement;
      radio.click();
    }
  });

  test('simulates loading with error', async () => {
    queryClient.setQueryData(['serverTypes'], null);
    mock
      .onGet(new RegExp('/spawner-profiles/'))
      .reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServerTypes />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement).toHaveTextContent('No servers available');
  });

  test('simulates creating an app', async () => {
    queryClient.setQueryData(['serverTypes'], profiles);
    mock.onGet(new RegExp('/spawner-profiles/')).reply(200, profiles);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServerTypes />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    await waitFor(() => expect(baseElement).toHaveTextContent('Small'));
    const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });
  });

  test('simulates editing an app', async () => {
    const mockSearchParamsGet = jest.spyOn(URLSearchParams.prototype, 'get');
    mockSearchParamsGet.mockReturnValue('app-1');

    queryClient.setQueryData(['serverTypes'], profiles);
    mock.onGet(new RegExp('/spawner-profiles/')).reply(200, profiles);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServerTypes />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    await waitFor(() => expect(baseElement).toHaveTextContent('Small'));
    const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    expect(mockSearchParamsGet).toHaveBeenCalledWith('id');
    mockSearchParamsGet.mockRestore();
  });

  test('clicks back to create app', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServerTypes />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const btn = baseElement.querySelector('#back-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });
    expect(window.location.pathname).toBe('/create-app');
  });

  test('clicks back to edit app', async () => {
    const mockSearchParamsGet = jest.spyOn(URLSearchParams.prototype, 'get');
    mockSearchParamsGet.mockReturnValue('app-1');
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServerTypes />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const btn = baseElement.querySelector('#back-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });
    expect(window.location.pathname).toBe('/edit-app');
    mockSearchParamsGet.mockRestore();
  });

  test('clicks cancel to home', async () => {
    queryClient.setQueryData(['serverTypes'], profiles);
    mock.onGet(new RegExp('/spawner-profiles/')).reply(200, profiles);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServerTypes />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const btn = baseElement.querySelector('#cancel-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });
    expect(window.location.pathname).toBe('/edit-app');
  });
});
