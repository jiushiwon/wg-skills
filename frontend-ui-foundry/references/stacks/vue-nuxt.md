# 技术栈：Vue + Nuxt

Vue 生态的全栈框架。默认 SSR / SSG。

---

## 项目结构（Nuxt 3）

```
project/
├── app/
│   ├── app.vue                 # 根组件
│   ├── pages/                  # 路由
│   │   ├── index.vue
│   │   ├── about.vue
│   │   └── dashboard/
│   │       ├── index.vue
│   │       └── settings.vue
│   ├── layouts/                # 布局
│   │   ├── default.vue
│   │   └── dashboard.vue
│   ├── components/             # 组件
│   │   ├── ui/
│   │   └── features/
│   ├── composables/            # 组合式函数
│   ├── stores/                 # Pinia 状态
│   ├── plugins/
│   └── assets/
│       └── css/
│           └── tokens.css
├── public/
├── server/                     # 服务端 API
├── nuxt.config.ts
├── tailwind.config.ts
└── package.json
```

## 初始化

```bash
npx nuxi@latest init my-app
cd my-app
npx nuxi@latest module add @nuxtjs/tailwindcss
npm install @nuxtjs/color-mode @pinia/nuxt @vueuse/nuxt
```

## nuxt.config.ts

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'theme',
  },
  css: ['~/assets/css/tokens.css', '~/assets/css/main.css'],
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover',
      htmlAttrs: { lang: 'zh-CN' },
    },
  },
  ssr: true,
});
```

## Tailwind 配置

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{vue,js,ts}',
  ],
  darkMode: 'class',
  theme: { extend: { /* 完整 token */ } },
} satisfies Config;
```

## 根布局

```vue
<!-- app/app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="min-h-dvh bg-surface text-on-surface antialiased">
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
```

## 基础组件

```vue
<!-- app/components/ui/Button.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '~/lib/utils';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
});

const classes = computed(() => cn(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    secondary: 'bg-surface-tinted text-on-surface hover:bg-border',
    ghost: 'hover:bg-surface-tinted',
    danger: 'bg-error text-error-foreground hover:opacity-90',
  }[props.variant],
  {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }[props.size],
));
</script>

<template>
  <button :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
```

## 页面（组合式 API）

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
useHead({
  title: '首页',
  meta: [{ name: 'description', content: '...' }],
});

const { data, pending, error } = await useFetch('/api/data', {
  key: 'home-data',
  default: () => ({ value: 0 }),
});
</script>

<template>
  <div class="container py-24">
    <h1 class="text-5xl md:text-6xl font-bold tracking-tight">
      让设计 <em class="italic">重新</em> 有趣
    </h1>
    <p class="mt-6 text-xl text-on-surface-muted max-w-2xl">
      把 6 周的工作量压缩到 6 分钟。
    </p>
    <div class="mt-8 flex gap-4">
      <UiButton size="lg">立即开始</UiButton>
      <UiButton size="lg" variant="ghost">观看演示</UiButton>
    </div>
  </div>
</template>
```

## 状态管理（Pinia）

```ts
// app/stores/user.ts
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
    loading: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.profile,
  },
  actions: {
    async fetchProfile() {
      this.loading = true;
      try {
        this.profile = await $fetch('/api/user/me');
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.profile = null;
    },
  },
});
```

## Composables

```ts
// app/composables/useTheme.ts
export function useTheme() {
  const colorMode = useColorMode();
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    colorMode.preference = theme;
  };
  return { theme: colorMode, setTheme };
}
```

## API 路由

```ts
// server/api/data.get.ts
export default defineEventHandler(async (event) => {
  const data = await fetchExternalData();
  return { value: data.value };
});
```

## 关键约定

- **Composition API** 默认
- **`<script setup>`** 默认
- **自动导入**（组件、composables、utils）
- **不直接 import Vue API**（ref、computed 自动可用）

## 适用场景

- ✅ 中文 SaaS
- ✅ 内容站
- ✅ 中后台
- ✅ 移动 H5

## 优化建议

- **图片**：`<NuxtImg>` 自动优化
- **字体**：`@nuxtjs/google-fonts` 或本地 woff2
- **数据获取**：`useFetch` / `useAsyncData`（自动 SSR 兼容）
- **路由懒加载**：自动（Nuxt 默认）
- **预取**：`<NuxtLink>` 默认 prefetch

## 验证清单

- [ ] Composition API + `<script setup>`
- [ ] useFetch/useAsyncData 用于数据
- [ ] NuxtImg 用于图片
- [ ] 暗色模式 @nuxtjs/color-mode
- [ ] 减弱动效模式
- [ ] 触摸目标 ≥44pt
- [ ] 路由预取启用
- [ ] 没有 AI slop
