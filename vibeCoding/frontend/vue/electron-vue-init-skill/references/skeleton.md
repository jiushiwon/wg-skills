# 项目骨架模板（electron-vite 标准）

本文件定义了 Electron + Vue3 + TypeScript 项目的完整目录结构和核心代码模板。
基于 **electron-vite** 构建工具，采用三进程严格分离架构。

## 目录结构

```
{{project-name}}/
├── electron.vite.config.ts       # electron-vite 统一配置
├── electron-builder.json5        # electron-builder 打包配置
├── package.json                  # 依赖 + scripts
├── tsconfig.json                 # 根 TS 配置（引用 node + web）
├── tsconfig.node.json            # 主进程/预加载 TS 配置
├── tsconfig.web.json             # 渲染进程 TS 配置
├── .gitignore
├── README.md
├── src/
│   ├── main/                     # Electron 主进程
│   │   └── index.ts
│   ├── preload/                  # 预加载脚本
│   │   ├── index.ts
│   │   └── electron.d.ts
│   └── renderer/                 # Vue3 渲染进程
│       ├── index.html
│       └── src/
│           ├── main.ts
│           ├── App.vue
│           ├── router/
│           │   └── index.ts
│           ├── stores/
│           │   ├── index.ts
│           │   └── modules/
│           │       └── app.ts
│           ├── views/
│           │   └── HomeView.vue
│           ├── components/
│           ├── api/
│           │   ├── request.ts    # 统一请求封装（复用 frontend-request-skill）
│           │   └── index.ts      # API 导出入口
│           ├── styles/
│           │   ├── tokens.css
│           │   └── global.css
│           ├── utils/
│           ├── types/
│           └── env.d.ts
└── resources/
    └── icon.png
```

---

## 核心文件模板

### 1. package.json

```json
{
  "name": "{{project-name}}",
  "version": "1.0.0",
  "description": "Electron + Vue3 桌面端应用",
  "main": "./out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "postinstall": "electron-builder install-app-deps",
    "build:unpack": "npm run build && electron-builder --dir",
    "build:win": "npm run build && electron-builder --win",
    "build:mac": "npm run build && electron-builder --mac",
    "build:linux": "npm run build && electron-builder --linux"
  },
  "dependencies": {
    "pinia": "^2.2.0",
    "vue": "^3.5.0",
    "vue-router": "^4.4.0"
  },
  "devDependencies": {
    "@electron-toolkit/preload": "^3.0.0",
    "@electron-toolkit/utils": "^3.0.0",
    "@vitejs/plugin-vue": "^5.2.0",
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0",
    "electron-vite": "^3.0.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vue-tsc": "^2.2.0"
  }
}
```

### 2. electron.vite.config.ts

```typescript
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 主进程配置
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  // 预加载脚本配置
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  // 渲染进程配置（Vue3）
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [vue()]
  }
})
```

### 3. electron-builder.json5

```json5
{
  // 应用 ID（打包标识）
  appId: 'com.{{project-name}}.app',
  // 产品名称
  productName: '{{project-name}}',
  // 输出目录
  directories: {
    buildResources: 'build'
  },
  // 文件包含规则
  files: ['out/**/*'],
  // Windows 配置
  win: {
    target: ['nsis'],
    icon: 'resources/icon.png'
  },
  // macOS 配置
  mac: {
    target: ['dmg'],
    icon: 'resources/icon.png'
  },
  // Linux 配置
  linux: {
    target: ['AppImage'],
    icon: 'resources/icon.png'
  },
  // NSIS 安装包配置（Windows）
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false
  }
}
```

### 4. tsconfig.json（根配置）

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.web.json" }
  ]
}
```

### 5. tsconfig.node.json（主进程 + 预加载）

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "outDir": "./out",
    "lib": ["ESNext"],
    "types": ["node"],
    "skipLibCheck": true
  },
  "include": [
    "src/main/**/*",
    "src/preload/**/*",
    "electron.vite.config.ts"
  ]
}
```

### 6. tsconfig.web.json（渲染进程）

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/renderer/src/*"]
    },
    "noEmit": true
  },
  "include": [
    "src/renderer/src/**/*",
    "src/renderer/src/**/*.vue",
    "src/preload/electron.d.ts"
  ]
}
```

### 7. src/main/index.ts（主进程入口）

```typescript
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

/**
 * 创建主窗口
 */
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    // 窗口标题栏配置
    titleBarStyle: 'hiddenInset',
    // 预加载脚本路径
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // 安全设置：禁止在渲染进程中使用 Node.js API
      nodeIntegration: false,
      // 安全设置：上下文隔离
      contextIsolation: true,
      // 禁用远程模块
      enableRemoteModule: false,
      // 允许 DevTools（开发模式）
      devTools: is.dev
    }
  })

  // 窗口准备好后显示（避免白屏闪烁）
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 用系统浏览器打开外部链接
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 加载渲染进程
  // 开发模式：加载开发服务器 URL
  // 生产模式：加载打包后的 index.html
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/**
 * 应用初始化
 */
app.whenReady().then(() => {
  // 设置应用用户模型 ID（Windows 任务栏图标）
  electronApp.setAppUserModelId('com.{{project-name}}.app')

  // 开发模式下默认打开或关闭 DevTools
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC 通信示例：获取应用版本
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // IPC 通信示例：获取系统信息
  ipcMain.handle('get-system-info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome
    }
  })

  createWindow()

  // macOS：点击 dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

> **注意**：需要额外安装 `@electron-toolkit/utils`：`npm install -D @electron-toolkit/utils`

### 8. src/preload/index.ts（预加载脚本）

```typescript
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

/**
 * 通过 contextBridge 安全地暴露 API 给渲染进程
 * 渲染进程通过 window.electronAPI 访问
 */
const api = {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  // 获取系统信息
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
}

// 使用 contextBridge 暴露 API
if (process.contextIsolated) {
  try {
    // 暴露 Electron 原生 API
    contextBridge.exposeInMainWorld('electron', electronAPI)
    // 暴露自定义 API
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('预加载脚本暴露 API 失败:', error)
  }
} else {
  // 非隔离模式（不推荐，仅用于开发调试）
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
```

> **注意**：需要额外安装 `@electron-toolkit/preload`：`npm install -D @electron-toolkit/preload`

### 9. src/preload/electron.d.ts（类型声明）

```typescript
// Electron API 类型声明
// 渲染进程通过 window.electron / window.api 访问

/**
 * @electron-toolkit/preload 暴露的原生 API
 * 包含 platform、versions 等系统信息
 */
interface ElectronAPI {
  /** 当前平台信息 */
  process: {
    pid: number
    arch: string
    platform: string
  }
  /** 各组件版本号 */
  versions: {
    node: string
    chrome: string
    electron: string
  }
}

/**
 * 自定义 API（通过 contextBridge 暴露）
 * 与 src/preload/index.ts 中的 api 对象严格对应
 */
interface CustomAPI {
  /** 获取应用版本 */
  getAppVersion: () => Promise<string>
  /** 获取系统信息 */
  getSystemInfo: () => Promise<{
    platform: string
    arch: string
    electronVersion: string
    nodeVersion: string
    chromeVersion: string
  }>
}

declare interface Window {
  /** Electron 原生 API（由 @electron-toolkit/preload 提供） */
  electron: ElectronAPI
  /** 自定义 API（通过 contextBridge 暴露） */
  api: CustomAPI
}
```

### 10. src/renderer/index.html（HTML 入口）

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--
      CSP 内容安全策略
      注意：开发模式下 electron-vite 会自动注入宽松的 CSP，以下配置仅在生产模式生效
    -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws:"
    />
    <title>{{project-name}}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### 11. src/renderer/src/main.ts（Vue 入口）

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
import './styles/global.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

### 12. src/renderer/src/App.vue（根组件）

```vue
<script setup lang="ts">
// 根组件：提供路由出口
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
}
</style>
```

### 13. src/renderer/src/router/index.ts（路由）

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // Electron 中使用 Hash 模式（避免 file:// 协议问题）
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    }
  ]
})

export default router
```

### 14. src/renderer/src/stores/index.ts（Pinia 入口）

```typescript
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
```

### 15. src/renderer/src/stores/modules/app.ts（App Store）

```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * 应用全局状态
 */
export const useAppStore = defineStore('app', () => {
  // 状态
  const appVersion = ref('')
  const systemInfo = ref<{
    platform: string
    arch: string
    electronVersion: string
    nodeVersion: string
    chromeVersion: string
  } | null>(null)

  // 计算属性
  const isElectron = computed(() => !!window.electron)

  // 方法
  async function fetchAppVersion(): Promise<void> {
    try {
      appVersion.value = await window.api.getAppVersion()
    } catch (err) {
      console.warn('获取应用版本失败:', err)
    }
  }

  async function fetchSystemInfo(): Promise<void> {
    try {
      systemInfo.value = await window.api.getSystemInfo()
    } catch (err) {
      console.warn('获取系统信息失败:', err)
    }
  }

  function $reset(): void {
    appVersion.value = ''
    systemInfo.value = null
  }

  return {
    appVersion,
    systemInfo,
    isElectron,
    fetchAppVersion,
    fetchSystemInfo,
    $reset
  }
})
```

### 16. src/renderer/src/views/HomeView.vue（默认页面）

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

onMounted(() => {
  appStore.fetchAppVersion()
  appStore.fetchSystemInfo()
})
</script>

<template>
  <div class="home">
    <div class="welcome">
      <h1 class="title">你好，我是考拉搞AI</h1>
      <p class="subtitle">Electron + Vue3 桌面端应用</p>
      <div v-if="appStore.systemInfo" class="info">
        <p>Electron: {{ appStore.systemInfo.electronVersion }}</p>
        <p>Chrome: {{ appStore.systemInfo.chromeVersion }}</p>
        <p>Node.js: {{ appStore.systemInfo.nodeVersion }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f5f5f5);
}

.welcome {
  text-align: center;
  padding: var(--space-8, 32px);
}

.title {
  font-size: var(--font-3xl, 28px);
  color: var(--color-text, #333);
  margin-bottom: var(--space-4, 16px);
  font-weight: 600;
}

.subtitle {
  font-size: var(--font-lg, 16px);
  color: var(--color-text-secondary, #666);
  margin-bottom: var(--space-8, 32px);
}

.info {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-tertiary, #999);
  line-height: 1.8;
}
</style>
```

### 17. src/renderer/src/styles/tokens.css（设计 Token）

> 复用 `vue-theme-skill` 的 Token 体系，以下是精简版：

```css
:root {
  /* 主题色 */
  --color-primary: hsl(211, 100%, 56%);
  --color-primary-light: hsl(211, 100%, 76%);
  --color-primary-dark: hsl(211, 100%, 48%);

  /* 语义色 */
  --color-success: hsl(152, 69%, 45%);
  --color-warning: hsl(33, 100%, 56%);
  --color-danger: hsl(0, 84%, 60%);
  --color-info: hsl(211, 100%, 56%);

  /* 中性色 */
  --color-bg: hsl(0, 0%, 98%);
  --color-surface: hsl(0, 0%, 100%);
  --color-border: hsl(220, 14%, 96%);
  --color-text: hsl(220, 13%, 18%);
  --color-text-secondary: hsl(220, 9%, 46%);
  --color-text-tertiary: hsl(220, 9%, 65%);
  --color-text-inverse: hsl(0, 0%, 100%);

  /* 间距 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* 字体 */
  --font-sm: 13px;
  --font-base: 14px;
  --font-lg: 16px;
  --font-xl: 18px;
  --font-2xl: 22px;
  --font-3xl: 28px;

  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 999px;
}
```

### 18. src/renderer/src/styles/global.css（全局样式）

```css
/* 全局样式重置 */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  font-size: var(--font-base, 14px);
  color: var(--color-text, #333);
  background: var(--color-bg, #f5f5f5);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  color: var(--color-primary-dark);
}

/* 滚动条样式（桌面端） */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}
```

### 19. src/renderer/env.d.ts（Vite 类型声明）

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

### 20. .gitignore

```gitignore
node_modules/
out/
dist/
build/
*.local
.DS_Store
Thumbs.db
.env
.env.local
.env.*.local
```

### 21. src/renderer/src/api/request.ts（统一请求封装）

> 复用 `frontend-request-skill` 的请求层规范，基于 fetch 实现。

```typescript
/**
 * 统一请求封装
 * 遵循 frontend-request-skill 规范：fetch + 响应信封 + 错误处理
 */

// 响应信封
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 请求错误
export interface RequestError {
  code: string
  message: string
  status?: number
}

// 请求配置
export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: unknown
  header?: Record<string, string>
  timeout?: number
  needAuth?: boolean
  prefix?: string
}

// 默认配置
const BASE_URL = ''
const PREFIX = '/api'
const TIMEOUT = 15000

/**
 * 获取 Token（桌面端使用 localStorage）
 */
function getToken(): string | null {
  return localStorage.getItem('token')
}

/**
 * 格式化错误
 */
function formatError(code: string, message: string, status?: number): RequestError {
  return { code, message, status }
}

/**
 * 统一请求方法
 */
export async function request<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    timeout = TIMEOUT,
    needAuth = true,
    prefix = PREFIX
  } = options

  // 构建完整 URL
  const fullUrl = `${BASE_URL}${prefix}${url}`

  // 构建请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header
  }

  // 注入 Token
  if (needAuth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  // 构建请求体
  const body = method !== 'GET' && data ? JSON.stringify(data) : undefined

  // 超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    // HTTP 状态异常
    if (!response.ok) {
      if (response.status === 401) {
        throw formatError('UNAUTHORIZED', '登录已过期，请重新登录', 401)
      }
      if (response.status === 403) {
        throw formatError('FORBIDDEN', '权限不足', 403)
      }
      throw formatError('HTTP_ERROR', `请求失败：${response.status}`, response.status)
    }

    // 解析响应
    const result: ApiResponse<T> = await response.json()

    // 业务状态码判断
    if (result.code !== 0) {
      throw formatError(String(result.code), result.message)
    }

    return result
  } catch (err: unknown) {
    clearTimeout(timeoutId)

    // 已格式化的错误直接抛出
    if (err && typeof err === 'object' && 'code' in err) {
      throw err
    }

    // 网络超时
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw formatError('TIMEOUT', '请求超时，请检查网络')
    }

    // 网络异常
    throw formatError('NETWORK_ERROR', '网络异常，请稍后重试')
  }
}

/**
 * GET 请求
 */
export function get<T = unknown>(
  url: string,
  data?: unknown,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): Promise<ApiResponse<T>> {
  return request<T>({ url, method: 'GET', data, ...options })
}

/**
 * POST 请求
 */
export function post<T = unknown>(
  url: string,
  data?: unknown,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): Promise<ApiResponse<T>> {
  return request<T>({ url, method: 'POST', data, ...options })
}

/**
 * PUT 请求
 */
export function put<T = unknown>(
  url: string,
  data?: unknown,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): Promise<ApiResponse<T>> {
  return request<T>({ url, method: 'PUT', data, ...options })
}

/**
 * DELETE 请求
 */
export function del<T = unknown>(
  url: string,
  data?: unknown,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): Promise<ApiResponse<T>> {
  return request<T>({ url, method: 'DELETE', data, ...options })
}
```

### 22. src/renderer/src/api/index.ts（API 导出入口）

```typescript
/**
 * API 导出入口
 * 按模块组织，便于维护
 */
export { request, get, post, put, del } from './request'
export type { ApiResponse, RequestError, RequestOptions } from './request'
```
