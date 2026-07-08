import { fireEvent, render, screen } from '@testing-library/react';
import { NotificationBar } from '..';

describe('NotificationBar', () => {
  test('renders default notification bar successfully', () => {
    render(<NotificationBar message="default" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByTestId('alert-message')).toHaveTextContent('default');
  });

  test('renders an error notification bar successfully', () => {
    render(<NotificationBar message="default" severity="error" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('data-severity', 'error');
  });

  test('renders an warning notification bar successfully', () => {
    render(<NotificationBar message="default" severity="warning" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('data-severity', 'warning');
  });

  test('renders an info notification bar successfully', () => {
    render(<NotificationBar message="default" severity="info" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('data-severity', 'info');
  });

  test('renders an success notification bar successfully', () => {
    render(<NotificationBar message="default" severity="success" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('data-severity', 'success');
  });

  test('renders a close button and calls onClose when clicked', () => {
    const onClose = vi.fn();
    render(<NotificationBar message="default" onClose={onClose} />);
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
