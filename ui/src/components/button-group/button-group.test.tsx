import { Button } from '@mui/material';
import { render } from '@testing-library/react';
import { ButtonGroup } from '..';

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

  test('renders button group with custom class', () => {
    const { baseElement } = render(
      <ButtonGroup className="custom-class">
        <Button id="button-1">Button</Button>
      </ButtonGroup>,
    );

    expect(baseElement.querySelector('.custom-class')).toBeTruthy();
  });

  test('renders button group with multiple children', () => {
    const { baseElement } = render(
      <ButtonGroup>
        <Button id="button-1">Button 1</Button>
        <Button id="button-2">Button 2</Button>
      </ButtonGroup>,
    );

    expect(baseElement.querySelectorAll('button').length).toBe(2);
  });
});
