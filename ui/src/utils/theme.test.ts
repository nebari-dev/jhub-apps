import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { applyRuntimeTheme, loadRuntimeConfig } from './theme';

describe('runtime theme config', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    document.documentElement.removeAttribute('style');
    document.head.innerHTML = '';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  test('applies css variables and logo from runtime theme', () => {
    applyRuntimeTheme({
      logo: '/custom-logo.svg',
      cssVariables: {
        '--primary-color': '#123456',
        '--navbar-background-color': '#abcdef',
      },
    });

    expect(
      document.documentElement.style.getPropertyValue('--primary-color'),
    ).toBe('#123456');
    expect(
      document.documentElement.style.getPropertyValue(
        '--navbar-background-color',
      ),
    ).toBe('#abcdef');
    expect(window.theme.logo).toBe('/custom-logo.svg');
  });

  test('loads runtime config and injects configured font stylesheet', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          theme: {
            font: { url: 'https://example.com/font.css' },
            cssVariables: { '--text-color': '#654321' },
          },
        }),
    });

    await loadRuntimeConfig();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/services/japps/config.json',
    );
    expect(
      document.documentElement.style.getPropertyValue('--text-color'),
    ).toBe('#654321');
    expect(document.getElementById('jhub-apps-theme-font')).toHaveAttribute(
      'href',
      'https://example.com/font.css',
    );
  });

  test('falls back to default theme when runtime config cannot be loaded', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'));

    await loadRuntimeConfig();

    expect(
      document.documentElement.style.getPropertyValue('--primary-color'),
    ).toBe('#ba18da');
  });
});
