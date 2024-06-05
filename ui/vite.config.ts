import react from '@vitejs/plugin-react';
import { exec } from 'child_process';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    eslint(),
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
});
