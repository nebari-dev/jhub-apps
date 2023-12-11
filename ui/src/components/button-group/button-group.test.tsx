import { render } from '@testing-library/react';
import { Button, ButtonGroup } from '..';

describe('ButtonGroup', () => {
  test('renders successfully', () => {
    const { baseElement } = render(
      <ButtonGroup id="group">
        <Button id="button-1">Button</Button>
      </ButtonGroup>,
    );
    expect(baseElement.querySelector('button')).toBeTruthy();
  });
});
