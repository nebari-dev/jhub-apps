import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { describe, expect } from 'vitest';
import { Success } from './success';

describe('Success Page', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  const componentWrapper = (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Success />
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );

  test('should render successfully', async () => {
    const { baseElement } = render(componentWrapper);
    await act(async () => {
      expect(baseElement).toBeTruthy();
      expect(baseElement.querySelector('h1')?.textContent).toEqual(
        'App Submitted Successfully!',
      );
    });
  });

  test('should navigate to spawn-pending page', async () => {
    const spy = vi.spyOn(window, 'open');
    const { baseElement } = render(componentWrapper);
    await act(async () => {
      const link = baseElement.querySelector('a');
      expect(link).toBeTruthy();
      if (link) {
        link.click();
        expect(spy).toHaveBeenCalledWith(
          '/hub/spawn-pending/undefined/',
          '_blank',
        );
      }
    });
  });
});
