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
      const form = document.querySelector('form[name="sort-by-form"]');
      expect(form).toBeTruthy();
    });

    let menuItem = document.querySelectorAll(
      'form[name="sort-by-form"] .filter-item',
    )[2] as HTMLLabelElement;
    await act(async () => {
      menuItem.click();
    });

    await act(async () => {
      btn.click();
    });

    await waitFor(() => {
      const form = document.querySelector('form[name="sort-by-form"]');
      expect(form).toBeTruthy();
    });
    menuItem = document.querySelectorAll(
      'form[name="sort-by-form"] .filter-item',
    )[1] as HTMLLabelElement;
    await act(async () => {
      menuItem.click();
    });

    await act(async () => {
      btn.click();
    });

    await waitFor(() => {
      const form = document.querySelector('form[name="sort-by-form"]');
      expect(form).toBeTruthy();
    });
    menuItem = document.querySelectorAll(
      'form[name="sort-by-form"] .filter-item',
    )[0] as HTMLLabelElement;
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
      const form = document.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();

      const filterItems = document.querySelectorAll(
        '#filters-form .filter-item',
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

        const applyButton = document.querySelector(
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
      const form = document.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      if (form !== null) {
        const filterItems = document.querySelectorAll(
          '#filters-form .filter-item',
        ) as NodeListOf<HTMLLabelElement>;
        if (filterItems.length >= 11) {
          const frameworkItem1 = filterItems[0];
          await act(async () => {
            frameworkItem1.click();
          });
          expect(frameworkItem1).toBeTruthy();

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

          const applyButton = document.querySelector(
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
      const form = document.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();

      const filterItems = document.querySelectorAll(
        '#filters-form .filter-item',
      ) as NodeListOf<HTMLLabelElement>;
      if (filterItems.length >= 6) {
        const statusItem1 = filterItems[5];
        await act(async () => {
          statusItem1.click();
        });
        expect(statusItem1).toBeTruthy();

        const statusItem2 = filterItems[6];
        await act(async () => {
          statusItem1.click();
          statusItem2.click();
        });
        expect(statusItem1).toBeTruthy();
        expect(statusItem2).toBeTruthy();

        const applyButton = document.querySelector(
          '#apply-filters-btn',
        ) as HTMLButtonElement;
        await act(async () => {
          applyButton.click();
        });

        expect(spy).toHaveBeenCalled();
      }
    });
  });

  test('should filter by groups', async () => {
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
      const form = document.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();

      const groupsLabel = Array.from(
        document.querySelectorAll('#filters-form .filter-section-label'),
      ).find((label) => label.textContent === 'Groups');
      expect(groupsLabel).toBeTruthy();

      const filterItems = document.querySelectorAll(
        '#filters-form .filter-item',
      ) as NodeListOf<HTMLLabelElement>;

      const developerCheckbox = Array.from(filterItems).find((item) =>
        item.textContent?.includes('developer'),
      );

      if (developerCheckbox) {
        await act(async () => {
          developerCheckbox.click();
        });
        expect(developerCheckbox).toBeTruthy();

        const applyButton = document.querySelector(
          '#apply-filters-btn',
        ) as HTMLButtonElement;
        await act(async () => {
          applyButton.click();
        });

        expect(spy).toHaveBeenCalled();
        const callArgs = spy.mock.calls[0][0];
        expect(callArgs).toBeDefined();
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
      const form = document.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      if (form !== null) {
        const clearButton = document.querySelector(
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
      const form = document.querySelector(
        '#filters-form',
      ) as HTMLFormElement;
      expect(form).toBeTruthy();
    });

    const filterItems = document.querySelectorAll(
      '#filters-form .filter-item',
    ) as NodeListOf<HTMLLabelElement>;
    if (filterItems.length >= 1) {
      const frameworkItem = filterItems[0];
      await act(async () => {
        frameworkItem.click();
      });

      const applyButton = await waitFor(
        () =>
          document.querySelector('#apply-filters-btn') as HTMLButtonElement,
      );

      await waitFor(() => {
        const filteredCount = document.querySelector(
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
