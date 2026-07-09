/// <reference types="vite/client" />
import type { JhData } from './types/jupyterhub';

declare global {
  interface Window {
    jhdata: JhData;
    theme?: {
      logo?: string;
    };
  }
}
