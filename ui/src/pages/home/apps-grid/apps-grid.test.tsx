import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import { AppsGrid } from './apps-grid';

describe('AppsGrid', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);

  beforeEach(() => {
    mock.reset();
  });

  beforeAll(() => {
    process.env.API_BASE_URL = '/api';
  });

  test('renders default apps grid successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h4');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('My Apps');
  });

  test('renders shared apps grid successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsGrid appType="Shared" />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h4');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Shared Apps');
  });

  // test('renders with mocked data', async () => {
  //   mock.onGet(new RegExp('/api/users/*')).reply(200, userData);
  //   const { baseElement } = render(
  //     <RecoilRoot>
  //       <QueryClientProvider client={queryClient}>
  //         <AppsGrid />
  //       </QueryClientProvider>
  //     </RecoilRoot>,
  //   );
  //   await act(async () => {
  //     const apps = baseElement.querySelectorAll('.card');
  //     expect(apps).toHaveLength(1);
  //   });
  // });
});
