import { render } from '@testing-library/react';
import { Label } from '..';

describe('Label', () => {
  test('renders default label successfully', () => {
    const { baseElement } = render(<Label>Label</Label>);
    expect(baseElement.querySelector('label')).toBeTruthy();
  });

  test('renders label with id', () => {
    const { baseElement } = render(<Label id="label">Label</Label>);
    expect(baseElement.querySelector('#label')).toBeTruthy();
  });

  test('renders required label', () => {
    const { baseElement } = render(
      <Label id="label" required>
        Label
      </Label>,
    );

    expect(baseElement.querySelector('#label')).toBeTruthy();
    expect(baseElement.querySelector('.text-red')).toBeTruthy();
  });
});
