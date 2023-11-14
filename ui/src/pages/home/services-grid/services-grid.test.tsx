import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ServicesGrid } from './services-grid';

describe('ServicesGrid', () => {
  test('renders a default grid successfully', () => {
    const { baseElement } = render(<ServicesGrid />);
    const header = baseElement.querySelector('h4');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Services');
  });
});
