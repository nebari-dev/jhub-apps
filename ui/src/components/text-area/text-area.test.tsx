import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { TextArea } from '..';

describe('TextArea', () => {
  test('renders default textarea successfully', () => {
    const { baseElement } = render(<TextArea id="textarea" />);
    expect(baseElement.querySelector('textarea')).toBeTruthy();
  });

  test('renders with custom rows', () => {
    const { baseElement } = render(<TextArea id="textarea" rows={3} />);
    expect(baseElement.querySelector('textarea')).toHaveAttribute('rows', '3');
  });

  test('fires event callback when changed', () => {
    const spy = jest.fn();
    const { baseElement } = render(<TextArea id="textarea" onChange={spy} />);
    const textarea = baseElement.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'bar' } });
    expect(spy).toHaveBeenCalled();
  });
});
