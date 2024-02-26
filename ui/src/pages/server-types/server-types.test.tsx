import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RadioButton from '../../components/radio-button/radio-button';
import { ServerTypes } from './server-types';

// Mock the RadioButton component
jest.mock('../../components/radio-button/radio-button', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe('ServerTypes page', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    (RadioButton as jest.Mock).mockClear();

    // Setup mock for RadioButton with a functional component that simulates the real one
    (RadioButton as jest.Mock).mockImplementation(
      ({ id, name, subtext, checked, onChange }) => (
        <label>
          <input
            type="radio"
            value={id}
            checked={checked}
            onChange={onChange}
          />
          {name} - {subtext}
        </label>
      ),
    );
  });

  test('renders the correct number of radio buttons', () => {
    render(<ServerTypes />);
    expect(screen.getAllByRole('radio').length).toBe(8);
  });

  test('selects a radio button and updates the state correctly', () => {
    render(<ServerTypes />);

    const firstRadioButton = screen.getAllByRole('radio')[0];
    fireEvent.click(firstRadioButton);

    expect(firstRadioButton).toBeChecked();
  });

  test('submits the selected server type', async () => {
    render(<ServerTypes />);

    const createAppButton = screen.getByText('Create App');
    const firstRadioButton = screen.getAllByRole('radio')[0];

    // Mocking console.log to test if the correct value is logged
    const consoleSpy = jest.spyOn(console, 'log');

    fireEvent.click(firstRadioButton);
    fireEvent.click(createAppButton);

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith('Selected server type:', '1'),
    );
  });
});
