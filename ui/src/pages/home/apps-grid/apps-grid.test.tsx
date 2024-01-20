import { serverApps } from '@src/data/api';
import { jhData } from '@src/data/jupyterhub';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import { currentJhData } from '../../../store';
import { AppsGrid } from './apps-grid';

describe('AppsGrid', () => {
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
          <AppsGrid filter="" />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h2');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('My Apps');
  });

  test('renders shared apps grid successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsGrid appType="Shared" filter="" />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h2');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Shared Apps');
  });

  test('renders a message when no apps and filter', () => {
    queryClient.setQueryData(['app-state'], null);
    mock.onGet(new RegExp('/server/')).reply(200, null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsGrid filter="test" />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No apps available');
  });

  test('renders a loading message', () => {
    queryClient.isFetching = jest.fn().mockReturnValue(true);
    mock.onGet(new RegExp('/server/')).reply(200, null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsGrid filter="test" />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('Loading...');
  });

  test('renders with mocked data', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['app-state'], serverApps);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(currentJhData, jhData)}>
        <QueryClientProvider client={queryClient}>
          <AppsGrid filter="" />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelectorAll('.card')).toHaveLength(5);
  });

  test('renders with mocked data and filter', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['app-state'], serverApps);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(currentJhData, jhData)}>
        <QueryClientProvider client={queryClient}>
          <AppsGrid filter="panel" />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelectorAll('.card')).toHaveLength(1);
  });

  test('renders with data error', async () => {
    queryClient.setQueryData(['app-state'], null);
    mock.onGet().reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsGrid filter="test" />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No apps available');
  });
});
