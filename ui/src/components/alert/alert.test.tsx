import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Alert } from './alert';

describe('Alert', () => {
  test('renders default alert successfully', () => {
    const { baseElement } = render(<Alert id="alert">Alert</Alert>);
    const alert = baseElement.querySelector('#alert');
    expect(alert).toHaveClass('alert');
    expect(alert).toHaveClass('alert-info');
  });

  test('renders an info alert successfully', () => {
    const { baseElement } = render(
      <Alert id="alert" type="info">
        Alert
      </Alert>,
    );
    const alert = baseElement.querySelector('#alert');
    expect(alert).toHaveClass('alert-info');
  });

  test('renders a warning alert successfully', () => {
    const { baseElement } = render(
      <Alert id="alert" type="warning">
        Alert
      </Alert>,
    );
    const alert = baseElement.querySelector('#alert');
    expect(alert).toHaveClass('alert-warning');
  });

  test('renders an error alert successfully', () => {
    const { baseElement } = render(
      <Alert id="alert" type="error">
        Alert
      </Alert>,
    );
    const alert = baseElement.querySelector('#alert');
    expect(alert).toHaveClass('alert-error');
  });

  test('renders an success alert successfully', () => {
    const { baseElement } = render(
      <Alert id="alert" type="success">
        Alert
      </Alert>,
    );
    const alert = baseElement.querySelector('#alert');
    expect(alert).toHaveClass('alert-success');
  });
});
