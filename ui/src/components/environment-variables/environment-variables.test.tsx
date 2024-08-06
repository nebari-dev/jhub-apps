import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { EnvironmentVariables } from '..';

describe('EnvironmentVariables', () => {
  test('renders default successfully', () => {
    const { baseElement } = render(
      <EnvironmentVariables variables={null} setVariables={vi.fn()} />,
    );

    expect(baseElement).toBeTruthy();
  });

  test('renders with mock data', async () => {
    const { baseElement } = render(
      <EnvironmentVariables
        variables="{'key':'value'}"
        setVariables={vi.fn()}
      />,
    );

    waitFor(() => {
      const rows = baseElement.querySelectorAll('attr[name="key"]');
      expect(rows).toHaveLength(1);
    });
  });

  test('Adds a new row', async () => {
    const { baseElement, getByText } = render(
      <EnvironmentVariables variables={null} setVariables={vi.fn()} />,
    );

    const button = getByText('Add Variable');
    if (button) {
      button?.click();
    }

    waitFor(() => {
      const rows = baseElement.querySelectorAll('attr[name="key"]');
      expect(rows).toHaveLength(1);
    });
  });

  test('Removes a row', async () => {
    const { baseElement, getAllByTestId } = render(
      <EnvironmentVariables
        variables="{'key':'value'}"
        setVariables={vi.fn()}
      />,
    );

    const button = getAllByTestId('CloseRoundedIcon')[0];
    if (button) {
      await act(async () => {
        (button.parentNode as HTMLButtonElement)?.click();
      });
    }

    waitFor(() => {
      const rows = baseElement.querySelectorAll('attr[name="key"]');
      expect(rows).toHaveLength(0);
    });
  });

  test('Updates a row', async () => {
    const { baseElement } = render(
      <EnvironmentVariables
        variables="{'key':'value'}"
        setVariables={vi.fn()}
      />,
    );
    let input = baseElement.querySelector(
      '#environment-variable-key-0',
    ) as HTMLButtonElement;
    if (input) {
      await act(async () => {
        fireEvent.change(input, { target: { value: 'new key' } });
      });
      expect(input.value).toBe('new key');
    }

    input = baseElement.querySelector(
      '#environment-variable-value-0',
    ) as HTMLButtonElement;
    if (input) {
      await act(async () => {
        fireEvent.change(input, { target: { value: 'new value' } });
      });
      expect(input.value).toBe('new value');
    }
  });
});
