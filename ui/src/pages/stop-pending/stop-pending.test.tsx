import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { StopPending } from './stop-pending';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const componentWrapper = (
  <RecoilRoot>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StopPending />
      </BrowserRouter>
    </QueryClientProvider>
  </RecoilRoot>
);

describe('StopPending', () => {
  test('should render successfully', async () => {
    const { baseElement } = render(componentWrapper);
    expect(baseElement).toBeTruthy();
    expect(
      screen.getByText(/Thank you for your patience/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /We are stopping your application, you may start it again when we have finished/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.getByText(/You may return to the Application Screen at any time/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Back To Home/i }),
    ).toBeInTheDocument();
  });
});
