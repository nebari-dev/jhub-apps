import { render } from '@testing-library/react';
import { ErrorMessages } from '..';

describe('ErrorMessages', () => {
  test('renders successfully', () => {
    const { baseElement } = render(<ErrorMessages />);
    expect(baseElement.querySelector('div')).toBeTruthy();
  });

  test('renders with errors', () => {
    const { baseElement } = render(
      <ErrorMessages id="messages" errors={['error']} />,
    );
    expect(baseElement.querySelector('#messages-0')).toBeTruthy();
    expect(baseElement.querySelectorAll('span')).toHaveLength(1);
  });
});
