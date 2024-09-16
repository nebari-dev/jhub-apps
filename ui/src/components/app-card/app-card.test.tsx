import { app, environments, frameworks, profiles } from '@src/data/api';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import AppCard from './app-card';

describe('AppCard', () => {
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
  });

  test('renders default app card successfully', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            serverStatus="ready"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeInTheDocument();
  });

  test('renders default app card not ready', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            serverStatus="Pending"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeInTheDocument();
    const appLabel = baseElement.querySelector('.MuiTypography-h5');
    expect(appLabel).toHaveTextContent('Test App');
    expect(baseElement).toHaveTextContent('Pending');
  });

  test('renders default app card with no server status', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            serverStatus=""
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeInTheDocument();
    const appLabel = baseElement.querySelector('.MuiTypography-h5');
    expect(appLabel).toHaveTextContent('Test App');
  });

  test('renders service card', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            serverStatus="Ready"
            isAppCard={false}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeInTheDocument();
    const appLabel = baseElement.querySelector('.MuiTypography-h5');
    expect(appLabel).toHaveTextContent('Test App');
    const author = baseElement.querySelector('.MuiTypography-body2');
    expect(author).not.toHaveTextContent('Developer');
  });

  test('renders app card with thumbnail and description', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            serverStatus="Ready"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const appLabel = baseElement.querySelector('.MuiTypography-h5');
    expect(appLabel).toHaveTextContent('Test App');
    const img = baseElement.querySelector('img');
    expect(img).toHaveAttribute('src', '/some-thumbnail.png');
    const body = baseElement.querySelector('.card-description');
    expect(body).toHaveTextContent('Some app description');
  });

  test('simulates canceling starting an app', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            serverStatus="Ready"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.MuiButtonBase-root',
    )[0] as HTMLButtonElement;
    expect(menu).toBeInTheDocument();
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.MuiList-root li.MuiButtonBase-root',
    )[0] as HTMLAnchorElement;
    expect(btn).toBeInTheDocument();
    await act(async () => {
      btn.click();
    });
  });

  test('simulates starting an app', async () => {
    mock.onPost().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            serverStatus="Ready"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.MuiButtonBase-root',
    )[0] as HTMLButtonElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.MuiList-root li.MuiButtonBase-root',
    )[0] as HTMLAnchorElement;
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Start');
    expect(btn).not.toHaveAttribute('disabled', 'disabled');
    await act(async () => {
      btn.click();
    });

    // Start
    const startBtn = await waitFor(
      () => baseElement.querySelector('#start-btn') as HTMLButtonElement,
    );

    if (startBtn !== null) {
      await act(async () => {
        startBtn.click();
      });
    }
  });

  test('simulates canceling stopping an app', async () => {
    mock.onDelete().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            serverStatus="Running"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.MuiButtonBase-root',
    )[0] as HTMLButtonElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.MuiList-root li.MuiButtonBase-root',
    )[1] as HTMLAnchorElement;
    await act(async () => {
      btn.click();
    });
  });

  test('simulates stopping an app', async () => {
    mock.onDelete().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            serverStatus="Running"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.MuiButtonBase-root',
    )[0] as HTMLButtonElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.MuiList-root li.MuiButtonBase-root',
    )[1] as HTMLAnchorElement;
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Stop');
    expect(btn).not.toHaveAttribute('disabled', 'disabled');
    await act(async () => {
      btn.click();
    });

    const stopBtn = await waitFor(
      () => baseElement.querySelector('#stop-btn') as HTMLButtonElement,
    );

    if (stopBtn !== null) {
      await act(async () => {
        stopBtn.click();
      });
    }
  });

  test('simulates editing an app', async () => {
    Object.defineProperty(window, 'location', {
      value: { href: vi.fn() },
    });
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onGet(new RegExp('/conda-environments')).reply(200, environments);
    mock.onGet(new RegExp('/spawner-profiles')).reply(200, profiles);
    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    queryClient.setQueryData(['app-form'], app);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    queryClient.setQueryData(['app-environments'], environments);
    queryClient.setQueryData(['app-profiles'], profiles);
    mock.onPut().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            serverStatus="Ready"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.MuiButtonBase-root',
    )[0] as HTMLButtonElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.MuiList-root li.MuiButtonBase-root',
    )[2] as HTMLAnchorElement;
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Edit');
    expect(btn).not.toHaveAttribute('disabled', 'disabled');
    await act(async () => {
      btn.click();
    });
    // TODO: Update this test when everything is running in single react app
    expect(window.location.pathname).not.toBe('/edit-app/app-1');
  });

  test('simulates editing an app with an error', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    mock
      .onPut(new RegExp('/server/app-1'))
      .reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            serverStatus="Ready"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.MuiButtonBase-root',
    )[0] as HTMLButtonElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.MuiList-root li.MuiButtonBase-root',
    )[2] as HTMLAnchorElement;
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Edit');
    expect(btn).not.toHaveAttribute('disabled', 'disabled');
    await act(async () => {
      btn.click();
    });
    // TODO: Update this test when everything is running in single react app
    expect(window.location.pathname).not.toBe('/edit-app/app-1');
  });

  test('simulates canceling deleting an app', async () => {
    mock.onDelete().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            serverStatus="Ready"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.MuiButtonBase-root',
    )[0] as HTMLButtonElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.MuiList-root li.MuiButtonBase-root',
    )[3] as HTMLAnchorElement;
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Delete');
    expect(btn).not.toHaveAttribute('disabled', 'disabled');
    await act(async () => {
      btn.click();
    });
  });

  test('simulates deleting an app', async () => {
    mock.onDelete().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            serverStatus="Ready"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.MuiButtonBase-root',
    )[0] as HTMLButtonElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.MuiList-root li.MuiButtonBase-root',
    )[3] as HTMLAnchorElement;
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Delete');
    expect(btn).not.toHaveAttribute('disabled', 'disabled');
    await act(async () => {
      btn.click();
    });

    await act(async () => {
      menu.click();
    });

    await act(async () => {
      btn.click();
    });

    const deleteBtn = await waitFor(
      () => baseElement.querySelector('#delete-btn') as HTMLButtonElement,
    );

    if (deleteBtn !== null) {
      await act(async () => {
        deleteBtn.click();
      });
    }
  });

  test('simulates deleting an app with an error', async () => {
    mock.onDelete().reply(500, { error: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            serverStatus="Ready"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.MuiButtonBase-root',
    )[0] as HTMLButtonElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.MuiList-root li.MuiButtonBase-root',
    )[0] as HTMLAnchorElement;
    await act(async () => {
      btn.click();
    });

    const deleteBtn = await waitFor(
      () => baseElement.querySelector('#delete-btn') as HTMLButtonElement,
    );

    if (deleteBtn !== null) {
      await act(async () => {
        deleteBtn.click();
      });
    }
  });

  // icon tests:
  test('returns PublicRoundedIcon when isPublic is true', () => {
    const { getByTestId } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="app-1"
            title="app-1"
            framework="panel"
            serverStatus="running"
            url="http://localhost:3000/app-1"
            isPublic={true}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(getByTestId('PublicRoundedIcon')).toBeInTheDocument();
  });

  test('returns GroupRoundedIcon when isShared is true', () => {
    const { getByTestId } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="app-1"
            title="app-1"
            framework="panel"
            serverStatus="running"
            url="http://localhost:3000/app-1"
            isShared={true}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(getByTestId('GroupRoundedIcon')).toBeInTheDocument();
  });

  test('returns LockRoundedIcon when both isPublic and isShared are false', () => {
    const { getByTestId } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="app-1"
            title="app-1"
            framework="panel"
            serverStatus="running"
            url="http://localhost:3000/app-1"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(getByTestId('LockRoundedIcon')).toBeInTheDocument();
  });
  test('renders context menu with start, stop, edit, and delete actions', async () => {
    const { getByTestId, getByText } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            serverStatus="Ready"
            isShared={false}
            app={{ id: '1', name: 'Test App', framework: 'Some Framework', description: 'Test App 1',
              url: '/user/test/test-app-1/',
              thumbnail: '',
              username: 'test',
              ready: true,
              public: false,
              shared: false,
              last_activity: new Date(),
              pending: false,
              stopped: false,
              status: 'false' }}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
  
    // Open context menu first
    const contextMenuButton = getByTestId('context-menu-button-card-menu-1');
    act(() => {
      contextMenuButton.click();
    });
  
    const startMenuItem = await waitFor(() => getByText('Start'));
    const stopMenuItem = getByText('Stop');
    const editMenuItem = getByText('Edit');
    const deleteMenuItem = getByText('Delete');
  
    expect(startMenuItem).toBeInTheDocument();
    expect(stopMenuItem).toBeInTheDocument();
    expect(editMenuItem).toBeInTheDocument();
    expect(deleteMenuItem).toBeInTheDocument();
  });
  
  
  test('disables stop action if app is not running', async () => {
    const { getByTestId, getByText } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            username="Developer"
            framework="Some Framework"
            url="/some-url"
            serverStatus="Pending" // App is not running
            isShared={false}
            app={{ id: '1', name: 'Test App', framework: 'Some Framework', 
              description: 'Test App 1',
              url: '/user/test/test-app-1/',
              thumbnail: '',
              username: 'test',
              ready: true,
              public: false,
              shared: false,
              last_activity: new Date(),
              pending: true,
              stopped: false,
              status: 'false' }}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
  
    // Open context menu first
    const contextMenuButton = getByTestId('context-menu-button-card-menu-1');
    act(() => {
      contextMenuButton.click();
    });
  
    const stopMenuItem = await waitFor(() => getByText('Stop'));
    expect(stopMenuItem).toBeInTheDocument();
    expect(stopMenuItem).toHaveAttribute('aria-disabled', 'true');
  });
  
  
  test('disables edit and delete for shared apps', async () => {
    const { getByTestId, getByText } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Shared App"
            username="Other User"
            framework="Some Framework"
            url="/some-url"
            serverStatus="Ready"
            isShared={true} // App is shared
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
  
    // Open context menu first
    const contextMenuButton = getByTestId('context-menu-button-card-menu-1');
    act(() => {
      contextMenuButton.click();
    });
  
    const editMenuItem = await waitFor(() => getByText('Edit'));
    const deleteMenuItem = getByText('Delete');
  
    expect(editMenuItem).toHaveAttribute('aria-disabled', 'true');
    expect(deleteMenuItem).toHaveAttribute('aria-disabled', 'true');
  });
  
  
});
