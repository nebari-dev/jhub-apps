import { render } from '@testing-library/react';
import { ErrorMessages } from '..';

describe('ErrorMessages', () => {
  test('renders successfully', () => {
    const { baseElement } = render(<ErrorMessages id="messages" />);
    expect(baseElement.querySelector('div')).toBeTruthy();
  });
});
