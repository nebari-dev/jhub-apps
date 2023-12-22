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
    const { baseElement, getByText } = render(componentWrapper);
    await act(async () => {
      const button = getByText('Create App');
      expect(button).toBeTruthy();
      fireEvent.click(button);
    });
    const modalHeader = baseElement.querySelector('h5');
    expect(modalHeader).toHaveTextContent('Create New App');

    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });
  });

  test('should render notification when present', async () => {
    const mockNotification = 'Test notification';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const recoilStateSpy = jest.spyOn(require('recoil'), 'useRecoilState');
    recoilStateSpy.mockReturnValue([mockNotification, jest.fn()]);

    const { getByText } = render(componentWrapper);
    await act(async () => {
      expect(getByText(mockNotification)).toBeTruthy();
    });

    recoilStateSpy.mockRestore();
  });

  test('should render ServicesGrid and AppsGrid', async () => {
    const { getByText } = render(componentWrapper);
    await act(async () => {
      expect(getByText('Services')).toBeTruthy();
      expect(getByText('My Apps')).toBeTruthy();
    });
  });

  test('should update search value on input change', async () => {
    const { getByPlaceholderText } = render(componentWrapper);
    await act(async () => {
      const searchInput = getByPlaceholderText('Search...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      expect(searchInput.value).toBe('Test');
    });
  });
});
