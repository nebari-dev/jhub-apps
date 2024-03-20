import { app, environments, frameworks, profiles } from '@src/data/api';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import AppCard from './app-card'; // Updated import to match component name

describe('AppCard', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);

  beforeAll(() => {
    mock.reset();
  });

  test('renders sdefault app card successfully', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            name="Developer"
            framework="Some Framework"
            url="/some-url"
            ready={true}
            serverStatus={{ stopped: false, pending: false, ready: false }}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeInTheDocument();
  });

  test('renders sdefault app card not ready', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            name="Developer"
            framework="Some Framework"
            url="/some-url"
            ready={true}
            serverStatus={{ stopped: false, pending: false, ready: false }}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeInTheDocument();
    const appLabel = baseElement.querySelector('.MuiTypography-h5');
    expect(appLabel).toHaveTextContent('Test App');
  });

  test('renders app card with thumbnail and description', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            name="Developer"
            framework="Some Framework"
            url="/some-url"
            ready={true}
            thumbnail="/some-thumbnail.png"
            serverStatus={{ stopped: false, pending: false, ready: false }}
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

  test('simulates starting an app', async () => {
    mock.onPost().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            name="Developer"
            framework="Some Framework"
            url="/some-url"
            ready={true}
            thumbnail="/some-thumbnail.png"
            serverStatus={{ stopped: false, pending: false, ready: false }}
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

    await act(async () => {
      menu.click();
    });

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

  test('simulates stopping an app', async () => {
    mock.onDelete().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            name="Developer"
            framework="Some Framework"
            url="/some-url"
            ready={true}
            thumbnail="/some-thumbnail.png"
            serverStatus={{ stopped: false, pending: false, ready: false }}
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
    // Cancel Stop confirmation buttons
    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });

    await act(async () => {
      menu.click();
    });

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
            name="Developer"
            framework="Some Framework"
            url="/some-url"
            ready={true}
            thumbnail="/some-thumbnail.png"
            serverStatus={{ stopped: false, pending: false, ready: false }}
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
            name="Developer"
            framework="Some Framework"
            url="/some-url"
            ready={true}
            thumbnail="/some-thumbnail.png"
            serverStatus={{ stopped: false, pending: false, ready: false }}
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

  test('simulates deleting an app', async () => {
    mock.onDelete().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="1"
            title="Test App"
            description="Some app description"
            name="Developer"
            framework="Some Framework"
            url="/some-url"
            ready={true}
            thumbnail="/some-thumbnail.png"
            serverStatus={{ stopped: false, pending: false, ready: false }}
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

    const cancelBtn = baseElement.querySelector(
      '#cancel-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
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
            name="Developer"
            framework="Some Framework"
            url="/some-url"
            ready={true}
            thumbnail="/some-thumbnail.png"
            serverStatus={{ stopped: false, pending: false, ready: false }}
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
});
