import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { EditApp } from './edit-app';

describe('EditApp', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  const componentWrapper = (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EditApp />
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );

  test('should render successfully', async () => {
    const { baseElement } = render(componentWrapper);
    await act(async () => {
      expect(baseElement).toBeTruthy();
      expect(baseElement.querySelector('h1')?.textContent).toEqual('Edit app');
    });
  });
});
