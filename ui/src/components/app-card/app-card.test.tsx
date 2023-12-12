import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { AppCard } from './app-card';

describe('AppCard', () => {
  const queryClient = new QueryClient();

  test('renders default app card successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="card-1"
            title="Card 1"
            framework="Some Framework"
            url="/some-url"
            ready={false}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h3');
    expect(header).toHaveTextContent('Card 1');
  });

  test('renders app card with thumbnail', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="card-1"
            title="Card 1"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            ready={true}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h3');
    expect(header).toHaveTextContent('Card 1');
    const img = baseElement.querySelector('img');
    expect(img).toHaveAttribute('src', '/some-thumbnail.png');
  });
});
