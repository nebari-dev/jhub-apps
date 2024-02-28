import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ServerTypes } from './server-types';

// Mock
jest.mock('@src/utils/axios', () => ({
  get: jest.fn(),
}));

// Create a client
const queryClient = new QueryClient();

// Initial render test
test('initially displays loading state or no data message', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <ServerTypes />
    </QueryClientProvider>,
  );
  expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
});

// Test API Data
test('fetches and displays server types', async () => {
  const mockServerTypes = [
    { slug: 'type1', display_name: 'Type 1', description: 'Description 1' },
    { slug: 'type2', display_name: 'Type 2', description: 'Description 2' },
  ];

  // Directly return a promise that resolves with the mock data
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: mockServerTypes }),
  );

  render(
    <QueryClientProvider client={queryClient}>
      <ServerTypes />
    </QueryClientProvider>,
  );

  await waitFor(() => {
    expect(screen.getByText(/Type 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Type 2/i)).toBeInTheDocument();
  });
});

// Test Radio Button Change
test('allows radio button selection', async () => {
  const mockServerTypes = [
    { slug: 'type1', display_name: 'Type 1', description: 'Description 1' },
    { slug: 'type2', display_name: 'Type 2', description: 'Description 2' },
  ];

  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: mockServerTypes }),
  );

  render(
    <QueryClientProvider client={queryClient}>
      <ServerTypes />
    </QueryClientProvider>,
  );

  await waitFor(() => {
    fireEvent.click(screen.getByText(/Type 1/i));
    expect(screen.getByRole('radio', { name: /Type 1/i })).toBeChecked();
  });
});

// Test form submission
test('submits selected server type', async () => {
  const mockServerTypes = [
    { slug: 'type1', display_name: 'Type 1', description: 'Description 1' },
  ];

  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: mockServerTypes }),
  );
  const consoleSpy = jest.spyOn(console, 'log');

  render(
    <QueryClientProvider client={queryClient}>
      <ServerTypes />
    </QueryClientProvider>,
  );

  await waitFor(() => {
    fireEvent.click(screen.getByText(/Type 1/i));
  });

  fireEvent.click(screen.getByText(/Create App/i));

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith('Selected server type:', 'type1');
  });

  // Cleanup to avoid memory leak issues
  consoleSpy.mockRestore();
});
