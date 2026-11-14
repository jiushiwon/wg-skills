import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
export default defineConfig({ plugins: [uni()], resolve: { preserveSymlinks: true }, server: { host: '127.0.0.1', port: 5186, strictPort: true } })
