# vite.config.ts 配置模板

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

## 常用配置项

| 配置 | 说明 |
|------|------|
| `plugins` | React 插件 |
| `resolve.alias` | 路径别名 `@/` |
| `server.port` | 开发服务器端口 |
| `server.proxy` | API 代理 |
| `build.outDir` | 输出目录 |
| `build.sourcemap` | 是否生成 sourcemap |

## 代理配置示例

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```
