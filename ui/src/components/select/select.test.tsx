import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '..';

describe('Select', () => {
  const options = [
    { label: '1', value: 'Item 1' },
    { label: '2', value: 'Item 2' },
  ];

  test('renders default select successfully', () => {
    const { baseElement } = render(<Select id="select" options={[]} />);
    expect(baseElement.querySelector('select')).toBeTruthy();
  });

  test('renders select with options', () => {
    const { baseElement } = render(<Select id="select" options={options} />);
    expect(baseElement.querySelectorAll('option')).toHaveLength(2);
  });

  test('selects an option when clicked', async () => {
    const handleChange = jest.fn();
    const { baseElement } = render(
      <Select id="select" options={options} onChange={handleChange} />,
    );

    const select = baseElement.querySelector('select') as HTMLSelectElement;
    if (select) {
      act(async () => {
        await userEvent.selectOptions(select, ['Item 1']);
        expect(handleChange).toHaveBeenCalledWith('Item 1');
      });
    }
  });
});
