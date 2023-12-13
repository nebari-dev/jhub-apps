import { render } from '@testing-library/react';
import { Button, ButtonGroup } from '..';

describe('ButtonGroup', () => {
  test('renders default button group successfully', () => {
    const { baseElement } = render(
      <ButtonGroup>
        <Button id="button-1">Button</Button>
      </ButtonGroup>,
    );

    expect(baseElement.querySelector('button')).toBeTruthy();
  });

  test('renders button group with id', () => {
    const { baseElement } = render(
      <ButtonGroup id="group">
        <Button id="button-1">Button</Button>
      </ButtonGroup>,
    );

    expect(baseElement.querySelector('#group')).toBeTruthy();
  });
});
