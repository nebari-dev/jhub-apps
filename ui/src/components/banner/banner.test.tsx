import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Banner, safeCssValue } from './banner';

describe('Banner', () => {
  test('renders configured text', () => {
    render(<Banner position="top" config={{ text: 'CUI' }} />);

    const banner = screen.getByRole('note');
    expect(banner).toHaveTextContent('CUI');
    expect(banner).toHaveAttribute('data-testid', 'top-banner');
  });

  test('renders nothing when config is absent', () => {
    render(<Banner position="top" />);

    expect(screen.queryByRole('note')).toBeNull();
  });

  test('renders nothing when text is empty', () => {
    render(<Banner position="bottom" config={{ text: '' }} />);

    expect(screen.queryByRole('note')).toBeNull();
  });

  test('applies configured colors', () => {
    render(
      <Banner
        position="top"
        config={{ text: 'CUI', background: '#502b85', foreground: '#ffffff' }}
      />,
    );

    const banner = screen.getByRole('note');
    expect(banner).toHaveStyle({
      backgroundColor: '#502b85',
      color: '#ffffff',
    });
  });

  test('ignores unsafe color values', () => {
    render(
      <Banner
        position="top"
        config={{
          text: 'CUI',
          background: 'red; background-image: url(https://evil.example)',
          foreground: 'javascript:alert(1)',
        }}
      />,
    );

    const banner = screen.getByRole('note');
    expect(banner.style.backgroundColor).toBe('');
    expect(banner.style.color).toBe('');
  });

  test('renders text as plain text, never HTML', () => {
    render(
      <Banner position="top" config={{ text: '<img src=x onerror=x>' }} />,
    );

    const banner = screen.getByRole('note');
    expect(banner.querySelector('img')).toBeNull();
    expect(banner).toHaveTextContent('<img src=x onerror=x>');
  });

  test('publishes its height as a CSS variable and removes it on unmount', () => {
    const { unmount } = render(
      <Banner position="bottom" config={{ text: 'CUI' }} />,
    );

    expect(
      document.documentElement.style.getPropertyValue(
        '--bottom-banner-height',
      ),
    ).toBe('0px'); // jsdom reports offsetHeight 0

    unmount();

    expect(
      document.documentElement.style.getPropertyValue(
        '--bottom-banner-height',
      ),
    ).toBe('');
  });
});

describe('safeCssValue', () => {
  test('passes safe values and rejects injection vectors', () => {
    expect(safeCssValue('#502b85')).toBe('#502b85');
    expect(safeCssValue('rgb(80 43 133)')).toBe('rgb(80 43 133)');
    expect(safeCssValue(undefined)).toBeUndefined();
    expect(safeCssValue('red;color:blue')).toBeUndefined();
    expect(safeCssValue('url(https://evil.example)')).toBeUndefined();
    expect(safeCssValue('expression (alert(1))')).toBeUndefined();
  });
});
