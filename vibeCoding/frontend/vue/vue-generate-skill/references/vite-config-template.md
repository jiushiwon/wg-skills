# Vite 配置模板

> 完整、可直接复制的 `vite.config.ts`，含路径别名、自动导入、Element Plus 按需加载、构建优化。

---

## 1. 完整 `vite.config.ts`

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      vue(),
      // 自动导入 Vue / Vue Router / Pinia API（不解析 Element Plus，由 Components 处理）
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
        },
      }),
      // 按需加载 Element Plus 组件（ElMessage / ElIcon 等）
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: false,
      proxy: env.VITE_PROXY_TARGET
        ? {
            '/api': {
              target: env.VITE_PROXY_TARGET,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
          },
        },
      },
    },
  };
});
```

---

## 2. `index.html`（含环境变量）

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= VITE_APP_TITLE %></title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

---

## 3. `src/main.ts`（入口）

```typescript
// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/global.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
```

---

## 4. `src/router/index.ts`（标准路由配置）

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { setupGuards } from './guards';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理', roles: ['admin'] },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

setupGuards(router);

export default router;
```

---

## 5. `src/router/guards.ts`（鉴权守卫）

```typescript
// src/router/guards.ts
import type { Router } from 'vue-router';
import { useUserStore } from '@/stores/modules/user';
import { useAuth } from '@/composables/useAuth';

export function setupGuards(router: Router): void {
  router.beforeEach((to, _from, next) => {
    const userStore = useUserStore();

    // 公开页面直接放行
    if (to.meta.public) {
      return next();
    }

    // 未登录跳登录页
    if (!userStore.token) {
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }

    // 角色校验
    const requiredRoles = to.meta.roles as string[] | undefined;
    if (requiredRoles && requiredRoles.length > 0) {
      const { hasRole } = useAuth();
      if (!hasRole(requiredRoles)) {
        return next({ path: '/403' });
      }
    }

    next();
  });

  router.afterEach((to) => {
    const title = to.meta.title as string | undefined;
    if (title) {
      document.title = `${title} - ${import.meta.env.VITE_APP_TITLE}`;
    }
  });
}
```

**类型增强**（`src/types/router.d.ts`）：

```typescript
import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean;
    title?: string;
    roles?: string[];
  }
}
```

---

## 6. `src/App.vue`（根组件）

```vue
<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <RouterView />
</template>

<style>
/* 全局样式在 main.ts 引入 */
</style>
```

---

## 7. `.env` 系列

### `.env.development`

```bash
VITE_APP_TITLE=My Vue App
VITE_BASE_URL=
VITE_PROXY_TARGET=http://localhost:3000
VITE_USE_MOCK=true
```

### `.env.production`

```bash
VITE_APP_TITLE=My Vue App
VITE_BASE_URL=https://api.example.com
VITE_USE_MOCK=false
```

### `.env.example`（入版本控制）

```bash
# 应用标题
VITE_APP_TITLE=My Vue App

# API 基础地址（生产环境）
VITE_BASE_URL=

# 开发代理目标（dev server proxy 到后端）
VITE_PROXY_TARGET=http://localhost:3000

# 是否启用 Mock（仅 dev 环境）
VITE_USE_MOCK=true
```

---

## 8. `package.json` 完整模板

```jsonc
{
  "name": "my-vue-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.ts,.tsx --fix",
    "lint:check": "eslint . --ext .vue,.ts,.tsx",
    "type-check": "vue-tsc --noEmit",
    "format": "prettier --write \"src/**/*.{vue,ts,tsx,css,scss,json,md}\""
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "element-plus": "^2.5.0",
    "@element-plus/icons-vue": "^2.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/tsconfig": "^0.5.1",
    "@tsconfig/node22": "^22.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vue/eslint-config-typescript": "^13.0.0",
    "eslint": "^8.55.0",
    "eslint-plugin-vue": "^9.19.0",
    "prettier": "^3.1.0",
    "sass": "^1.69.0",
    "typescript": "^5.3.0",
    "unplugin-auto-import": "^0.17.0",
    "unplugin-vue-components": "^0.26.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.25"
  }
}
```

---

## 9. `.eslintrc.cjs`

```javascript
/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/component-api-style': ['error', ['script-setup']],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  },
};
```

---

## 10. `.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false
}
```

---

## 11. 红线（不可违反）

1. ❌ `noImplicitAny` 不允许为 `false`
2. ❌ `strict: true` 不允许关闭
3. ❌ 路径别名 `@/*` 必须与 `tsconfig.json` 一致
4. ❌ `build` 不允许跳过 `vue-tsc --noEmit`
5. ❌ Element Plus 必须按需引入（不要全量 `import 'element-plus/dist/index.css'`）
6. ❌ 不用 Pinia 时不要引入 `vuex`
7. ❌ 不在 `vite.config.ts` 里硬编码环境变量（用 `loadEnv` 读取）
