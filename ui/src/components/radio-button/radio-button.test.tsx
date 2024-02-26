import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import RadioButton, { RadioButtonProps } from './radio-button';

describe('RadioButton', () => {
  const defaultProps: RadioButtonProps = {
    id: 'test-id',
    name: 'test-name',
    label: 'Test Label',
    value: 'test-value',
    checked: false,
    onChange: jest.fn(),
  };

  test('renders correctly', () => {
    const { getByLabelText } = render(<RadioButton {...defaultProps} />);
    expect(getByLabelText('Test Label')).toBeInTheDocument();
  });

  test('calls onChange when clicked', () => {
    const { getByLabelText } = render(<RadioButton {...defaultProps} />);
    fireEvent.click(getByLabelText('Test Label'));
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  test('calls onClick when provided and clicked', () => {
    const onClick = jest.fn();
    const props = { ...defaultProps, onClick };
    const { getByLabelText } = render(<RadioButton {...props} />);
    fireEvent.click(getByLabelText('Test Label'));
    expect(onClick).toHaveBeenCalled();
  });
});
