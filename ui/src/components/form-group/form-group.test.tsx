import { render } from '@testing-library/react';
import { FormGroup } from '..';

describe('FormGroup', () => {
  test('renders successfully', () => {
    const { baseElement } = render(<FormGroup id="group">Some form</FormGroup>);
    expect(baseElement.querySelector('div')).toBeTruthy();
  });
});
