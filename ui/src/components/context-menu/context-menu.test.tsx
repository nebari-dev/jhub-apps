import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { ContextMenu } from './context-menu';

describe('ContextMenu', () => {
  test('renders default menu successfully', () => {
    const { baseElement } = render(<ContextMenu id="menu-1" items={[]} />);
    const menu = baseElement.querySelector('#menu-1');
    expect(menu).toBeTruthy();
  });

  test('renders menu with items', () => {
    const { baseElement } = render(
      <ContextMenu
        id="menu-1"
        items={[
          {
            id: 'item-1',
            title: 'Item 1',
            visible: true,
          },
          {
            id: 'item-2',
            title: 'Item 2',
            visible: true,
          },
        ]}
      />,
    );
    const items = baseElement.querySelectorAll('li');
    expect(items).toHaveLength(2);
  });

  test('renders menu with hidden menu items', () => {
    const { baseElement } = render(
      <ContextMenu
        id="menu-1"
        items={[
          {
            id: 'item-1',
            title: 'Item 1',
            visible: true,
          },
          {
            id: 'item-2',
            title: 'Item 2',
            visible: false,
          },
        ]}
      />,
    );
    const items = baseElement.querySelectorAll('li');
    expect(items).toHaveLength(1);
  });

  test('renders menu with disabled menu items', () => {
    const { baseElement } = render(
      <ContextMenu
        id="menu-1"
        items={[
          {
            id: 'item-1',
            title: 'Item 1',
            visible: true,
            disabled: true,
          },
          {
            id: 'item-2',
            title: 'Item 2',
            visible: false,
            disabled: false,
          },
        ]}
      />,
    );
    const items = baseElement.querySelectorAll('li');
    expect(items).toHaveLength(1);
  });

  test('calls onClick when a menu item is clicked', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <ContextMenu
        id="menu-1"
        items={[
          {
            id: 'item-1',
            title: 'Item 1',
            visible: true,
            onClick,
          },
        ]}
      />,
    );
    fireEvent.click(getByText('Item 1'));
    expect(onClick).toHaveBeenCalled();
  });
});
