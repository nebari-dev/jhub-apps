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

export interface RuntimeBannerConfig {
  /** Banner text, rendered as plain text (never HTML). Empty disables it. */
  text?: string;
  /** Optional CSS background color. Falls back to the theme foreground color. */
  background?: string;
  /** Optional CSS text color. Falls back to the theme background color. */
  foreground?: string;
}

export interface RuntimeBannersConfig {
  top?: RuntimeBannerConfig;
  bottom?: RuntimeBannerConfig;
}

export interface RuntimeConfig {
  theme?: RuntimeThemeConfig;
  banners?: RuntimeBannersConfig;
}

// Frontend fallback used when /services/japps/config.json cannot be loaded
// (e.g. the Vite dev server). Colours and fonts are intentionally *not*
// defaulted here: the @nebari/theme tokens in src/index.css are the default
// look, and an operator's branding (`c.JupyterHub.template_vars`) arrives as
// `cssVariables` from the server and overrides them (see the var() fallbacks
// wired up in index.css).
const DEFAULT_THEME: RuntimeThemeConfig = {
  logo: '/services/japps/static/img/Nebari-Logo-Horizontal-Lockup-Black-text.svg',
  favicon: '/services/japps/static/favicon.ico',
  cssVariables: {},
};

const CONFIG_PATH = `${API_BASE_URL.replace(/\/$/, '')}/config.json`;
const FONT_LINK_ID = 'jhub-apps-theme-font';

export const applyRuntimeTheme = (theme?: RuntimeThemeConfig) => {
  // Layer sources by precedence: DEFAULT_THEME is the base, any theme already
  // on window.theme (e.g. env.js in local dev, which sets a dev-served logo)
  // overrides it, and the runtime config from /config.json wins over both.
  const existingTheme = (window.theme ?? {}) as RuntimeThemeConfig;
  const mergedTheme = {
    ...DEFAULT_THEME,
    ...existingTheme,
    ...theme,
    font: {
      ...DEFAULT_THEME.font,
      ...existingTheme.font,
      ...theme?.font,
    },
    cssVariables: {
      ...DEFAULT_THEME.cssVariables,
      ...existingTheme.cssVariables,
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
    // The server is the source of truth for banners; on fetch failure any
    // window.banners set by env.js in local dev survives.
    window.banners = config.banners;
    applyRuntimeTheme(config.theme);
  } catch {
    applyRuntimeTheme();
  }
};

export const getRuntimeBanners = (): RuntimeBannersConfig | undefined =>
  window.banners;
