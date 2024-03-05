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

  beforeAll(() => {
    mock.reset();
  });

  beforeEach(() => {
    queryClient.clear();
    mock.reset();
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
    const radios = baseElement.querySelectorAll('input[type="radio"]');
    if (radios) {
      const radio = radios[0] as HTMLInputElement;
      radio.click();
    }
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
});
