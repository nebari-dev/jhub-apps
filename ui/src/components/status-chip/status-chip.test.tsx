import { render } from '@testing-library/react';
import { StatusChip } from '..';

describe('StatusChip', () => {
  test('renders default successfully', () => {
    const { baseElement } = render(<StatusChip status="Ready" />);

    expect(baseElement.querySelector('.MuiChip-root')).toBeTruthy();
  });

  test('renders default successfully', () => {
    const { baseElement } = render(<StatusChip status="Pending" />);

    expect(baseElement.querySelector('.MuiChip-root')).toBeTruthy();
  });

  test('renders default successfully', () => {
    const { baseElement } = render(<StatusChip status="Running" />);

    expect(baseElement.querySelector('.MuiChip-root')).toBeTruthy();
  });

  test('renders default successfully', () => {
    const { baseElement } = render(<StatusChip status="Unknown" />);

    expect(baseElement.querySelector('.MuiChip-root')).toBeTruthy();
  });
});
