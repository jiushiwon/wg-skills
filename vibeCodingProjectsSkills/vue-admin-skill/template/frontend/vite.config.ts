import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    dedupe: ['vue']
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    // 软链接包预构建（12 个 vue-*-skill + 4 个核心）
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'vue-card-skill',
      'vue-button-skill',
      'vue-tag-skill',
      'vue-dropdown-skill',
      'vue-input-skill',
      'vue-select-skill',
      'vue-checkbox-skill',
      'vue-switch-skill',
      'vue-table-skill',
      'vue-form-skill',
      'vue-tree-skill',
      'vue-dialog-skill',
      'vue-layout-skill',
      'vue-login-skill'
    ]
  }
})
