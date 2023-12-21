import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { FileInput } from './file-input';

describe('FileInput', () => {
  test('renders a default file input successfully', () => {
    const { baseElement } = render(<FileInput id="input" name="input" />);
    const input = baseElement.querySelector('input');

    expect(input).toBeInTheDocument();
  });

  test('renders a file input with multiple files allowed', () => {
    const { baseElement } = render(<FileInput id="input" allowMultiple />);
    const input = baseElement.querySelector('input');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('multiple');
  });

  test('renders a file input with allowed file types', () => {
    const { baseElement } = render(
      <FileInput id="input" allowedFileTypes="image/png" />,
    );
    const input = baseElement.querySelector('input');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('accept', 'image/png');
  });
});
