import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { EnvironmentVariables } from '..';

describe('EnvironmentVariables', () => {
  test('renders default successfully', () => {
    const { baseElement } = render(
      <EnvironmentVariables variables={null} setVariables={jest.fn()} />,
    );

    expect(baseElement).toBeTruthy();
  });

  test('renders with mock data', async () => {
    const { baseElement } = render(
      <EnvironmentVariables
        variables="{'key':'value'}"
        setVariables={jest.fn()}
      />,
    );

    waitFor(() => {
      const rows = baseElement.querySelectorAll('attr[name="key"]');
      expect(rows).toHaveLength(1);
    });
  });

  test('Adds a new row', async () => {
    const { baseElement, getByText } = render(
      <EnvironmentVariables variables={null} setVariables={jest.fn()} />,
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
        setVariables={jest.fn()}
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
        variables="{key:'value'}"
        setVariables={jest.fn()}
      />,
    );

    waitFor(() => {
      const input = baseElement.querySelectorAll(
        'attr[name="key"]',
      )[0] as HTMLInputElement;
      if (input) {
        fireEvent.change(input, 'new key');
      }

      const rows = baseElement.querySelectorAll('attr[name="key"]');
      expect(rows).toHaveLength(1);
      expect(rows[0].textContent).toBe('new key');
    });

    waitFor(() => {
      const input = baseElement.querySelectorAll(
        'attr[name="value"]',
      )[0] as HTMLInputElement;
      if (input) {
        fireEvent.change(input, 'new value');
      }

      const rows = baseElement.querySelectorAll('attr[name="key"]');
      expect(rows).toHaveLength(1);
      expect(rows[0].textContent).toBe('new value');
    });
  });
});
