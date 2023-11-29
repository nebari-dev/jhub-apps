import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { Home } from './home';

describe('Home', () => {
  const queryClient = new QueryClient();

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

      const assignSpy = jest
        .spyOn(window.location, 'assign')
        .mockImplementation(() => {});
      fireEvent.click(button);
      expect(assignSpy).toHaveBeenCalledWith('/services/japps/create-app');
      assignSpy.mockRestore();
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
