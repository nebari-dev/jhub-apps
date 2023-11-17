import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { AppsGrid } from './apps-grid';

describe('AppsGrid', () => {
  const queryClient = new QueryClient();

  test('renders default apps grid successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h3');

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
    const header = baseElement.querySelector('h3');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Shared Apps');
  });
});
