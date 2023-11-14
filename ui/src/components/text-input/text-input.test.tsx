import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { TextInput } from './text-input';

describe('Button', () => {
  test('renders a default button successfully', () => {
    const { baseElement } = render(<TextInput id="default-input" />);
    const input = baseElement.querySelector('input');

    expect(input).toBeInTheDocument();
  });

  test('renders with number type', () => {
    const { baseElement } = render(<TextInput id="input" type="number" />);
    const input = baseElement.querySelector('input');
    expect(input).toHaveClass('text-input');
    expect(input).toHaveAttribute('type', 'number');
  });

  test('fires event callback when changed', () => {
    const spy = jest.fn();
    const { baseElement } = render(
      <TextInput id="input" placeholder="foo" onChange={spy} />,
    );
    const input = baseElement.querySelector('input') as HTMLInputElement;

    expect(input).toHaveClass('text-input');

    fireEvent.change(input, { target: { value: 'bar' } });
    expect(spy).toHaveBeenCalled();
  });
});
