import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { FormGroup } from '..';

describe('FormGroup', () => {
  test('renders successfully', () => {
    const { baseElement } = render(<FormGroup id="group">Some form</FormGroup>);
    expect(baseElement.querySelector('#group')).toBeTruthy();
  });

  test('renders with errors', () => {
    const { baseElement } = render(
      <FormGroup id="group" errors={['Some error']}>
        Some form
      </FormGroup>,
    );
    expect(baseElement.querySelector('#group')).toBeTruthy();
    expect(baseElement.querySelector('#group')).toHaveClass('form-group-error');
  });
});
