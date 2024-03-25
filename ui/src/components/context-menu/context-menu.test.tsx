import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ContextMenu from './context-menu'; // Adjust the import based on your file structure

describe('ContextMenu', () => {
  test('renders without crashing', () => {
    const { baseElement } = render(<ContextMenu id="menu-1" items={[]} />);
    const menu = baseElement.querySelector('#menu-1');
    expect(menu).toBeTruthy();
  });

  test('opens menu on button click', () => {
    const { getByRole } = render(<ContextMenu id="menu-1" items={[]} />);
    act(() => {
      fireEvent.click(getByRole('button', { name: '...' }));
    });
    expect(getByRole('menu')).toBeVisible();
  });

  test('displays correct number of visible items', () => {
    const items = [
      { id: 'item-1', title: 'Item 1', visible: true },
      { id: 'item-2', title: 'Item 2', visible: false },
      { id: 'item-3', title: 'Item 3', visible: true },
    ];
    const { getByRole, getAllByRole } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    fireEvent.click(getByRole('button', { name: '...' }));
    expect(getAllByRole('menuitem')).toHaveLength(2);
  });

  test('calls onClick when an enabled item is clicked', () => {
    const onClick = jest.fn();
    const items = [{ id: 'item-1', title: 'Item 1', visible: true, onClick }];
    const { getByRole, getByText } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    fireEvent.click(getByRole('button', { name: '...' }));
    fireEvent.click(getByText('Item 1'));
    expect(onClick).toHaveBeenCalled();
  });

  test('does not call onClick when a disabled item is clicked', () => {
    const onClick = jest.fn();
    const items = [
      { id: 'item-1', title: 'Item 1', visible: true, disabled: true, onClick },
    ];
    const { getByRole, getByText } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    fireEvent.click(getByRole('button', { name: '...' }));
    fireEvent.click(getByText('Item 1'));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('closes menu after item click', () => {
    const onClick = jest.fn();
    const items = [{ id: 'item-1', title: 'Item 1', visible: true, onClick }];
    const { getByRole, getByText, queryByRole } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    fireEvent.click(getByRole('button', { name: '...' }));
    fireEvent.click(getByText('Item 1'));
    expect(queryByRole('menu')).not.toBeInTheDocument();
  });
});
