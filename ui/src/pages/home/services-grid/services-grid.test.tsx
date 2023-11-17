import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { ServicesGrid } from './services-grid';

describe('ServicesGrid', () => {
  const queryClient = new QueryClient();

  test('renders a default grid successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ServicesGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h3');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Services');
  });

  test('renders a message when no services', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ServicesGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No services available');
  });
});
