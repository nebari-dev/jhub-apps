import { app, apps } from '@src/data/api';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
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

  // /////////////////////////// ERROR MESSAGING ///////////////////////////
  // test('simulates starting an app with a 403 error', async () => {
  //   mock.onPost('/server/test-app-1').reply(403, {
  //     detail: 'You don\'t have permission to perform this action.',
  //   });
  //   const { baseElement, getByText } = render(
  //     <RecoilRoot
  //       initializeState={({ set }) => {
  //         set(isStartOpen, true);
  //         set(defaultApp, apps[0]);
  //       }}
  //     >
  //       <QueryClientProvider client={queryClient}>
  //         <BrowserRouter>
  //           <Home />
  //         </BrowserRouter>
  //       </QueryClientProvider>
  //     </RecoilRoot>,
  //   );
  
  //   await waitFor(() => {
  //     const startModal = within(baseElement).getByTestId('StartModal');
  //     expect(startModal).toBeInTheDocument();
  //   });
  
  //   const startBtn = baseElement.querySelector('#start-btn') as HTMLButtonElement;
  //   await act(async () => {
  //     startBtn.click();
  //   });
  
  //   await waitFor(() => {
  //     const snackbar = getByText('Access denied. You don\'t have permission to perform this action.');
  //     expect(snackbar).toBeInTheDocument();
  //   });
  // });
  
  // test('simulates starting an app with a 404 error', async () => {
  //   mock.onPost('/server/test-app-1').reply(404, {
  //     detail: 'Resource not found.',
  //   });
  //   const { baseElement, getByText } = render(
  //     <RecoilRoot
  //       initializeState={({ set }) => {
  //         set(isStartOpen, true);
  //         set(defaultApp, apps[0]);
  //       }}
  //     >
  //       <QueryClientProvider client={queryClient}>
  //         <BrowserRouter>
  //           <Home />
  //         </BrowserRouter>
  //       </QueryClientProvider>
  //     </RecoilRoot>,
  //   );
  
  //   await waitFor(() => {
  //     const startModal = within(baseElement).getByTestId('StartModal');
  //     expect(startModal).toBeInTheDocument();
  //   });
  
  //   const startBtn = baseElement.querySelector('#start-btn') as HTMLButtonElement;
  //   await act(async () => {
  //     startBtn.click();
  //   });
  
  //   await waitFor(() => {
  //     const snackbar = getByText('Resource not found:');
  //     expect(snackbar).toBeInTheDocument();
  //   });
  // });
  
  // test('simulates starting an app with a network error', async () => {
  //   mock.onPost('/server/test-app-1').networkError();
  //   const { baseElement, getByText } = render(
  //     <RecoilRoot
  //       initializeState={({ set }) => {
  //         set(isStartOpen, true);
  //         set(defaultApp, apps[0]);
  //       }}
  //     >
  //       <QueryClientProvider client={queryClient}>
  //         <BrowserRouter>
  //           <Home />
  //         </BrowserRouter>
  //       </QueryClientProvider>
  //     </RecoilRoot>,
  //   );
  
  //   await waitFor(() => {
  //     const startModal = within(baseElement).getByTestId('StartModal');
  //     expect(startModal).toBeInTheDocument();
  //   });
  
  //   const startBtn = baseElement.querySelector('#start-btn') as HTMLButtonElement;
  //   await act(async () => {
  //     startBtn.click();
  //   });
  
  //   await waitFor(() => {
  //     const snackbar = getByText('An unexpected error occurred. Please check your connection.');
  //     expect(snackbar).toBeInTheDocument();
  //   });
  // });

  // test.only('simulates starting an app with a 500 error', async () => {
  //   // Reset and ensure no previous responses interfere
  //   mock.resetHandlers();
    
  //   // Mock the POST request to return a 500 error
  //   mock.onPost('/server/test-app-1').reply(500, { detail: 'Internal server error' });
  
  //   // Render the Home component with the necessary context and state
  //   const { baseElement, getByTestId } = render(
  //     <RecoilRoot
  //       initializeState={({ set }) => {
  //         set(isStartOpen, true);
  //         set(defaultApp, apps[0]);
  //       }}
  //     >
  //       <QueryClientProvider client={queryClient}>
  //         <BrowserRouter>
  //           <Home />
  //         </BrowserRouter>
  //       </QueryClientProvider>
  //     </RecoilRoot>,
  //   );
  
  //   // Find the Start button in the modal and click it
  //   const startBtn = baseElement.querySelector('#start-btn') as HTMLButtonElement;
  //   expect(startBtn).toBeInTheDocument();
  //   await act(async () => {
  //     startBtn.click();
  //   });
  
  //   // Wait for the Snackbar to appear and log the output
  //   await waitFor(() => {
  //     const snackbar = getByTestId('snackbar-id');
  //     console.log('Snackbar found:', snackbar.textContent); // Log the Snackbar content
  //     expect(snackbar).toHaveTextContent(/internal server error/i);
  //   });
  // });
  
 

  // test('simulates starting an app with a 500 error', async () => {
  //   // Mock API response to include apps
  //   mock.onGet('/api/apps').reply(200, { apps: [{ id: 'test-app-1', name: 'Test App 1' }] });
  
  //   // Mock API throws a 500 error
  //   mock.onPost('/api/apps/start').reply(500, { detail: 'Internal server error' });
  
  //   render(
  //     <RecoilRoot>
  //       <QueryClientProvider client={queryClient}>
  //         <BrowserRouter>
  //           <Home />
  //         </BrowserRouter>
  //       </QueryClientProvider>
  //     </RecoilRoot>,
  //   );
  
  //   // Ensure the "Deploy App" button is clicked
  //   const startButton = await screen.findByText('Deploy App');
  //   fireEvent.click(startButton);
  

  //   screen.debug();
  
  //   // Ensure the modal opens
  //   const startModal = await screen.findByTestId('StartModal');
  //   expect(startModal).toBeInTheDocument();
  
  //   // Simulate the 500 error and verify the error message
  //   await waitFor(() => expect(screen.getByText(/internal server error/i)).toBeInTheDocument());
  // });
  
  
  
  
  
  
  
  
  
});
