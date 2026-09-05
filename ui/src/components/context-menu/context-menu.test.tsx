import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContextMenu from './context-menu';

describe('ContextMenu', () => {
  test('renders without crashing', () => {
    const { baseElement } = render(<ContextMenu id="menu-1" items={[]} />);
    const menu = baseElement.querySelector('#menu-1');
    expect(menu).toBeTruthy();
  });

  test('opens menu on button click', async () => {
    const user = userEvent.setup();
    const { getByTestId, findByRole } = render(
      <ContextMenu id="menu-1" items={[]} />,
    );
    await user.click(getByTestId('context-menu-button-menu-1'));
    // Base UI mounts the popup asynchronously after the trigger opens it.
    expect(await findByRole('menu')).toBeVisible();
  });

  test('displays correct number of visible items', async () => {
    const user = userEvent.setup();
    const items = [
      { id: 'item-1', title: 'Item 1', visible: true },
      { id: 'item-2', title: 'Item 2', visible: false },
      { id: 'item-3', title: 'Item 3', visible: true },
    ];
    const { getByTestId, findAllByRole } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    await user.click(getByTestId('context-menu-button-menu-1'));
    expect(await findAllByRole('menuitem')).toHaveLength(2);
  });

  test('calls onClick when an enabled item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items = [{ id: 'item-1', title: 'Item 1', visible: true, onClick }];
    const { getByTestId, findByText } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    await user.click(getByTestId('context-menu-button-menu-1'));
    await user.click(await findByText('Item 1'));
    expect(onClick).toHaveBeenCalled();
  });

  test('does not call onClick when a disabled item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items = [
      { id: 'item-1', title: 'Item 1', visible: true, disabled: true, onClick },
    ];
    const { getByTestId, findByText } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    await user.click(getByTestId('context-menu-button-menu-1'));
    await user.click(await findByText('Item 1'));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('closes menu after item click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items = [{ id: 'item-1', title: 'Item 1', visible: true, onClick }];
    const { findByText, queryByRole, getByTestId } = render(
      <ContextMenu id="menu-1" items={items} />,
    );
    await user.click(getByTestId('context-menu-button-menu-1'));
    await user.click(await findByText('Item 1'));
    await waitFor(() => {
      expect(queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
