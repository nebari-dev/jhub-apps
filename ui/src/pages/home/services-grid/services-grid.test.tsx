import { servicesFull } from '@src/data/jupyterhub';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/jupyterhub-axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import { currentUser as defaultUser } from '../../../store';
import { ServicesGrid } from './services-grid';

describe('ServicesGrid', () => {
  const queryClient = new QueryClient();
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
          <ServicesGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h2');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Services');
  });

  test('renders a message when no services', () => {
    queryClient.setQueryData(['service-data'], null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ServicesGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No services available');
  });

  test('renders a loading message', () => {
    queryClient.isFetching = jest.fn().mockReturnValue(true);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ServicesGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('Loading...');
  });

  test('renders with mocked data', async () => {
    mock.onGet(new RegExp('/services')).reply(200, servicesFull);
    queryClient.setQueryData(['service-data'], servicesFull);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <ServicesGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelectorAll('button')).toHaveLength(2);
  });

  test('handles button click for external URL', () => {
    const mockResponse = jest.fn();
    Object.defineProperty(window, 'open', {
      value: mockResponse,
      writable: true,
    });

    mock.onGet(new RegExp('/services')).reply(200, servicesFull);
    queryClient.setQueryData(['service-data'], servicesFull);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <ServicesGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const button = baseElement.querySelectorAll(
      'button',
    )[0] as HTMLButtonElement;
    fireEvent.click(button);
  });

  test('handles button click for internal URL', () => {
    const mockResponse = jest.fn();
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

    mock.onGet(new RegExp('/services')).reply(200, servicesFull);
    queryClient.setQueryData(['service-data'], servicesFull);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <ServicesGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const button = baseElement.querySelectorAll(
      'button',
    )[1] as HTMLButtonElement;
    fireEvent.click(button);
  });
});
