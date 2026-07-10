import { API_BASE_URL } from './constants';

export interface RuntimeThemeConfig {
  logo?: string;
  favicon?: string;
  font?: {
    family?: string;
    url?: string;
  };
  cssVariables?: Record<string, string>;
}

export interface RuntimeConfig {
  theme?: RuntimeThemeConfig;
}

const DEFAULT_THEME: RuntimeThemeConfig = {
  logo: '/services/japps/static/img/Nebari-Logo-Horizontal-Lockup-Black-text.svg',
  favicon: '/services/japps/static/favicon.ico',
  font: {
    family: "'Inter', sans-serif",
  },
  cssVariables: {
    '--app-font-family': "'Inter', sans-serif",
    '--primary-color': '#ba18da',
    '--primary-color-light': '#BA18DA10',
    '--primary-color-dark': '#9b00ce',
    '--secondary-color': '#18817a',
    '--secondary-color-dark': '#12635e',
    '--accent-color': '#eda61d',
    '--accent-color-dark': '#a16d14',
    '--text-color': '#1c1d26',
    '--link-text-color': '#1c1d26',
    '--heading-color': '#0f1015',
    '--h2-color': '#0f1015',
    '--navbar-background-color': '#ffffff',
    '--navbar-text-color': '#2E2F33',
    '--navbar-hover-color': '#00000008',
  },
};

const CONFIG_PATH = `${API_BASE_URL.replace(/\/$/, '')}/config.json`;
const FONT_LINK_ID = 'jhub-apps-theme-font';

export const applyRuntimeTheme = (theme?: RuntimeThemeConfig) => {
  const mergedTheme = {
    ...DEFAULT_THEME,
    ...theme,
    font: {
      ...DEFAULT_THEME.font,
      ...theme?.font,
    },
    cssVariables: {
      ...DEFAULT_THEME.cssVariables,
      ...theme?.cssVariables,
    },
  };

  for (const [name, value] of Object.entries(mergedTheme.cssVariables ?? {})) {
    document.documentElement.style.setProperty(name, value);
  }

  if (mergedTheme.font?.url) {
    let fontLink = document.getElementById(
      FONT_LINK_ID,
    ) as HTMLLinkElement | null;
    if (!fontLink) {
      fontLink = document.createElement('link');
      fontLink.id = FONT_LINK_ID;
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);
    }
    fontLink.href = mergedTheme.font.url;
  }

  window.theme = mergedTheme;
};

export const loadRuntimeConfig = async () => {
  try {
    const response = await fetch(CONFIG_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load runtime config: ${response.status}`);
    }
    const config = (await response.json()) as RuntimeConfig;
    applyRuntimeTheme(config.theme);
  } catch {
    applyRuntimeTheme();
  }
};
