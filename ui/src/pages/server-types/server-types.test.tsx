import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
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
          <ServerTypes />
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
          <ServerTypes />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No servers available');
  });

  // Servers type test
  test('renders server types correctly', async () => {
    mock.onGet(new RegExp('/spawner-profiles/')).reply(200, [
      { slug: 'type1', display_name: 'Small', description: 'Description 1' },
      { slug: 'type2', display_name: 'Small', description: 'Description 2' },
    ]);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ServerTypes />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    await waitFor(() => expect(baseElement).toHaveTextContent('Small'));
  });
});
