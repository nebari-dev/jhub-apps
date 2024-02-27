import axios from '@src/utils/axios';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ServerTypes } from './server-types';

// Mock
jest.mock('@src/utils/axios', () => ({
  get: jest.fn(),
}));

// Initial render test remains the same
test('initially displays loading state or no data message', () => {
  render(<ServerTypes />);
  expect(
    screen.getByText(/Please select the appropriate server for you app/i),
  ).toBeInTheDocument();
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

  render(<ServerTypes />);

  await waitFor(() => {
    expect(screen.getByLabelText(/Type 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type 2/i)).toBeInTheDocument();
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

  render(<ServerTypes />);

  await waitFor(() => {
    fireEvent.click(screen.getByLabelText(/Type 1/i));
    expect(screen.getByLabelText(/Type 1/i)).toBeChecked();
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

  render(<ServerTypes />);

  await waitFor(() => {
    fireEvent.click(screen.getByLabelText(/Type 1/i));
  });

  fireEvent.click(screen.getByText(/Create App/i));

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith('Selected server type:', 'type1');
  });

  // Cleanup to avoid memory leak issues
  consoleSpy.mockRestore();
});
