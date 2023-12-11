import { render } from '@testing-library/react';
import { Select } from '..';

describe('Select', () => {
  test('renders successfully', () => {
    const { baseElement } = render(<Select id="select" options={[]} />);
    expect(baseElement.querySelector('select')).toBeTruthy();
  });
});
