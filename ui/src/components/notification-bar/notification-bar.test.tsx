import { render } from '@testing-library/react';
import { NotificationBar } from '..';

describe('NotificationBar', () => {
  test('renders default notification bar successfully', () => {
    const { baseElement } = render(<NotificationBar message="default" />);

    expect(baseElement.querySelector('.MuiAlert-message')).toBeTruthy();
  });

  test('renders an error notification bar successfully', () => {
    const { baseElement } = render(
      <NotificationBar message="default" severity="error" />,
    );

    expect(baseElement.querySelector('.MuiAlert-message')).toBeTruthy();
    expect(baseElement.querySelector('.MuiAlert-standardError')).toBeTruthy();
  });

  test('renders an warning notification bar successfully', () => {
    const { baseElement } = render(
      <NotificationBar message="default" severity="warning" />,
    );

    expect(baseElement.querySelector('.MuiAlert-message')).toBeTruthy();
    expect(baseElement.querySelector('.MuiAlert-standardWarning')).toBeTruthy();
  });

  test('renders an info notification bar successfully', () => {
    const { baseElement } = render(
      <NotificationBar message="default" severity="info" />,
    );

    expect(baseElement.querySelector('.MuiAlert-message')).toBeTruthy();
    expect(baseElement.querySelector('.MuiAlert-standardInfo')).toBeTruthy();
  });

  test('renders an success notification bar successfully', () => {
    const { baseElement } = render(
      <NotificationBar message="default" severity="success" />,
    );

    expect(baseElement.querySelector('.MuiAlert-message')).toBeTruthy();
    expect(baseElement.querySelector('.MuiAlert-standardSuccess')).toBeTruthy();
  });
});
