import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, fireEvent, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { Home } from './home';

describe('Home', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  const componentWrapper = (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { assign: jest.fn() },
    });
  });

  test('should render successfully', async () => {
    const { baseElement } = render(componentWrapper);
    await act(async () => {
      expect(baseElement).toBeTruthy();
      expect(baseElement.querySelector('h1')?.textContent).toEqual('Home');
    });
  });

  test('should render create app button and respond to click events', async () => {
    const { getByText } = render(componentWrapper);
    await act(async () => {
      const button = getByText('Create App');
      expect(button).toBeTruthy();
      fireEvent.click(button);
    });
    // TODO: Update this test when everything is running in single react app
    expect(window.location.pathname).not.toBe('/create-app');
  });

  test('should render ServicesGrid and AppsGrid', async () => {
    const { getByText } = render(componentWrapper);
    await act(async () => {
      expect(getByText('Services')).toBeTruthy();
      expect(getByText('Apps')).toBeTruthy();
    });
  });
});
