import { frameworks, serverApps, userState } from '@src/data/api';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import { currentUser as defaultUser } from '../../../../store';
import { AppFilters } from './app-filters';

describe('AppFilters', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  beforeEach(() => {
    queryClient.clear();
    mock.reset();
  });

  test('renders default successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppFilters
            data={serverApps}
            currentUser={userState}
            setApps={jest.fn()}
            isGridViewActive={false}
            toggleView={function (): void {
              throw new Error('Function not implemented.');
            }}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeTruthy();
  });

  test('should sort apps', async () => {
    const spy = jest.fn();
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppFilters
            data={serverApps}
            currentUser={userState}
            setApps={spy}
            isGridViewActive={false}
            toggleView={function (): void {
              throw new Error('Function not implemented.');
            }}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const btn = baseElement.querySelector('#sort-by-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    waitFor(() => {
      const form = baseElement.querySelector(
        'form[name="sort-by-form"]',
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
        'form[name="sort-by-form"]',
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
        'form[name="sort-by-form"]',
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
    expect(spy).toHaveBeenCalled();
  });

  test('should filter all apps', async () => {
    const spy = jest.fn();
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppFilters
            data={serverApps}
            currentUser={userState}
            setApps={spy}
            isGridViewActive={false}
            toggleView={function (): void {
              throw new Error('Function not implemented.');
            }}
          />
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

    expect(spy).toHaveBeenCalled();
  });

  test('should filter my apps', async () => {
    const spy = jest.fn();
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppFilters
            data={serverApps}
            currentUser={userState}
            setApps={spy}
            isGridViewActive={false}
            toggleView={function (): void {
              throw new Error('Function not implemented.');
            }}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const btn = baseElement.querySelector('#filters-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    const form = await waitFor(async () => {
      baseElement.querySelector('#filters-form') as HTMLFormElement;
    });

    if (form !== null) {
      const frameworkItem = baseElement.querySelectorAll(
        '.MuiFormControlLabel-root',
      )[0] as HTMLLabelElement;
      await act(async () => {
        frameworkItem.click();
      });
      expect(frameworkItem).toBeTruthy();

      const ownershipItem = baseElement.querySelectorAll(
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
    }

    expect(spy).toHaveBeenCalled();
  });

  test('should clear filters', async () => {
    const spy = jest.fn();
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppFilters
            data={serverApps}
            currentUser={userState}
            setApps={spy}
            isGridViewActive={false}
            toggleView={function (): void {
              throw new Error('Function not implemented.');
            }}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const btn = baseElement.querySelector('#filters-btn') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    const form = await waitFor(async () => {
      baseElement.querySelector('#filters-form') as HTMLFormElement;
    });

    if (form !== null) {
      const clearButton = baseElement.querySelector(
        '#clear-filters-btn',
      ) as HTMLButtonElement;
      await act(async () => {
        clearButton.click();
      });
    }

    expect(spy).not.toHaveBeenCalled();
  });
});
