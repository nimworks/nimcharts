import { defineConfig, type ConfigEnv } from 'vite';
import { resolve } from 'node:path';
// import dts from 'vite-plugin-dts';   //depreciated in favor of unplugin-dts
import dts from 'unplugin-dts/vite';

export default defineConfig(({ mode }: ConfigEnv) => {
  // Checks if the active running mode is explicitly set to development
  const isDev = mode === 'development';

  return {
    // Uses the playground folder for local development testing, or the root directory for bundling files
    root: isDev ? resolve(__dirname, 'playground') : __dirname,

    /* TELL VITE HOW TO RESOLVE EMITTED ALIAS PATH SEPARATORS */
    resolve: {
      alias: {
        '@core': resolve(__dirname, 'src/core'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@components': resolve(__dirname, 'src/components'),
        '@engines': resolve(__dirname, 'src/engines'),
        '@_types': resolve(__dirname, 'src/types')
      }
    },
    build: {
      sourcemap: true,
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,

      // If we are in dev mode -> false (Disable minification so we can debug easily)
      // If we are in production build mode -> 'oxc' (Enable Rust-powered minification)
      minify: isDev ? false : 'oxc',

      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'TYCSCharts',
        formats: ['es', 'umd'],
        fileName: (format) => `tycs-charts.${format === 'es' ? 'js' : 'umd.js'}`
      }
    },
    plugins: [
      //   dts({
      //     insertTypesEntry: true,
      //     include: ['src/**/*.ts'],
      //     outDir: resolve(__dirname, 'dist')
      //   })
      dts({
        // Generates bundled definition types cleanly back to root level dist
        outDirs: [{ dir: resolve(__dirname, 'dist'), moduleFormat: 'esm' }],
        bundleTypes: true,
        // ENFORCE UNPLUG-DTS TO IGNORE UNDERSCORE FILES
        exclude: ['src/**/_*']
      })
    ]
  };
});
