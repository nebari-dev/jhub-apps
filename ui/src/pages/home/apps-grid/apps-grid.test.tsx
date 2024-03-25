import { frameworks, profiles, serverApps } from '@src/data/api';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import { currentUser as defaultUser } from '../../../store';
import { AppsGrid } from './apps-grid';

describe('AppsGrid', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  beforeEach(() => {
    queryClient.clear();
    mock.reset();
  });

  test('renders default apps grid successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h2');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Apps');
  });

  test('renders with mocked data', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['app-state'], serverApps);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelectorAll('.card')).toHaveLength(5);
  });

  test('renders a message when no apps', () => {
    queryClient.setQueryData(['app-state'], null);
    mock.onGet(new RegExp('/server/')).reply(200, null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No apps available');
  });

  test('renders a loading message', () => {
    queryClient.isFetching = jest.fn().mockReturnValue(true);
    mock.onGet(new RegExp('/server/')).reply(200, null);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('Loading...');
  });

  test('renders with data error', async () => {
    queryClient.setQueryData(['app-state'], null);
    mock.onGet().reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toHaveTextContent('No apps available');
  });

  test('should search apps', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['app-state'], serverApps);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const input = baseElement.querySelector('#search') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'test' } });
    });
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'cras' } });
    });
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'panel' } });
    });
    const cards = baseElement.querySelectorAll('.card');
    expect(cards).toHaveLength(1);
  });

  test('should sort apps', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    queryClient.setQueryData(['app-state'], serverApps);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const btn = baseElement.querySelector('#sort-by-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    waitFor(() => {
      const form = baseElement.querySelector(
        '#sort-by-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();
    });

    let menuItem = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    )[2] as HTMLAnchorElement;
    await act(async () => {
      menuItem.click();
    });

    await act(async () => {
      btn.click();
    });

    waitFor(() => {
      const form = baseElement.querySelector(
        '#sort-by-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();
    });
    menuItem = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    )[1] as HTMLAnchorElement;
    await act(async () => {
      menuItem.click();
    });

    await act(async () => {
      btn.click();
    });

    waitFor(() => {
      const form = baseElement.querySelector(
        '#sort-by-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();
    });
    menuItem = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    )[0] as HTMLAnchorElement;
    await act(async () => {
      menuItem.click();
    });
    expect(menuItem).toBeTruthy();
    const cards = baseElement.querySelectorAll('.card');
    expect(cards).toHaveLength(5);
  });

  test('should filter all apps', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    queryClient.setQueryData(['app-state'], serverApps);
    queryClient.setQueryData(['app-frameworks'], profiles);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const btn = baseElement.querySelector('#filters-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    waitFor(() => {
      const form = baseElement.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();
    });

    const frameworkItem = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    )[0] as HTMLLabelElement;
    await act(async () => {
      frameworkItem.click();
    });
    expect(frameworkItem).toBeTruthy();

    let ownershipItem = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    )[6] as HTMLLabelElement;
    await act(async () => {
      ownershipItem.click();
    });
    ownershipItem = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    )[7] as HTMLLabelElement;
    await act(async () => {
      ownershipItem.click();
    });
    expect(ownershipItem).toBeTruthy();

    const applyButton = baseElement.querySelector(
      '#apply-filters-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      applyButton.click();
    });

    const cards = baseElement.querySelectorAll('.card');
    expect(cards).not.toHaveLength(5);
  });

  test('should filter my apps', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    queryClient.setQueryData(['app-state'], serverApps);
    queryClient.setQueryData(['app-frameworks'], profiles);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const btn = baseElement.querySelector('#filters-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    waitFor(() => {
      const form = baseElement.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();
    });

    const frameworkItem = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    )[0] as HTMLLabelElement;
    await act(async () => {
      frameworkItem.click();
    });
    expect(frameworkItem).toBeTruthy();

    let ownershipItem = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    )[6] as HTMLLabelElement;
    await act(async () => {
      ownershipItem.click();
    });

    const applyButton = baseElement.querySelector(
      '#apply-filters-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      applyButton.click();
    });

    const cards = baseElement.querySelectorAll('.card');
    expect(cards).not.toHaveLength(5);
  });

  test('should filter shared apps', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    queryClient.setQueryData(['app-state'], serverApps);
    queryClient.setQueryData(['app-frameworks'], profiles);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const btn = baseElement.querySelector('#filters-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    waitFor(() => {
      const form = baseElement.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();
    });

    const frameworkItem = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    )[0] as HTMLLabelElement;
    await act(async () => {
      frameworkItem.click();
    });
    expect(frameworkItem).toBeTruthy();

    let ownershipItem = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    )[7] as HTMLLabelElement;
    await act(async () => {
      ownershipItem.click();
    });

    const applyButton = baseElement.querySelector(
      '#apply-filters-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      applyButton.click();
    });

    const cards = baseElement.querySelectorAll('.card');
    expect(cards).not.toHaveLength(5);
  });

  test('should clear filters', async () => {
    mock.onGet(new RegExp('/server/')).reply(200, serverApps);
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    queryClient.setQueryData(['app-state'], serverApps);
    queryClient.setQueryData(['app-frameworks'], profiles);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppsGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const btn = baseElement.querySelector('#filters-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    waitFor(() => {
      const form = baseElement.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();
    });

    const clearButton = baseElement.querySelector(
      '#clear-filters-btn',
    ) as HTMLButtonElement;
    await act(async () => {
      clearButton.click();
    });

    const cards = baseElement.querySelectorAll('.card');
    expect(cards).toHaveLength(5);
  });
});
