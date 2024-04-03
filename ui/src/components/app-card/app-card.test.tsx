import { app, environments, frameworks, profiles } from '@src/data/api';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import AppCard from './app-card';

describe('AppCard', () => {
  const queryClient = new QueryClient();
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
            ready={true}
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
            ready={true}
            serverStatus="ready"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeInTheDocument();
    const appLabel = baseElement.querySelector('.MuiTypography-h5');
    expect(appLabel).toHaveTextContent('Test App');
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
            ready={true}
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
            ready={true}
            serverStatus="ready"
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
            ready={true}
            thumbnail="/some-thumbnail.png"
            serverStatus="ready"
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
            ready={true}
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
    // Cancel Start confirmation buttons
    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
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
            ready={true}
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
            ready={true}
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
    // Cancel Stop confirmation buttons
    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
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
            ready={true}
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
      value: { href: jest.fn() },
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
            ready={true}
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
            ready={true}
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
            ready={true}
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
    await act(async () => {
      btn.click();
    });

    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
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
            ready={true}
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
            ready={true}
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
});
