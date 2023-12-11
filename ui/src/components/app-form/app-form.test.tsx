import { render } from '@testing-library/react';
import { AppForm } from '..';

describe('AppForm', () => {
  test('renders successfully', () => {
    const { baseElement } = render(<AppForm />);
    expect(baseElement.querySelector('div')).toBeTruthy();
  });
});
