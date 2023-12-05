import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
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
          },
          {
            id: 'item-2',
            title: 'Item 2',
          },
        ]}
      />,
    );
    const items = baseElement.querySelectorAll('li');
    expect(items).toHaveLength(2);
  });
});
