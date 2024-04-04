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
    const { getByTestId, getByRole } = render(
      <ContextMenu id="menu-1" items={[]} />,
    );
    act(() => {
      fireEvent.click(getByTestId('context-menu-button-menu-1'));
    });
    expect(getByRole('menu')).toBeVisible();
  });

  test('displays correct number of visible items', () => {
    const items = [
      { id: 'item-1', title: 'Item 1', visible: true },
      { id: 'item-2', title: 'Item 2', visible: false },
      { id: 'item-3', title: 'Item 3', visible: true },
    ];
    const { getByTestId, getAllByRole } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    fireEvent.click(getByTestId('context-menu-button-menu-1'));
    expect(getAllByRole('menuitem')).toHaveLength(2);
  });

  test('calls onClick when an enabled item is clicked', () => {
    const onClick = jest.fn();
    const items = [{ id: 'item-1', title: 'Item 1', visible: true, onClick }];
    const { getByTestId, getByText } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    fireEvent.click(getByTestId('context-menu-button-menu-1'));
    fireEvent.click(getByText('Item 1'));
    expect(onClick).toHaveBeenCalled();
  });

  test('does not call onClick when a disabled item is clicked', () => {
    const onClick = jest.fn();
    const items = [
      { id: 'item-1', title: 'Item 1', visible: true, disabled: true, onClick },
    ];
    const { getByTestId, getByText } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    fireEvent.click(getByTestId('context-menu-button-menu-1'));
    fireEvent.click(getByText('Item 1'));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('closes menu after item click', () => {
    const onClick = jest.fn();
    const items = [{ id: 'item-1', title: 'Item 1', visible: true, onClick }];
    const { getByText, queryByRole, getByTestId } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    fireEvent.click(getByTestId('context-menu-button-menu-1'));
    fireEvent.click(getByText('Item 1'));
    expect(queryByRole('menu')).not.toBeInTheDocument();
  });
});
