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
  build: {
    // jhub_apps loads the built bundle via a classic <script src> tag (see
    // jhub_apps/templates/japps_page.html), not <script type="module">.
    // Vite 8's default ESM output emits `import.meta`, which is a SyntaxError
    // in a classic script and blanks the whole app. Emit a single self-executing
    // IIFE bundle instead so it runs correctly as a classic script.
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        // Keep the single stylesheet named index-*.css (cssCodeSplit: false
        // otherwise names it style-*.css) so build-and-copy.sh finds it.
        assetFileNames: (assetInfo) =>
          assetInfo.names?.some((name) => name.endsWith('.css'))
            ? 'assets/index-[hash][extname]'
            : 'assets/[name]-[hash][extname]',
      },
    },
    // A single IIFE chunk otherwise inlines CSS into the JS; keep it extracted
    // to a standalone stylesheet, which build-and-copy.sh and the jhub_apps
    // template (a separate <link> to index.css) both expect.
    cssCodeSplit: false,
    // The app ships as a single classic-script bundle by design, so the
    // per-chunk size warning isn't actionable here.
    chunkSizeWarningLimit: 2000,
  },
  // Everything is inlined into one IIFE, so Vite's module-preload helper is
  // dead code — but it still references `import.meta`, which is invalid under
  // the iife format and emits EMPTY_IMPORT_META warnings. The app itself never
  // uses `import.meta` (only process.env via vite-plugin-environment), so it's
  // safe to statically replace it, matching rolldown's own suggested fix.
  define: {
    'import.meta': '{}',
  },
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
