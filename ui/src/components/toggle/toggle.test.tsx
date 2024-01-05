import '@testing-library/jest-dom';
import { act, fireEvent, render } from '@testing-library/react';
import { Toggle } from './toggle';

describe('Toggle', () => {
  test('renders a default toggle successfully', () => {
    const { baseElement } = render(<Toggle id="default-toggle" />);
    const input = baseElement.querySelector('input');

    expect(input).toBeInTheDocument();
  });

  test('renders a toggle with label', () => {
    const { baseElement } = render(<Toggle id="label-toggle" label="label" />);
    const label = baseElement.querySelector('label');

    expect(label).toBeInTheDocument();
  });

  test('fires event callback when changed', async () => {
    const { baseElement } = render(<Toggle id="clickable-toggle" />);
    const input = baseElement.querySelector('input') as HTMLInputElement;
    const body = baseElement.querySelector('.toggle-body') as HTMLInputElement;
    expect(body).not.toHaveClass('btn-primary');

    await act(async () => {
      fireEvent.click(input);
    });
  });
});
