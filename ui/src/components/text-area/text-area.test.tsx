import { render } from '@testing-library/react';
import { TextArea } from '..';

describe('TextArea', () => {
  test('renders successfully', () => {
    const { baseElement } = render(<TextArea id="textarea" />);
    expect(baseElement.querySelector('textarea')).toBeTruthy();
  });
});
