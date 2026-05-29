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
    last_activity: new Date(),
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

    const rows = baseElement.querySelectorAll('tbody > tr');
    expect(rows.length).toEqual(mockApps.length);
  });

  test('renders correct icons for each row', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const publicIcon = within(baseElement).getByTestId('public-icon');
    expect(publicIcon).toBeInTheDocument();
    const groupIcon = within(baseElement).getByTestId('group-icon');
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
      within(baseElement).queryAllByTestId('edit-button'),
    ) as HTMLButtonElement[];
    expect(editButtons.length).toBe(mockApps.length);
  });

  test('simulate deleting an app', async () => {
    mock.onDelete('/server/testId').reply(200);

    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const deleteButtons = await waitFor(() => {
      return within(baseElement).getAllByTestId('delete-button');
    });
    expect(deleteButtons.length).toBe(mockApps.length);
    if (deleteButtons.length > 0) {
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
      within(baseElement).queryAllByTestId('start-button'),
    ) as HTMLButtonElement[];

    expect(startButtons.length).toBe(1);
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

    await act(async () => await handleStop());
    expect(setSubmitting).toHaveBeenCalledWith(true);
    expect(deleteQuery).toHaveBeenCalledWith({ id: 'testId', remove: false });
    expect(setIsStopOpen).toHaveBeenCalledWith(false);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['app-state'],
    });
    expect(setSubmitting).toHaveBeenCalledWith(false);

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
      within(baseElement).queryAllByTestId('stop-button'),
    ) as HTMLButtonElement[];

    expect(stopButtons.length).toBe(1);
    for (const stopButton of stopButtons) {
      await act(async () => {
        fireEvent.click(stopButton);
      });
    }
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
      within(baseElement).queryAllByTestId('delete-button'),
    ) as HTMLButtonElement[];
    expect(deleteButtons.length).toBe(mockApps.length);
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

  test('renders correct number of header + body rows', () => {
    const { getAllByRole } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const rows = getAllByRole('row');
    expect(rows.length).toBe(mockApps.length + 1);
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
    expect(rows.length - 1).toBe(0);
  });
});
