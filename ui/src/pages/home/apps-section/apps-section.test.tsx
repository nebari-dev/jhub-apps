import { serverApps } from '@src/data/api';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, fireEvent, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import { currentUser as defaultUser } from '../../../store';
import { AppsSection } from './apps-section';

describe('AppsSection', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  beforeEach(() => {
    queryClient.clear();
    mock.reset();
  });

  test('renders default apps grid successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h2');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Apps');
  });

  test('renders with mocked data', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['app-state'], serverApps);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelectorAll('.card')).toHaveLength(5);
  });

  test('renders a message when no apps', () => {
    queryClient.setQueryData(['app-state'], null);
    mock.onGet(new RegExp('/server/')).reply(200, null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No apps available');
  });

  test('renders a loading message', () => {
    queryClient.isFetching = jest.fn().mockReturnValue(true);
    mock.onGet(new RegExp('/server/')).reply(200, null);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('Loading...');
  });

  test('renders with data error', async () => {
    queryClient.setQueryData(['app-state'], null);
    mock.onGet().reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No apps available');
  });

  test('should search apps', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['app-state'], serverApps);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsSection />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const input = baseElement.querySelector('#search') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'test' } });
    });
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'cras' } });
    });
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'panel' } });
    });
    const cards = baseElement.querySelectorAll('.card');
    expect(cards).toHaveLength(2);
  });
});
