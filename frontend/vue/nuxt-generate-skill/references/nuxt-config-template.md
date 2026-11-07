# nuxt.config.ts 配置模板

## 完整配置

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // --------------- 开发工具 ---------------
  devtools: { enabled: true },

  // --------------- 模块 ---------------
  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt',    // 或 '@nuxt/ui'
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  // --------------- SSR 配置 ---------------
  ssr: true,

  // --------------- 运行时配置 ---------------
  // 替代 process.env，支持 SSR 和客户端访问
  runtimeConfig: {
    // 仅服务端可访问（server/ 目录下）
    apiBase: 'https://api.example.com',
    apiSecret: '',

    // 客户端也可访问（public 命名空间）
    public: {
      appName: 'Nuxt Admin',
      apiBase: '/api',
    },
  },

  // --------------- 应用配置 ---------------
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Nuxt Admin',
      meta: [
        { name: 'description', content: '基于 Nuxt 3 的管理后台' },
        { property: 'og:title', content: 'Nuxt Admin' },
        { property: 'og:description', content: '基于 Nuxt 3 的管理后台' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // --------------- 全局 CSS ---------------
  css: [
    '~/assets/styles/global.css',
  ],

  // --------------- TypeScript 配置 ---------------
  typescript: {
    strict: true,
    shim: false,
  },

  // --------------- Vite 配置扩展 ---------------
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/variables" as *;',
        },
      },
    },
  },

  // --------------- Element Plus 配置（按需） ---------------
  elementPlus: {
    importStyle: 'css',
    themes: ['dark'],
  },

  // --------------- Sitemap 配置 ---------------
  sitemap: {
    hostname: 'https://example.com',
    gzip: true,
    routes: [
      // 动态路由可通过回调补充
    ],
  },

  // --------------- Robots 配置 ---------------
  robots: {
    allow: '/',
    disallow: ['/admin', '/api'],
  },

  // --------------- 构建配置 ---------------
  build: {
    transpile: ['element-plus'],
  },

  // --------------- Nitro 配置（服务端引擎） ---------------
  nitro: {
    // 服务端 API 代理（开发环境转发到后端）
    devProxy: {
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

## 配置要点

### runtimeConfig

| 命名空间 | 访问范围 | 使用场景 |
|---------|---------|---------|
| `runtimeConfig.xxx` | 仅服务端 | 数据库连接、API 密钥 |
| `runtimeConfig.public.xxx` | 服务端 + 客户端 | 应用名、公开 API 地址 |

```typescript
// 服务端使用（server/api/ 下）
const config = useRuntimeConfig()
const data = await $fetch(`${config.apiBase}/users`)

// 客户端使用（pages/components 下）
const config = useRuntimeConfig()
console.log(config.public.appName)
```

### modules 说明

| 模块 | 作用 | 替代方案 |
|------|------|---------|
| `@pinia/nuxt` | 状态管理 | Vuex（不推荐） |
| `@element-plus/nuxt` | Element Plus 自动导入 | `@nuxt/ui`（更轻量） |
| `@nuxtjs/sitemap` | 自动生成 sitemap | 手写 |
| `@nuxtjs/robots` | robots.txt 配置 | public/robots.txt 静态文件 |
