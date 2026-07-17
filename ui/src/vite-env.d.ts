/// <reference types="vite/client" />
import type { JhData } from '@src/types/jupyterhub';
import type { RuntimeThemeConfig } from '@src/utils/theme';

declare global {
  interface Window {
    jhdata: JhData;
    theme?: RuntimeThemeConfig;
  }
}
