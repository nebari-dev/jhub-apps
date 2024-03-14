import { servicesFull } from '@src/data/jupyterhub';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { Navigation } from '..';
import { currentUser as defaultUser } from '../../store';

describe('Navigation', () => {
  const queryClient = new QueryClient();
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

    expect(baseElement.querySelector('.MuiToolbar-root')).toBeTruthy();
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

    expect(baseElement.querySelector('.MuiDrawer-root')).toBeTruthy();
    expect(baseElement.querySelectorAll('.MuiListItem-root')).not.toHaveLength(
      0,
    );
  });
});
