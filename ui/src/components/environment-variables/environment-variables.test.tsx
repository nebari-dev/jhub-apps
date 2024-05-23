import { render } from '@testing-library/react';
import { EnvironmentVariables } from '..';

describe('EnvironmentVariables', () => {
  test('renders default successfully', () => {
    const { baseElement } = render(
      <EnvironmentVariables variables="" setVariables={jest.fn()} />,
    );

    expect(baseElement).toBeTruthy();
  });
});
