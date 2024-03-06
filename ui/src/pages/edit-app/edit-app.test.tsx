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

  test('simulates editing an app', async () => {
    const mockSearchParamsGet = jest.spyOn(URLSearchParams.prototype, 'get');
    mockSearchParamsGet.mockReturnValue('app-1');

    render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <EditApp />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(mockSearchParamsGet).toHaveBeenCalledWith('id');
  });

  test('clicks back to home', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <EditApp />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const btn = baseElement.querySelector('#back-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });
    expect(window.location.pathname).toBe('/');
  });
});
