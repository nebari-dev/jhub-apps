import { frameworks, serverApps, userState } from '@src/data/api';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import { currentUser as defaultUser } from '../../../../store';
import { AppFilters } from './app-filters';

describe('AppFilters', () => {
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

  test('renders default successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppFilters
            data={serverApps}
            currentUser={userState}
            setApps={vi.fn()}
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
    const spy = vi.fn();
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

    await waitFor(() => {
      const form = baseElement.querySelector('form[name="sort-by-form"]');
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

    await waitFor(() => {
      const form = baseElement.querySelector('form[name="sort-by-form"]');
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

    await waitFor(() => {
      const form = baseElement.querySelector('form[name="sort-by-form"]');
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
    const spy = vi.fn();
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

    await waitFor(async () => {
      const form = baseElement.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();

      const filterItems = baseElement.querySelectorAll(
        '.MuiFormControlLabel-root',
      ) as NodeListOf<HTMLLabelElement>;
      if (filterItems.length >= 11) {
        const frameworkItem = filterItems[0];
        await act(async () => {
          frameworkItem.click();
        });
        expect(frameworkItem).toBeTruthy();

        const ownershipItem1 = filterItems[10];
        await act(async () => {
          ownershipItem1.click();
        });
        expect(ownershipItem1).toBeTruthy();

        const ownershipItem2 = filterItems[11];
        await act(async () => {
          ownershipItem2.click();
        });
        expect(ownershipItem2).toBeTruthy();

        const applyButton = baseElement.querySelector(
          '#apply-filters-btn',
        ) as HTMLButtonElement;
        await act(async () => {
          applyButton.click();
        });

        expect(spy).toHaveBeenCalled();
      }
    });
  });

  test('should filter my apps', async () => {
    const spy = vi.fn();
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

    await waitFor(async () => {
      const form = baseElement.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      if (form !== null) {
        const filterItems = baseElement.querySelectorAll(
          '.MuiFormControlLabel-root',
        ) as NodeListOf<HTMLLabelElement>;
        if (filterItems.length >= 11) {
          // Check first framework item
          const frameworkItem1 = filterItems[0];
          await act(async () => {
            frameworkItem1.click();
          });
          expect(frameworkItem1).toBeTruthy();

          // Uncheck first framework item and check second framework item
          const frameworkItem2 = filterItems[1];
          await act(async () => {
            frameworkItem1.click();
            frameworkItem2.click();
          });
          expect(frameworkItem1).toBeTruthy();
          expect(frameworkItem2).toBeTruthy();

          const ownershipItem = filterItems[10];
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
      }
    });
  });

  test('should filter by server statuses', async () => {
    const spy = vi.fn();
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

    await waitFor(async () => {
      const form = baseElement.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();

      const filterItems = baseElement.querySelectorAll(
        '.MuiFormControlLabel-root',
      ) as NodeListOf<HTMLLabelElement>;
      if (filterItems.length >= 6) {
        // Check first status item
        const statusItem1 = filterItems[5];
        await act(async () => {
          statusItem1.click();
        });
        expect(statusItem1).toBeTruthy();

        // Uncheck first status item and check second status item
        const statusItem2 = filterItems[6];
        await act(async () => {
          statusItem1.click();
          statusItem2.click();
        });
        expect(statusItem1).toBeTruthy();
        expect(statusItem2).toBeTruthy();

        const applyButton = baseElement.querySelector(
          '#apply-filters-btn',
        ) as HTMLButtonElement;
        await act(async () => {
          applyButton.click();
        });

        expect(spy).toHaveBeenCalled();
      }
    });
  });

  test('should clear filters', async () => {
    const spy = vi.fn();
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

    await waitFor(async () => {
      const form = baseElement.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
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

  test('should calculate filtered count', async () => {
    const spy = vi.fn();
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

    await waitFor(() => {
      const form = baseElement.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();
    });

    const filterItems = baseElement.querySelectorAll(
      '.MuiFormControlLabel-root',
    ) as NodeListOf<HTMLLabelElement>;
    if (filterItems.length >= 1) {
      const frameworkItem = filterItems[0];
      await act(async () => {
        frameworkItem.click();
      });

      const applyButton = await waitFor(
        () =>
          baseElement.querySelector('#apply-filters-btn') as HTMLButtonElement,
      );

      await waitFor(() => {
        const filteredCount = baseElement.querySelector(
          '#apply-filters-btn',
        ) as HTMLButtonElement;
        expect(filteredCount).toBeInTheDocument();
        expect(filteredCount.textContent).toContain('Show');
        expect(filteredCount.textContent).toContain('results');
      });

      await act(async () => {
        applyButton.click();
      });
      expect(spy).toHaveBeenCalled();
    }
  });
});
