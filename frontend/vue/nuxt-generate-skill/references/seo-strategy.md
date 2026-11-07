# SEO 策略

## 核心工具

Nuxt 3 内置 `useHead` 和 `useSeoMeta` 组合函数，配合 SEO 模块实现完整的搜索引擎优化。

## 1. useHead — 设置 title/meta

```typescript
// 页面级别
useHead({
  title: '用户管理 - Nuxt Admin',
  meta: [
    { name: 'description', content: '管理系统用户，支持增删改查' },
    { name: 'keywords', content: '用户管理,后台管理,Nuxt' },
  ],
  link: [
    { rel: 'canonical', href: 'https://example.com/users' },
  ],
})

// 动态 title
useHead({
  title: () => user.value ? `${user.value.nickname} - 用户详情` : '加载中...',
})
```

### nuxt.config.ts 全局 head 配置

```typescript
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      titleTemplate: '%s - Nuxt Admin', // %s 会被页面 title 替换
      title: '首页',
      meta: [
        { name: 'description', content: '默认描述' },
      ],
    },
  },
})
```

## 2. useSeoMeta — OG 标签

```typescript
useSeoMeta({
  title: '用户管理',
  ogTitle: '用户管理 - Nuxt Admin',
  description: '管理系统用户',
  ogDescription: '管理系统用户，支持增删改查',
  ogImage: 'https://example.com/og-users.png',
  ogUrl: 'https://example.com/users',
  ogType: 'website',
  ogSiteName: 'Nuxt Admin',
  twitterCard: 'summary_large_image',
  twitterTitle: '用户管理 - Nuxt Admin',
  twitterDescription: '管理系统用户',
  twitterImage: 'https://example.com/og-users.png',
})
```

## 3. Sitemap 模块

### 安装

```bash
pnpm add -D @nuxtjs/sitemap
```

### 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  sitemap: {
    hostname: 'https://example.com',
    gzip: true,
    // 动态路由
    urls: async () => {
      // 从 API 获取动态路由
      // const users = await $fetch('https://api.example.com/users')
      // return users.map(u => `/users/${u.id}`)
      return []
    },
  },
})
```

## 4. Robots 模块

### 安装

```bash
pnpm add -D @nuxtjs/robots
```

### 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/robots'],
  robots: {
    allow: '/',
    disallow: ['/admin', '/api', '/login'],
    sitemap: 'https://example.com/sitemap.xml',
  },
})
```

## 5. 结构化数据（JSON-LD）

```vue
<script setup lang="ts">
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Nuxt Admin',
        url: 'https://example.com',
        description: '基于 Nuxt 3 的管理后台',
      }),
    },
  ],
})
</script>
```

### 文章页 JSON-LD 示例

```typescript
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.value.title,
        datePublished: article.value.createdAt,
        author: {
          '@type': 'Person',
          name: article.value.author,
        },
        image: article.value.cover,
      }),
    },
  ],
})
```

## 6. SEO 最佳实践清单

| 项目 | 要求 | 工具 |
|------|------|------|
| title | 每页唯一，含关键词 | `useHead` |
| meta description | 每页唯一，150 字以内 | `useSeoMeta` |
| OG 标签 | 每页设置 og:title/og:image/og:description | `useSeoMeta` |
| canonical URL | 防止重复内容 | `useHead` link |
| sitemap | 自动生成，包含所有公开页面 | `@nuxtjs/sitemap` |
| robots.txt | 禁止爬取管理页面和 API | `@nuxtjs/robots` |
| 结构化数据 | 面包屑、文章、产品等 JSON-LD | `useHead` script |
| 图片 alt | 所有图片必须有 alt 属性 | 组件规范 |
| SSR | 关键页面必须 SSR 渲染 | `ssr: true` |
