import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppCard } from './app-card';

describe('AppCard', () => {
  test('renders default app card successfully', () => {
    const { baseElement } = render(
      <AppCard
        id="card-1"
        title="Card 1"
        framework="Some Framework"
        url="/some-url"
      />,
    );
    const header = baseElement.querySelector('h3');
    expect(header).toHaveTextContent('Card 1');
  });

  test('renders app card with thumbnail', () => {
    const { baseElement } = render(
      <AppCard
        id="card-1"
        title="Card 1"
        framework="Some Framework"
        url="/some-url"
        thumbnail="/some-thumbnail.png"
      />,
    );
    const header = baseElement.querySelector('h3');
    expect(header).toHaveTextContent('Card 1');
    const img = baseElement.querySelector('img');
    expect(img).toHaveAttribute('src', '/some-thumbnail.png');
  });
});
