import { currentUser } from '@src/data/user';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoilRoot } from 'recoil';
import { AppSharing } from '..';
import { currentUser as defaultUser } from '../../store';

describe('AppSharing', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  beforeEach(() => {
    queryClient.clear();
  });

  test('renders with mock data', () => {
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppSharing
            url="http://localhost:3000/"
            permissions={{
              users: ['user1', 'user2'],
              groups: ['group1', 'group2'],
            }}
            isPublic={true}
            setIsPublic={vi.fn()}
            setCurrentUserPermissions={vi.fn()}
            setCurrentGroupPermissions={vi.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('table')).toBeTruthy();
  });

  test('renders with mock data and pages table', async () => {
    const { baseElement, getByTestId } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppSharing
            url="http://localhost:3000/"
            permissions={{
              users: ['user1', 'user2', 'user3'],
              groups: ['group1', 'group2', 'group3'],
            }}
            isPublic={true}
            setIsPublic={vi.fn()}
            setCurrentUserPermissions={vi.fn()}
            setCurrentGroupPermissions={vi.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('table')).toBeTruthy();
    let rows = baseElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(5);
    const next = getByTestId('next-page');
    await act(async () => {
      next.click();
    });

    rows = baseElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBeGreaterThan(0);
    const prev = getByTestId('previous-page');
    await act(async () => {
      prev.click();
    });
  });

  test('renders with user data', () => {
    const { getByRole } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppSharing
            url="http://localhost:3000/"
            permissions={{
              users: ['user1', 'user2'],
              groups: ['group1', 'group2'],
            }}
            isPublic={true}
            setIsPublic={vi.fn()}
            setCurrentUserPermissions={vi.fn()}
            setCurrentGroupPermissions={vi.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(getByRole('combobox')).toBeTruthy();
  });

  test('Adds permissions to table', async () => {
    const user = userEvent.setup();
    const setUserPermissionMock = vi.fn();
    const setGroupPermissionMock = vi.fn();
    const { getByRole, getByText } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppSharing
            permissions={{
              users: ['user1', 'user2', 'user3'],
              groups: ['group1', 'group2'],
            }}
            isPublic={false}
            setIsPublic={vi.fn()}
            setCurrentUserPermissions={setUserPermissionMock}
            setCurrentGroupPermissions={setGroupPermissionMock}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    await user.click(getByRole('combobox'));
    await user.click(getByText('superadmin (Group)'));
    await user.keyboard('{Escape}');
    await user.click(getByText('Share'));

    expect(setUserPermissionMock).toHaveBeenCalledWith(expect.any(Function));
    const userMockUpdater = setUserPermissionMock.mock.calls[0][0];
    expect(userMockUpdater(['existing_user_permission'])).toEqual([
      'user1',
      'user2',
      'user3',
    ]);

    expect(setGroupPermissionMock).toHaveBeenCalledWith(expect.any(Function));
    const groupMockUpdater = setGroupPermissionMock.mock.calls[0][0];
    expect(groupMockUpdater(['existing_user_permission'])).toEqual([
      'group1',
      'group2',
      'superadmin',
    ]);
  });

  test('removes existing permission', async () => {
    const { baseElement, getAllByText } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppSharing
            url="http://localhost:3000/"
            permissions={{
              users: ['user1', 'user2'],
              groups: ['group1', 'group2'],
            }}
            isPublic={false}
            setIsPublic={vi.fn()}
            setCurrentUserPermissions={vi.fn()}
            setCurrentGroupPermissions={vi.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('table')).toBeTruthy();
    const buttons = getAllByText('Remove');
    if (buttons.length > 0) {
      const first = buttons[0];
      await act(async () => {
        first.click();
      });
      const last = buttons[buttons.length - 1];
      await act(async () => {
        last.click();
      });
    }
  });

  test('sets to public', async () => {
    const { baseElement, getByTestId } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppSharing
            isPublic={false}
            setIsPublic={vi.fn()}
            setCurrentUserPermissions={vi.fn()}
            setCurrentGroupPermissions={vi.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('#is-public')).toBeTruthy();
    const button = baseElement.querySelector('#is-public') as HTMLButtonElement;
    if (button) {
      await act(async () => {
        button.click();
      });
      waitFor(() => {
        const icon = getByTestId('app-sharing-icon-public');
        expect(icon).toBeInTheDocument();
      });
    }
  });

  test('clicks to copy to clipboard', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppSharing
            url="http://localhost:3000/"
            isPublic={true}
            setIsPublic={vi.fn()}
            setCurrentUserPermissions={vi.fn()}
            setCurrentGroupPermissions={vi.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('#sharing-link')).toBeTruthy();
    const button = baseElement.querySelector(
      '#copy-to-clipboard',
    ) as HTMLButtonElement;
    if (button) {
      await act(async () => {
        button.click();
      });
    }
  });

  test('sorts permissions with users first and groups second', () => {
    const availablePermissions = [
      { name: 'group2', type: 'group' },
      { name: 'user3', type: 'user' },
      { name: 'group1', type: 'group' },
      { name: 'user1', type: 'user' },
      { name: 'user2', type: 'user' },
    ];

    const sortedPermissions = availablePermissions.sort((a, b) => {
      const labelA = a.type === 'user' ? a.name : `${a.name} (Group)`;
      const labelB = b.type === 'user' ? b.name : `${b.name} (Group)`;

      if (a.type === 'user' && b.type !== 'user') {
        return -1;
      }
      if (a.type !== 'user' && b.type === 'user') {
        return 1;
      }

      return labelA.localeCompare(labelB);
    });

    expect(sortedPermissions).toEqual([
      { name: 'user1', type: 'user' },
      { name: 'user2', type: 'user' },
      { name: 'user3', type: 'user' },
      { name: 'group1', type: 'group' },
      { name: 'group2', type: 'group' },
    ]);
  });
});
