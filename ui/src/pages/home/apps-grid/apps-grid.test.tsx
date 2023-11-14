import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppsGrid } from './apps-grid';

describe('AppsGrid', () => {
  test('renders default apps grid successfully', () => {
    const { baseElement } = render(<AppsGrid />);
    const header = baseElement.querySelector('h4');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('My Apps');
  });

  test('renders shared apps grid successfully', () => {
    const { baseElement } = render(<AppsGrid appType="Shared" />);
    const header = baseElement.querySelector('h4');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Shared Apps');
  });
});
