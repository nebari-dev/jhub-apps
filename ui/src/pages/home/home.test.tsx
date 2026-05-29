import { Toaster } from '@src/components/ui/sonner';
import { app, apps } from '@src/data/api';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  currentUser as defaultUser,
  isDeleteOpen,
  isStartNotRunningOpen,
  isStartOpen,
  isStopOpen,
} from '../../../src/store';
import { Home } from './home';

describe('Home', () => {
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

  beforeEach(() => {
    queryClient.clear();
    mock.reset();
    sessionStorage.clear();
  });

  const componentWrapper = (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Home />
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { assign: vi.fn() },
    });
  });

  test('should render successfully', async () => {
    const { baseElement } = render(componentWrapper);
    await act(async () => {
      expect(baseElement).toBeTruthy();
      expect(baseElement.querySelector('h1')?.textContent).toEqual('Home');
    });
  });

  test('should render Deploy app button and respond to click events', async () => {
    const { getByText } = render(componentWrapper);
    await act(async () => {
      const button = getByText('Deploy App');
      expect(button).toBeTruthy();
      fireEvent.click(button);
    });
    expect(window.location.pathname).not.toBe('/create-app');
  });

  test('should render ServicesGrid and AppsGrid', async () => {
    const { getByText } = render(componentWrapper);
    await act(async () => {
      expect(getByText('Quick Access')).toBeTruthy();
      expect(getByText('App Library')).toBeTruthy();
    });
  });

  test('should render with start modal', async () => {
    render(
      <RecoilRoot initializeState={({ set }) => set(isStartOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId('StartModal');
      expect(startModal).toBeInTheDocument();
    });

    const cancelBtn = document.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with start modal and click away', async () => {
    render(
      <RecoilRoot initializeState={({ set }) => set(isStartOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId('StartModal');
      expect(startModal).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.keyDown(document.body, { key: 'Escape' });
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with start modal and submit', async () => {
    mock.onPost('/server/test-app-1').reply(200);
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartOpen, true);
          set(defaultApp, apps[0]);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId('StartModal');
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = document.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with start modal and not submit when no current app', async () => {
    mock.onPost(new RegExp('/server/*')).reply(500, { message: 'Some error' });
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartOpen, true);
          set(defaultApp, undefined);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId('StartModal');
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = document.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with stop modal', async () => {
    render(
      <RecoilRoot initializeState={({ set }) => set(isStopOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId('StopModal');
      expect(startModal).toBeInTheDocument();
    });

    const cancelBtn = document.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with stop modal and click away', async () => {
    render(
      <RecoilRoot initializeState={({ set }) => set(isStopOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId('StopModal');
      expect(startModal).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.keyDown(document.body, { key: 'Escape' });
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with stop modal and submit', async () => {
    mock.onDelete('/server/test-app-1').reply(200);
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStopOpen, true);
          set(defaultApp, apps[0]);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const stopModal = within(document.body).getByTestId('StopModal');
      expect(stopModal).toBeInTheDocument();
    });

    const stopBtn = document.querySelector('#stop-btn') as HTMLButtonElement;
    await act(async () => {
      stopBtn.click();
    });

    await waitFor(() => {
      expect(
        within(document.body).getByText('Server stopped successfully'),
      ).toBeInTheDocument();
    });

    expect(document.location.pathname).toBe('/');
  });

  test('should render with stop modal and not submit when no current app', async () => {
    mock
      .onDelete(new RegExp('/server/*'))
      .reply(500, { message: 'Some error' });
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStopOpen, true);
          set(defaultApp, undefined);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const stopModal = within(document.body).getByTestId('StopModal');
      expect(stopModal).toBeInTheDocument();
    });

    const stopBtn = document.querySelector('#stop-btn') as HTMLButtonElement;
    await act(async () => {
      stopBtn.click();
    });

    expect(document.location.pathname).toBe('/');
  });

  test('should render with delete modal', async () => {
    render(
      <RecoilRoot initializeState={({ set }) => set(isDeleteOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const deleteModal = within(document.body).getByTestId('DeleteModal');
      expect(deleteModal).toBeInTheDocument();
    });

    const cancelBtn = document.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with delete modal and click away', async () => {
    render(
      <RecoilRoot initializeState={({ set }) => set(isDeleteOpen, true)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const deleteModal = within(document.body).getByTestId('DeleteModal');
      expect(deleteModal).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.keyDown(document.body, { key: 'Escape' });
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with delete modal and submit', async () => {
    mock.onDelete('/server/test-app-1').reply(200);
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isDeleteOpen, true);
          set(defaultApp, apps[0]);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const deleteModal = within(document.body).getByTestId('DeleteModal');
      expect(deleteModal).toBeInTheDocument();
    });

    const deleteBtn = document.querySelector(
      '#delete-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      deleteBtn.click();
    });

    await waitFor(() => {
      expect(
        within(document.body).getByText('App deleted successfully'),
      ).toBeInTheDocument();
    });

    expect(document.location.pathname).toBe('/');
  });

  test('should render with delete modal and not submit when no current app', async () => {
    mock
      .onDelete(new RegExp('/server/*'))
      .reply(500, { message: 'Some error' });
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isDeleteOpen, true);
          set(defaultApp, undefined);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const deleteModal = within(document.body).getByTestId('DeleteModal');
      expect(deleteModal).toBeInTheDocument();
    });

    const deleteBtn = document.querySelector(
      '#delete-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      deleteBtn.click();
    });

    expect(document.location.pathname).toBe('/');
  });

  test('renders with server not running modal startAppId', async () => {
    sessionStorage.setItem('startAppId', 'test-app-1');
    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    queryClient.setQueryData(['app-form'], app);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <Home />
          <Toaster />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeTruthy();
  });

  test('should render with server not running modal', async () => {
    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    render(
      <RecoilRoot
        initializeState={({ set }) => set(isStartNotRunningOpen, true)}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId(
        'StartNotRunningModal',
      );
      expect(startModal).toBeInTheDocument();
    });

    const cancelBtn = document.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with server not running modal and submit', async () => {
    mock.onGet('/server/test-app-1').reply(200);
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartNotRunningOpen, true);
          set(defaultApp, apps[0]);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId(
        'StartNotRunningModal',
      );
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = document.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with server not running modal for default app and submit', async () => {
    mock.onGet('/server/test-app-1').reply(200);
    const defaultAppData = { ...apps[0], id: '', name: 'JupyterLab' };
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartNotRunningOpen, true);
          set(defaultApp, defaultAppData);
          set(defaultUser, currentUser);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId(
        'StartNotRunningModal',
      );
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = document.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with server not running modal for default app and not submit', async () => {
    mock.onGet('/server/test-app-1').reply(200);
    const defaultAppData = { ...apps[0], id: '', name: 'JupyterLab' };
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartNotRunningOpen, true);
          set(defaultApp, defaultAppData);
          set(defaultUser, undefined);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId(
        'StartNotRunningModal',
      );
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = document.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with server not running modal and not submit when no current app', async () => {
    mock.onGet(new RegExp('/server/*')).reply(500, { message: 'Some error' });
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartNotRunningOpen, true);
          set(defaultApp, undefined);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId(
        'StartNotRunningModal',
      );
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = document.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with start modal and submit with success snackbar', async () => {
    mock.onPost('/server/test-app-1').reply(200);

    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartOpen, true);
          set(defaultApp, apps[0]);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId('StartModal');
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = document.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });

    await waitFor(() => {
      expect(
        within(document.body).getByText('App started successfully'),
      ).toBeInTheDocument();
    });
  });

  test('should render with stop modal and submit with success snackbar', async () => {
    mock.onDelete('/server/test-app-1').reply(200);

    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStopOpen, true);
          set(defaultApp, apps[0]);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const stopModal = within(document.body).getByTestId('StopModal');
      expect(stopModal).toBeInTheDocument();
    });

    const stopBtn = document.querySelector('#stop-btn') as HTMLButtonElement;
    await act(async () => {
      stopBtn.click();
    });

    await waitFor(() => {
      expect(
        within(document.body).getByText('Server stopped successfully'),
      ).toBeInTheDocument();
    });
  });

  test('should render with delete modal and submit with success snackbar', async () => {
    mock.onDelete('/server/test-app-1').reply(200);

    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isDeleteOpen, true);
          set(defaultApp, apps[0]);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const deleteModal = within(document.body).getByTestId('DeleteModal');
      expect(deleteModal).toBeInTheDocument();
    });

    const deleteBtn = document.querySelector(
      '#delete-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      deleteBtn.click();
    });

    await waitFor(() => {
      expect(
        within(document.body).getByText('App deleted successfully'),
      ).toBeInTheDocument();
    });
  });

  test('should show 403 error snackbar when trying to start a shared app', async () => {
    mock.onPost('/server/test-app-1').reply(403);

    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartOpen, true);
          set(defaultApp, {
            id: 'test-app-1',
            name: 'Test App',
            framework: 'JupyterLab',
            url: 'https://example.com',
            ready: true,
            public: false,
            shared: true,
            last_activity: new Date(),
            status: 'Ready',
          });
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(document.body).getByTestId('StartModal');
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = document.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });

    await waitFor(() => {
      expect(
        within(document.body).getByText(
          /You don't have permission to start this app. Please ask the owner to start it./,
        ),
      ).toBeInTheDocument();
    });
  });

  test('should show 403 error snackbar when trying to stop a shared app', async () => {
    mock.onDelete('/server/test-app-1').reply(403);

    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStopOpen, true);
          set(defaultApp, {
            id: 'test-app-1',
            name: 'Test App',
            framework: 'JupyterLab',
            url: 'https://example.com',
            ready: true,
            public: false,
            shared: true,
            last_activity: new Date(),
            status: 'Running',
          });
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const stopModal = within(document.body).getByTestId('StopModal');
      expect(stopModal).toBeInTheDocument();
    });

    const stopBtn = document.querySelector('#stop-btn') as HTMLButtonElement;
    await act(async () => {
      stopBtn.click();
    });

    await waitFor(() => {
      expect(
        within(document.body).getByText(
          /You don't have permission to stop this app. Please ask the owner/,
        ),
      ).toBeInTheDocument();
    });
  });

  test('should include creator name as query parameter when starting app', async () => {
    const creatorName = 'userx';
    const appId = 'test-app-1';

    mock.onPost(`/server/${appId}`).reply((config) => {
      expect(config.params.owner).toBe(creatorName);
      return [200];
    });

    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartOpen, true);
          set(defaultApp, {
            id: appId,
            full_name: `${creatorName}/my-panel-app-git-86d9635`,
            name: 'Test App',
            framework: 'JupyterLab',
            url: 'https://example.com',
            ready: true,
            public: false,
            shared: false,
            last_activity: new Date(),
            status: 'Ready',
          });
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const startBtn = document.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
  });
});
