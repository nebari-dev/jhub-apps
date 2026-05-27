import { exec } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    EnvironmentPlugin('all'),
    {
      name: 'run-build-script',
      apply: 'build',
      writeBundle() {
        exec('./build-and-copy.sh', (error) => {
          if (error) {
            console.error(`Build error: ${error}`);
            return;
          }
          console.log(`Build and copy complete.`);
        });
      },
    },
  ],
  server: {
    port: 8080,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    minWorkers: 1,
    maxWorkers: 1,
    coverage: {
      all: false,
      provider: 'v8',
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
