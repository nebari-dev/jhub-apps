import { apps } from '@src/data/api';
import { serviceApps } from '@src/data/jupyterhub';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { ServiceGrid } from './service-grid';

describe('ServiceGrid', () => {
  const queryClient = new QueryClient();
  test('should render successfully', async () => {
    const { baseElement } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ServiceGrid services={[]} apps={[]} />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    await act(async () => {
      expect(baseElement).toBeTruthy();
    });
  });

  test('should render with mock data', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ServiceGrid services={serviceApps} apps={apps} />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    await act(async () => {
      const cards = baseElement.querySelectorAll('.card');
      expect(cards).toHaveLength(apps.length + serviceApps.length);
    });
  });
});
