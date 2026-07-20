import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  applyColorMode,
  getStoredColorMode,
  initColorMode,
  isColorMode,
  isDarkMode,
  storeColorMode,
} from './color-mode';

const STORAGE_KEY = 'jhub-apps:color-mode';

const mockPrefersDark = (matches: boolean) => {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('color mode', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('isColorMode narrows only valid values', () => {
    expect(isColorMode('light')).toBe(true);
    expect(isColorMode('dark')).toBe(true);
    expect(isColorMode('system')).toBe(true);
    expect(isColorMode('bogus')).toBe(false);
  });

  test('defaults to system when nothing is stored', () => {
    expect(getStoredColorMode()).toBe('system');
  });

  test('reads a stored preference and ignores invalid values', () => {
    storeColorMode('dark');
    expect(getStoredColorMode()).toBe('dark');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');

    window.localStorage.setItem(STORAGE_KEY, 'nonsense');
    expect(getStoredColorMode()).toBe('system');
  });

  test('isDarkMode resolves system to the OS preference', () => {
    mockPrefersDark(true);
    expect(isDarkMode('system')).toBe(true);
    expect(isDarkMode('light')).toBe(false);
    expect(isDarkMode('dark')).toBe(true);

    vi.restoreAllMocks();
    mockPrefersDark(false);
    expect(isDarkMode('system')).toBe(false);
  });

  test('applyColorMode toggles the dark class on the root element', () => {
    applyColorMode('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    applyColorMode('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('initColorMode applies the stored preference and returns it', () => {
    storeColorMode('dark');
    expect(initColorMode()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('initColorMode falls back to the OS preference on first visit', () => {
    mockPrefersDark(true);
    expect(initColorMode()).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
