import { render } from '@testing-library/react';
import { Label } from '..';

describe('Label', () => {
  test('renders successfully', () => {
    const { baseElement } = render(<Label id="label">Label</Label>);
    expect(baseElement.querySelector('label')).toBeTruthy();
  });
});
