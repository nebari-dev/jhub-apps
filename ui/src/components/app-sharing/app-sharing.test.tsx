import { currentUser } from '@src/data/user';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, render, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { AppSharing } from '..';
import { currentUser as defaultUser } from '../../store';

describe('AppSharing', () => {
  const queryClient = new QueryClient();
  beforeEach(() => {
    queryClient.clear();
  });

  test('renders default component successfully', () => {
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppSharing
            isPublic={false}
            setIsPublic={jest.fn()}
            setCurrentUserPermissions={jest.fn()}
            setCurrentGroupPermissions={jest.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('.MuiAlert-message')).toBeTruthy();
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
            setIsPublic={jest.fn()}
            setCurrentUserPermissions={jest.fn()}
            setCurrentGroupPermissions={jest.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('.MuiTable-root')).toBeTruthy();
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
            setIsPublic={jest.fn()}
            setCurrentUserPermissions={jest.fn()}
            setCurrentGroupPermissions={jest.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('.MuiTable-root')).toBeTruthy();
    let rows = baseElement.querySelectorAll('.MuiTableRow-root');
    expect(rows.length).toBeGreaterThan(5);
    const next = getByTestId('next-page');
    if (next) {
      await act(async () => {
        next.click();
      });
    }

    rows = baseElement.querySelectorAll('.MuiTableRow-root');
    expect(rows.length).toBeGreaterThan(1);
    const prev = getByTestId('previous-page');
    if (prev) {
      await act(async () => {
        prev.click();
      });
    }
  });

  test('renders with user data', () => {
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
            setIsPublic={jest.fn()}
            setCurrentUserPermissions={jest.fn()}
            setCurrentGroupPermissions={jest.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('.MuiAutocomplete-root')).toBeTruthy();
  });

  test('Adds permissions to table', async () => {
    const { baseElement, getByText } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <AppSharing
            permissions={{
              users: ['user1', 'user2', 'user3'],
              groups: ['group1', 'group2'],
            }}
            isPublic={false}
            setIsPublic={jest.fn()}
            setCurrentUserPermissions={jest.fn()}
            setCurrentGroupPermissions={jest.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('.MuiAutocomplete-root')).toBeTruthy();
    const autocomplete = baseElement.querySelector(
      '.MuiAutocomplete-endAdornment > .MuiButtonBase-root',
    ) as HTMLButtonElement;
    if (autocomplete) {
      await act(async () => {
        autocomplete.click();
      });
      const listbox = baseElement.querySelector('.MuiAutocomplete-listbox');
      await act(async () => {
        listbox?.querySelector('li')?.click();
      });
      const button = getByText('Share');
      await act(async () => {
        button.click();
      });
    }
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
            setIsPublic={jest.fn()}
            setCurrentUserPermissions={jest.fn()}
            setCurrentGroupPermissions={jest.fn()}
          />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('.MuiTable-root')).toBeTruthy();
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
            setIsPublic={jest.fn()}
            setCurrentUserPermissions={jest.fn()}
            setCurrentGroupPermissions={jest.fn()}
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
        const icon = getByTestId('PublicRoundedIcon');
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
            setIsPublic={jest.fn()}
            setCurrentUserPermissions={jest.fn()}
            setCurrentGroupPermissions={jest.fn()}
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
});
