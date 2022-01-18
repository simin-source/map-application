import path, { resolve } from 'path';
import { defineConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

const devOrTest = process.argv.some(i => ['test', 'test'].includes(i));

/**
 * https://vitejs.dev/config/
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vueJsx(),
  ],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: 'import { h } from "vue"',
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/assets/style/comm.scss";',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8888,
  },
  build: {
    terserOptions: {
      compress: {
        pure_funcs: devOrTest ? null : ['console.log', 'console.warn'],
      },
    },
    outDir: resolve(__dirname, 'dist/'),
  },
});
