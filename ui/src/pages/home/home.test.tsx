import { apps } from '@src/data/api';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import {
  currentApp as defaultApp,
  isDeleteOpen,
  isStartOpen,
  isStopOpen,
} from '../../../src/store';
import { Home } from './home';

describe('Home', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  beforeEach(() => {
    queryClient.clear();
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

  test('should render with start modal', async () => {
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(isStartOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('StartModal');
      expect(startModal).toBeInTheDocument();
    });

    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });
  });

  test('should render with start modal and click away', async () => {
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(isStartOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('StartModal');
      expect(startModal).toBeInTheDocument();
    });

    const backdrop = baseElement.querySelector(
      '.MuiBackdrop-root',
    ) as HTMLElement;
    await act(async () => {
      backdrop.click();
    });
  });

  test('should render with start modal and submit', async () => {
    mock.onPost(`/server/test-app-1`).reply(200); // Mock the delete API endpoint
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartOpen, true);
          set(defaultApp, apps[0]);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('StartModal');
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = baseElement.querySelector(
      '#start-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
  });

  test('should render with stop modal', async () => {
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(isStopOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('StopModal');
      expect(startModal).toBeInTheDocument();
    });

    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });
  });

  test('should render with stop modal and click away', async () => {
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(isStopOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('StopModal');
      expect(startModal).toBeInTheDocument();
    });

    const backdrop = baseElement.querySelector(
      '.MuiBackdrop-root',
    ) as HTMLElement;
    await act(async () => {
      backdrop.click();
    });
  });

  test('should render with stop modal and submit', async () => {
    mock.onPost(`/server/test-app-1/stop`).reply(200); // Mock the delete API endpoint
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStopOpen, true);
          set(defaultApp, apps[0]);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('StopModal');
      expect(startModal).toBeInTheDocument();
    });

    const stopBtn = baseElement.querySelector('#stop-btn') as HTMLButtonElement;
    await act(async () => {
      stopBtn.click();
    });
  });

  test('should render with delete modal', async () => {
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(isDeleteOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('DeleteModal');
      expect(startModal).toBeInTheDocument();
    });

    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });
  });

  test('should render with delete modal and click away', async () => {
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(isDeleteOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('DeleteModal');
      expect(startModal).toBeInTheDocument();
    });

    const backdrop = baseElement.querySelector(
      '.MuiBackdrop-root',
    ) as HTMLElement;
    await act(async () => {
      backdrop.click();
    });
  });

  test('should render with delete modal and submit', async () => {
    mock.onDelete(`/server/test-app-1`).reply(200); // Mock the delete API endpoint
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isDeleteOpen, true);
          set(defaultApp, apps[0]);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('DeleteModal');
      expect(startModal).toBeInTheDocument();
    });

    const deleteBtn = baseElement.querySelector(
      '#delete-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      deleteBtn.click();
    });
  });
});
