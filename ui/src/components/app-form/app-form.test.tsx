import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { AppForm } from '..';

describe('AppForm', () => {
  const queryClient = new QueryClient();
  const componentWrapper = (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <AppForm />
      </QueryClientProvider>
    </RecoilRoot>
  );

  test('renders successfully', () => {
    const { baseElement } = render(componentWrapper);
    expect(baseElement.querySelector('div')).toBeTruthy();
  });
});
