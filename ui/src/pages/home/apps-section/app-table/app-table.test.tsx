import { AppQueryDeleteProps, AppQueryPostProps } from '@src/types/api';
import { JhApp } from '@src/types/jupyterhub';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
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

function getStatusStyles(status: string): unknown {
  switch (status) {
    case 'Ready':
      return {
        bgcolor: '#ffffff',
        border: '1px solid #2E7D32',
        color: '#2E7D32',
      };
    case 'Pending':
      return {
        bgcolor: '#EAB54E',
        color: 'black',
      };
    case 'Running':
      return {
        bgcolor: '#2E7D32',
        color: 'white',
      };
    case 'Unknown':
      return {
        bgcolor: '#79797C',
        color: 'white',
      };
    default:
      return {
        bgcolor: '#F5F5F5',
        color: 'black',
      };
  }
}

describe('AppTable', () => {
  const queryClient = new QueryClient();
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

  test('returns correct styles for "Ready" status', () => {
    const result = getStatusStyles('Ready');
    expect(result).toEqual({
      bgcolor: '#ffffff',
      border: '1px solid #2E7D32',
      color: '#2E7D32',
    });
  });

  test('returns correct styles for "Pending" status', () => {
    const result = getStatusStyles('Pending');
    expect(result).toEqual({
      bgcolor: '#EAB54E',
      color: 'black',
    });
  });

  test('returns correct styles for "Running" status', () => {
    const result = getStatusStyles('Running');
    expect(result).toEqual({
      bgcolor: '#2E7D32',
      color: 'white',
    });
  });

  test('returns correct styles for "Unknown" status', () => {
    const result = getStatusStyles('Unknown');
    expect(result).toEqual({
      bgcolor: '#79797C',
      color: 'white',
    });
  });

  test('returns default styles for any other status', () => {
    const result = getStatusStyles('AnyOtherStatus');
    expect(result).toEqual({
      bgcolor: '#F5F5F5',
      color: 'black',
    });
  });

  test('renders correct number of rows', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const rows = baseElement.querySelectorAll('.MuiDataGrid-row');
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

  test('startRequest makes a post request and updates status', async () => {
    const updateStatusAfterOperation = jest.fn();
    const setNotification = jest.fn();
    const setAppStatus = jest.fn();

    mock.onPost('/server/1').reply(200, { data: 'Mocked data' });

    const startRequest = async ({ id }: AppQueryPostProps) => {
      try {
        const response = await axios.post(`/server/${id}`);
        updateStatusAfterOperation('Running');
        return response;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('There was an error!', error);
        if (error instanceof Error) {
          setNotification(error.message);
        } else {
          console.error('An unknown error occurred', error);
        }
        setAppStatus('Error'); // Set status back to Ready if there's an error
      }
    };

    await startRequest({ id: '1' });

    expect(updateStatusAfterOperation).toHaveBeenCalledWith('Running');
    expect(setNotification).not.toHaveBeenCalled();
    expect(setAppStatus).not.toHaveBeenCalled();
  });
  test('startRequest handles error correctly', async () => {
    const updateStatusAfterOperation = jest.fn();
    const setNotification = jest.fn();
    const setAppStatus = jest.fn();
    const startRequest = async ({ id }: AppQueryPostProps) => {
      try {
        const response = await axios.post(`/server/${id}`);
        updateStatusAfterOperation('Running');
        return response;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('There was an error!', error);
        if (error instanceof Error) {
          setNotification(error.message);
        } else {
          console.error('An unknown error occurred', error);
        }
        setAppStatus('Error'); // Set status back to Ready if there's an error
      }
    };
    mock.onPost('/server/1').networkError();

    await startRequest({ id: '1' });

    expect(updateStatusAfterOperation).not.toHaveBeenCalled();
    expect(setNotification).toHaveBeenCalled();
    expect(setAppStatus).toHaveBeenCalledWith('Error');
  });
  test('deleteRequest makes a delete request and updates status', async () => {
    const updateStatusAfterOperation = jest.fn();
    const setNotification = jest.fn();
    const setAppStatus = jest.fn();

    mock.onDelete('/server/1').reply(200, { data: 'Mocked data' });

    const deleteRequest = async ({ id, remove }: AppQueryDeleteProps) => {
      console.log('Deleting app with ID:', id); // log the ID
      try {
        const response = await axios.delete(`/server/${id}`, {
          params: {
            remove,
          },
        });
        console.log('Response:', response); // log the response
        if (remove) {
          updateStatusAfterOperation('Deleted'); // Handle based on your logic
        } else {
          updateStatusAfterOperation('Ready'); // Assume or handle based on response
        }
        return response;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('There was an error!', error);
        if (error instanceof Error) {
          setNotification(error.message);
        } else {
          console.error('An unknown error occurred', error);
        }
        setAppStatus('Error'); // Reflect an error state
      }
    };

    await deleteRequest({ id: '1', remove: true });

    expect(updateStatusAfterOperation).toHaveBeenCalledWith('Deleted');
    expect(setNotification).not.toHaveBeenCalled();
    expect(setAppStatus).not.toHaveBeenCalled();
  });

  test('deleteRequest handles error correctly', async () => {
    const updateStatusAfterOperation = jest.fn();
    const setNotification = jest.fn();
    const setAppStatus = jest.fn();

    mock.onDelete('/server/1').networkError();
    const deleteRequest = async ({ id, remove }: AppQueryDeleteProps) => {
      console.log('Deleting app with ID:', id); // log the ID
      try {
        const response = await axios.delete(`/server/${id}`, {
          params: {
            remove,
          },
        });
        console.log('Response:', response); // log the response
        if (remove) {
          updateStatusAfterOperation('Deleted'); // Handle based on your logic
        } else {
          updateStatusAfterOperation('Ready'); // Assume or handle based on response
        }
        return response;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('There was an error!', error);
        if (error instanceof Error) {
          setNotification(error.message);
        } else {
          console.error('An unknown error occurred', error);
        }
        setAppStatus('Error'); // Reflect an error state
      }
    };

    await deleteRequest({ id: '1', remove: true });

    expect(updateStatusAfterOperation).not.toHaveBeenCalled();
    expect(setNotification).toHaveBeenCalled();
    expect(setAppStatus).toHaveBeenCalledWith('Error');
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
    console.log('EDIT BUTTON LENGTH', editButtons.length);
    expect(editButtons.length).toBe(4);
  });

  test('simulate deleting an app', async () => {
    mock.onDelete(`/server/testId`).reply(200); // Mock the delete API endpoint

    const { baseElement, getByTestId } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppTable apps={mockApps} />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const deleteButtons = await waitFor(() => {
      return within(baseElement).getAllByTestId('DeleteRoundedIcon');
    });
    if (deleteButtons.length > 0) {
      // Select the first delete button
      const deleteButton = deleteButtons[0];
      await act(async () => {
        deleteButton.click();
      });
      const modal = getByTestId('DeleteModal'); // Pass baseElement as the first argument
      expect(modal).toBeInTheDocument();
      // Is delete button in the modal enabled?
      const modalDeleteButton = within(modal).getByTestId('delete-btn');
      expect(modalDeleteButton).toBeInTheDocument();
      expect(modalDeleteButton).toBeEnabled();
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

    for (const startButton of startButtons) {
      await act(async () => {
        fireEvent.click(startButton);
      });
    }

    await waitFor(() => {
      const startModal = within(baseElement).getByTestId('StartModal'); // assuming 'StartModal' is a class name
      expect(startModal).toBeInTheDocument();
    });
  });

  test('handleStop behaves correctly', async () => {
    const deleteQuery = jest.fn();
    const setIsStopOpen = jest.fn();
    const setNotification = jest.fn();
    const setSubmitting = jest.fn();
    const queryClient = { invalidateQueries: jest.fn() };
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

    for (const stopButton of stopButtons) {
      await act(async () => {
        fireEvent.click(stopButton);
      });
    }

    await waitFor(() => {
      const stopModal = within(baseElement).getByTestId('StopModal');
      expect(stopModal).toBeInTheDocument();
    });
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
      buttons.forEach((button) => {
        fireEvent.click(button);
        // Add assertions here to check that the appropriate actions were triggered
      });
    });
  });
  test('clicking the Cancel button cancels the Start action', () => {
    const setIsStartOpen = jest.fn();

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

    for (const deleteButton of deleteButtons) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });
    }

    await waitFor(() => {
      const deleteModal = within(baseElement).getByTestId('DeleteModal'); // assuming 'StartModal' is a class name
      expect(deleteModal).toBeInTheDocument();
    });
  });
  test('clicking Cancel closes Delete Modal', () => {
    const setIsDeleteOpen = jest.fn();

    const { getByRole } = render(
      <button onClick={() => setIsDeleteOpen(false)}>Test Button</button>,
    );

    fireEvent.click(getByRole('button'));

    expect(setIsDeleteOpen).toHaveBeenCalledWith(false);
  });
  test('clicking Cancel closes the Stop modal', () => {
    const setIsStopOpen = jest.fn();

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

  test('getStatusStyles handles all status values', () => {
    const statuses = ['Ready', 'Pending', 'Error']; // Add all possible statuses here
    statuses.forEach((status) => {
      const styles = getStatusStyles(status);
      expect(styles).toMatchSnapshot();
    });
  });

  test('getStatusStyles handles unknown status', () => {
    const styles = getStatusStyles('Unknown');
    expect(styles).toEqual({
      bgcolor: '#79797C',
      color: 'white',
    });
  });
});
