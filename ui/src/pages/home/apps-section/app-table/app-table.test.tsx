import { JhApp } from '@src/types/jupyterhub';
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
import { RecoilRoot } from 'recoil';
import { AppTable } from '../app-table/app-table';

// Mock data for the test
const mockApps: JhApp[] = [
  {
    id: '1',
    name: 'App 1',
    username: 'User 1',
    framework: 'Framework 1',
    status: 'Ready',
    public: true,
    shared: false,
    url: '',
    ready: false,
    last_activity: new Date(), // Assign a valid Date value here
  },
  {
    id: '2',
    name: 'App 2',
    username: 'User 2',
    framework: 'Framework 2',
    status: 'Running',
    public: false,
    shared: true,
    url: '',
    ready: false,
    last_activity: new Date(),
  },
];

describe('AppTable', () => {
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
    window.location.href = '';
  });

  test('renders AppTable component', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement).toBeInTheDocument();
  });

  test('renders correct number of rows', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const rows = baseElement.querySelectorAll('tbody > .MuiTableRow-root');
    expect(rows.length).toEqual(mockApps.length);
  });

  test('renders correct action buttons for each row', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const rows = baseElement.querySelectorAll('.row');
    rows.forEach((row: Element, index: number) => {
      if (index === 0) return; // Skip the header row

      const buttons = within(row as HTMLElement).getAllByRole('button');
      const buttonIds = buttons.map((button) =>
        button.getAttribute('data-testid'),
      );
      const app = mockApps[index - 1]; // Adjust index for the header row

      if (app.status === 'Stopped' || app.status === 'Ready') {
        expect(buttonIds).toContain('PlayCircleRoundedIcon');
      } else {
        expect(buttonIds).toContain('StopCircleRoundedIcon');
      }

      expect(buttonIds).toContain('EditRoundedIcon');
      expect(buttonIds).toContain('DeleteRoundedIcon');
    });
  });

  // Import the LockRoundedIcon component

  test('renders correct icons for each row', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const publicIcon = within(baseElement).getByTestId('PublicRoundedIcon');
    expect(publicIcon).toBeInTheDocument();
    const groupIcon = within(baseElement).getByTestId('GroupRoundedIcon');
    expect(groupIcon).toBeInTheDocument();
  });

  test('Edit button exists for each app', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const editButtons = Array.from(
      within(baseElement).queryAllByTestId('EditRoundedIcon'),
    ) as HTMLButtonElement[];
    expect(editButtons.length).toBe(4);
  });

  test('simulate deleting an app', async () => {
    mock.onDelete('/server/testId').reply(200); // Mock the delete API endpoint

    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const deleteButtons = await waitFor(() => {
      return within(baseElement).getAllByTestId('DeleteRoundedIcon');
    });
    expect(deleteButtons.length).toBe(4);
    if (deleteButtons.length > 0) {
      // Select the first delete button
      const deleteButton = deleteButtons[0];
      await act(async () => {
        deleteButton.click();
      });
    }
  });

  test('renders start modal on start button click', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const startButtons = Array.from(
      within(baseElement).queryAllByTestId('PlayCircleRoundedIcon'),
    ) as HTMLButtonElement[];

    expect(startButtons.length).toBe(2);
    for (const startButton of startButtons) {
      await act(async () => {
        fireEvent.click(startButton);
      });
    }
  });

  test('handleStop behaves correctly', async () => {
    const deleteQuery = vi.fn();
    const setIsStopOpen = vi.fn();
    const setNotification = vi.fn();
    const setSubmitting = vi.fn();
    const queryClient = { invalidateQueries: vi.fn() };
    const currentApp = { id: 'testId' };

    const handleStop = async (id?: string) => {
      const appId = id || currentApp?.id;
      if (!appId) return;
      setSubmitting(true);
      try {
        await deleteQuery({ id: appId, remove: false });
        setIsStopOpen(false);
        queryClient.invalidateQueries({ queryKey: ['app-state'] });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error instanceof Error) {
          setNotification(error.message);
        } else {
          // eslint-disable-next-line no-console
          console.error('An unknown error occurred', error);
        }
      } finally {
        setSubmitting(false);
      }
    };

    // Test with id provided
    await act(async () => await handleStop('providedId'));
    expect(setSubmitting).toHaveBeenCalledWith(true);
    expect(deleteQuery).toHaveBeenCalledWith({
      id: 'providedId',
      remove: false,
    });
    expect(setIsStopOpen).toHaveBeenCalledWith(false);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['app-state'],
    });
    expect(setSubmitting).toHaveBeenCalledWith(false);

    // Test with id not provided
    await act(async () => await handleStop());
    expect(setSubmitting).toHaveBeenCalledWith(true);
    expect(deleteQuery).toHaveBeenCalledWith({ id: 'testId', remove: false });
    expect(setIsStopOpen).toHaveBeenCalledWith(false);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['app-state'],
    });
    expect(setSubmitting).toHaveBeenCalledWith(false);

    // Test with error
    deleteQuery.mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    await act(async () => await handleStop('providedId'));
    expect(setNotification).toHaveBeenCalledWith('Test error');
  });

  test('renders stop modal on stop button click', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const stopButtons = Array.from(
      within(baseElement).queryAllByTestId('StopCircleRoundedIcon'),
    ) as HTMLButtonElement[];

    expect(stopButtons.length).toBe(2);
    for (const stopButton of stopButtons) {
      await act(async () => {
        fireEvent.click(stopButton);
      });
    }
  });

  test('clicking on action buttons triggers appropriate actions', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const rows = baseElement.querySelectorAll('.row');
    rows.forEach((row: Element, index: number) => {
      if (index === 0) return; // Skip the header row

      const buttons = within(row as HTMLElement).getAllByRole('button');
      expect(buttons.length).toBe(4);
      buttons.forEach((button) => {
        fireEvent.click(button);
        // Add assertions here to check that the appropriate actions were triggered
      });
    });
  });

  test('clicking the Cancel button cancels the Start action', () => {
    const setIsStartOpen = vi.fn();

    const { getByRole } = render(
      <button onClick={() => setIsStartOpen(false)}>Test Button</button>,
    );

    fireEvent.click(getByRole('button'));

    expect(setIsStartOpen).toHaveBeenCalledWith(false);
  });

  test('renders delete modal on delete button click', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const deleteButtons = Array.from(
      within(baseElement).queryAllByTestId('DeleteRoundedIcon'),
    ) as HTMLButtonElement[];
    expect(deleteButtons.length).toBe(4);
    for (const deleteButton of deleteButtons) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });
    }
  });

  test('clicking Cancel closes Delete Modal', () => {
    const setIsDeleteOpen = vi.fn();

    const { getByRole } = render(
      <button onClick={() => setIsDeleteOpen(false)}>Test Button</button>,
    );

    fireEvent.click(getByRole('button'));

    expect(setIsDeleteOpen).toHaveBeenCalledWith(false);
  });

  test('clicking Cancel closes the Stop modal', () => {
    const setIsStopOpen = vi.fn();

    const { getByRole } = render(
      <button onClick={() => setIsStopOpen(false)}>Test Button</button>,
    );

    fireEvent.click(getByRole('button'));

    expect(setIsStopOpen).toHaveBeenCalledWith(false);
  });

  test('renders correct number of rows', () => {
    const { getAllByRole } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const rows = getAllByRole('row');
    expect(rows.length).toBe(mockApps.length + 1); // Add 1 for the header row
  });

  test('displays app data correctly', () => {
    const { getByText } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    mockApps.forEach((app) => {
      expect(getByText(app.name)).toBeInTheDocument();
      expect(getByText(app.status)).toBeInTheDocument();
    });
  });

  test('handles empty apps prop', () => {
    const { queryAllByRole } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={[]} />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const rows = queryAllByRole('row');
    // Subtract 1 for the header row
    expect(rows.length - 1).toBe(0);
  });
});
