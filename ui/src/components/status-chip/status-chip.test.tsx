import { render } from '@testing-library/react';
import { StatusChip } from '..';

describe('StatusChip', () => {
  test('renders default successfully', () => {
    const { baseElement } = render(<StatusChip status="Ready" />);
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Ready');
  });

  test('renders default successfully', () => {
    const { baseElement } = render(<StatusChip status="Pending" />);
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Pending');
  });

  test('renders default successfully', () => {
    const { baseElement } = render(<StatusChip status="Running" />);
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Running');
  });

  test('renders default successfully', () => {
    const { baseElement } = render(<StatusChip status="Unknown" />);
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Unknown');
  });
});
