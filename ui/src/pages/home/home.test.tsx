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
    // TODO: Update this test when everything is running in single react app
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
    expect(document.location.pathname).toBe('/');
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
    expect(document.location.pathname).toBe('/');
  });

  test('should render with start modal and submit', async () => {
    mock.onPost('/server/test-app-1').reply(200); // Mock the delete API endpoint
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
    expect(document.location.pathname).toBe('/');
  });

  test('should render with start modal and not submit when no current app', async () => {
    mock.onPost(new RegExp('/server/*')).reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartOpen, true);
          set(defaultApp, undefined);
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
    expect(document.location.pathname).toBe('/');
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
    expect(document.location.pathname).toBe('/');
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
    expect(document.location.pathname).toBe('/');
  });

  test('should render with stop modal and submit', async () => {
    mock.onDelete('/server/test-app-1').reply(200); // Mock the stop API endpoint
    const { baseElement, getByText } = render(
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
      const stopModal = within(baseElement).getByTestId('StopModal');
      expect(stopModal).toBeInTheDocument();
    });

    const stopBtn = baseElement.querySelector('#stop-btn') as HTMLButtonElement;
    await act(async () => {
      stopBtn.click();
    });

    await waitFor(() => {
      const snackbar = getByText('Server stopped successfully');
      expect(snackbar).toBeInTheDocument();
    });

    expect(document.location.pathname).toBe('/');
  });

  test('should render with stop modal and not submit when no current app', async () => {
    mock
      .onDelete(new RegExp('/server/*'))
      .reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStopOpen, true);
          set(defaultApp, undefined);
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
      const stopModal = within(baseElement).getByTestId('StopModal');
      expect(stopModal).toBeInTheDocument();
    });

    const stopBtn = baseElement.querySelector('#stop-btn') as HTMLButtonElement;
    await act(async () => {
      stopBtn.click();
    });

    expect(document.location.pathname).toBe('/');
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
      const deleteModal = within(baseElement).getByTestId('DeleteModal');
      expect(deleteModal).toBeInTheDocument();
    });

    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });
    expect(document.location.pathname).toBe('/');
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
      const deleteModal = within(baseElement).getByTestId('DeleteModal');
      expect(deleteModal).toBeInTheDocument();
    });

    const backdrop = baseElement.querySelector(
      '.MuiBackdrop-root',
    ) as HTMLElement;
    await act(async () => {
      backdrop.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with delete modal and submit', async () => {
    mock.onDelete('/server/test-app-1').reply(200); // Mock the delete API endpoint
    const { baseElement, getByText } = render(
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
      const deleteModal = within(baseElement).getByTestId('DeleteModal');
      expect(deleteModal).toBeInTheDocument();
    });

    const deleteBtn = baseElement.querySelector(
      '#delete-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      deleteBtn.click();
    });

    await waitFor(() => {
      const snackbar = getByText('App deleted successfully');
      expect(snackbar).toBeInTheDocument();
    });

    expect(document.location.pathname).toBe('/');
  });

  test('should render with delete modal and not submit when no current app', async () => {
    mock
      .onDelete(new RegExp('/server/*'))
      .reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isDeleteOpen, true);
          set(defaultApp, undefined);
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
      const deleteModal = within(baseElement).getByTestId('DeleteModal');
      expect(deleteModal).toBeInTheDocument();
    });

    const deleteBtn = baseElement.querySelector(
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
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeTruthy();
  });

  test('should render with server not running modal', async () => {
    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => set(isStartNotRunningOpen, true)}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId(
        'StartNotRunningModal',
      );
      expect(startModal).toBeInTheDocument();
    });

    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with server not running modal and submit', async () => {
    mock.onGet('/server/test-app-1').reply(200);
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartNotRunningOpen, true);
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
      const startModal = within(baseElement).getByTestId(
        'StartNotRunningModal',
      );
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = baseElement.querySelector(
      '#start-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with server not running modal for default app and submit', async () => {
    mock.onGet('/server/test-app-1').reply(200);
    const app = { ...apps[0], id: '', name: 'JupyterLab' };
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartNotRunningOpen, true);
          set(defaultApp, app);
          set(defaultUser, currentUser);
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
      const startModal = within(baseElement).getByTestId(
        'StartNotRunningModal',
      );
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = baseElement.querySelector(
      '#start-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with server not running modal for default app and not submit', async () => {
    mock.onGet('/server/test-app-1').reply(200);
    const app = { ...apps[0], id: '', name: 'JupyterLab' };
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartNotRunningOpen, true);
          set(defaultApp, app);
          set(defaultUser, undefined);
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
      const startModal = within(baseElement).getByTestId(
        'StartNotRunningModal',
      );
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = baseElement.querySelector(
      '#start-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with server not running modal and not submit when no current app', async () => {
    mock.onGet(new RegExp('/server/*')).reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(isStartNotRunningOpen, true);
          set(defaultApp, undefined);
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
      const startModal = within(baseElement).getByTestId(
        'StartNotRunningModal',
      );
      expect(startModal).toBeInTheDocument();
    });

    const startBtn = baseElement.querySelector(
      '#start-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
    expect(document.location.pathname).toBe('/');
  });

  test('should render with start modal and submit with success snackbar', async () => {
    mock.onPost('/server/test-app-1').reply(200); // Mock the start API endpoint
  
    const { baseElement, getByText } = render(
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
  
    const startBtn = baseElement.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
  
    await waitFor(() => {
      const snackbar = getByText('App started successfully');
      expect(snackbar).toBeInTheDocument();
    });
  });

  test('should render with stop modal and submit with success snackbar', async () => {
    mock.onDelete('/server/test-app-1').reply(200); // Mock the stop API endpoint
  
    const { baseElement, getByText } = render(
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
      const stopModal = within(baseElement).getByTestId('StopModal');
      expect(stopModal).toBeInTheDocument();
    });
  
    const stopBtn = baseElement.querySelector('#stop-btn') as HTMLButtonElement;
    await act(async () => {
      stopBtn.click();
    });
  
    await waitFor(() => {
      const snackbar = getByText('Server stopped successfully');
      expect(snackbar).toBeInTheDocument();
    });
  });
  test('should render with delete modal and submit with success snackbar', async () => {
    mock.onDelete('/server/test-app-1').reply(200); // Mock the delete API endpoint
  
    const { baseElement, getByText } = render(
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
      const deleteModal = within(baseElement).getByTestId('DeleteModal');
      expect(deleteModal).toBeInTheDocument();
    });
  
    const deleteBtn = baseElement.querySelector('#delete-btn') as HTMLButtonElement;
    await act(async () => {
      deleteBtn.click();
    });
  
    await waitFor(() => {
      const snackbar = getByText('App deleted successfully');
      expect(snackbar).toBeInTheDocument();
    });
  });

  test('should show 403 error snackbar when trying to start a shared app', async () => {
    mock.onPost('/server/test-app-1').reply(403); // Mocking 403 Forbidden for shared app

    const { baseElement, getByText } = render(
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
          }); // App is shared
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    // Modal should be present
    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('StartModal');
      expect(startModal).toBeInTheDocument();
    });

    // Simulate clicking the Start button
    const startBtn = baseElement.querySelector('#start-btn') as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });

    // Expect the snackbar to display the 403 Forbidden error message
    await waitFor(() => {
      const snackbar = getByText(/You don't have permission to start this app. Please ask the owner to start it./);
      expect(snackbar).toBeInTheDocument();
    });
  });
  test('should show 403 error snackbar when trying to stop a shared app', async () => {
    mock.onDelete('/server/test-app-1').reply(403); // Mocking 403 Forbidden for shared app

    const { baseElement, getByText } = render(
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
          }); // App is shared
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    // Modal should be present
    await waitFor(() => {
      const stopModal = within(baseElement).getByTestId('StopModal');
      expect(stopModal).toBeInTheDocument();
    });

    // Simulate clicking the Stop button
    const stopBtn = baseElement.querySelector('#stop-btn') as HTMLButtonElement;
    await act(async () => {
      stopBtn.click();
    });

    // Expect the snackbar to display the 403 Forbidden error message
    await waitFor(() => {
      const snackbar = getByText(/You don't have permission to stop this app. Please ask the owner/);
      expect(snackbar).toBeInTheDocument();
    });
  });
  
  
});
