import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  test('renders default button successfully', () => {
    const { getByText } = render(<Button id="default-btn">Default</Button>);
    const button = getByText('Default');

    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('btn-primary');
  });

  test('renders a secondary button', () => {
    const { getByText } = render(
      <Button id="secondary-btn" variant="secondary">
        Secondary
      </Button>,
    );
    const button = getByText('Secondary');

    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('btn-secondary');
  });

  test('renders a button element with custom props', () => {
    const onClickMock = jest.fn();
    const { getByText } = render(
      <Button
        id="custom-button"
        type="submit"
        variant="secondary"
        onClick={onClickMock}
      >
        Custom
      </Button>,
    );
    const button = getByText('Custom');

    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('btn-secondary');
  });

  test('calls the onClick callback when clicked', () => {
    const onClickMock = jest.fn();
    const { getByText } = render(
      <Button id="clickable-button" onClick={onClickMock}>
        Clickable
      </Button>,
    );
    const button = getByText('Clickable');

    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalled();
  });
});
