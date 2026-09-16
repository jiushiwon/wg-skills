import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import path from 'path';

export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${path.resolve(__dirname, 'src/styles/variables.scss')}" as *;`
      }
    }
  },
  define: {
    __THEME_PRIMARY__: JSON.stringify('#14b8a6'),
    __THEME_SECONDARY__: JSON.stringify('#6366f1'),
    __THEME_TERTIARY__: JSON.stringify('#f59e0b')
  }
});