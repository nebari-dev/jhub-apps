import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Tag } from './tag';

describe('Tag', () => {
  test('renders default tag successfully', () => {
    const { baseElement } = render(<Tag id="tag-1">Tag 1</Tag>);
    const header = baseElement.querySelector('span');
    expect(header).toHaveTextContent('Tag 1');
  });
});
