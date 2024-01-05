import { app, environments, frameworks, profiles } from '@src/data/api';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { RecoilRoot } from 'recoil';
import { AppCard } from './app-card';

describe('AppCard', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  test('renders default app card successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="card-1"
            title="Card 1"
            framework="Some Framework"
            url="/some-url"
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h3');
    expect(header).toHaveTextContent('Card 1');
  });

  test('renders app card for app not ready', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="card-1"
            title="Card 1"
            framework="Some Framework"
            url="/some-url"
            ready={false}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h3');
    expect(header).toHaveTextContent('Card 1');
  });

  test('renders app card with thumbnail and description', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="card-1"
            title="Card 1"
            description="Some app description"
            framework="Some Framework"
            url="/some-url"
            thumbnail="/some-thumbnail.png"
            ready={true}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h3');
    expect(header).toHaveTextContent('Card 1');
    const img = baseElement.querySelector('img');
    expect(img).toHaveAttribute('src', '/some-thumbnail.png');
    const body = baseElement.querySelector('p');
    expect(body).toHaveTextContent('Some app description');
  });

  test('simulates starting an app', async () => {
    mock.onPost().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="card-1"
            title="Card 1"
            framework="Some Framework"
            url="/some-url"
            ready={false}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.context-menu-container',
    )[0] as HTMLDivElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.context-menu li a',
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

    const startBtn = baseElement.querySelector(
      '#start-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      startBtn.click();
    });
  });

  test('simulates stopping an app', async () => {
    mock.onDelete().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="card-1"
            title="Card 1"
            framework="Some Framework"
            url="/some-url"
            ready={true}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.context-menu-container',
    )[0] as HTMLDivElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.context-menu li a',
    )[1] as HTMLAnchorElement;
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

    const stopBtn = baseElement.querySelector('#stop-btn') as HTMLButtonElement;
    await act(async () => {
      stopBtn.click();
    });
  });

  test('simulates editing an app', async () => {
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
            id="app-1"
            title="Card 1"
            framework="Some Framework"
            url="/some-url"
            ready={true}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.context-menu-container',
    )[0] as HTMLDivElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.context-menu li a',
    )[2] as HTMLAnchorElement;
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

    const submitBtn = baseElement.querySelector(
      '#submit-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      submitBtn.click();
    });
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
            id="app-1"
            title="Card 1"
            framework="Some Framework"
            url="/some-url"
            ready={true}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.context-menu-container',
    )[0] as HTMLDivElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.context-menu li a',
    )[2] as HTMLAnchorElement;
    await act(async () => {
      btn.click();
    });

    const submitBtn = baseElement.querySelector(
      '#submit-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      submitBtn.click();
    });
  });

  test('simulates deleting an app', async () => {
    mock.onDelete().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="card-1"
            title="Card 1"
            framework="Some Framework"
            url="/some-url"
            ready={true}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.context-menu-container',
    )[0] as HTMLDivElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.context-menu li a',
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

    await act(async () => {
      menu.click();
    });

    await act(async () => {
      btn.click();
    });

    const deleteBtn = baseElement.querySelector(
      '#delete-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      deleteBtn.click();
    });
  });

  test('simulates deleting an app with an error', async () => {
    mock.onDelete().reply(500, { error: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppCard
            id="card-1"
            title="Card 1"
            framework="Some Framework"
            url="/some-url"
            ready={true}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const menu = baseElement.querySelectorAll(
      '.context-menu-container',
    )[0] as HTMLDivElement;
    await act(async () => {
      menu.click();
    });

    const btn = baseElement.querySelectorAll(
      '.context-menu li a',
    )[3] as HTMLAnchorElement;
    await act(async () => {
      btn.click();
    });

    const deleteBtn = baseElement.querySelector(
      '#delete-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      deleteBtn.click();
    });
  });
});
