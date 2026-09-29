# 技术栈：Svelte / SvelteKit

极简语法的高性能前端框架。适合追求代码简洁 + 极致性能。

---

## 项目结构（SvelteKit）

```
project/
├── src/
│   ├── routes/                 # 路由（文件路由）
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   ├── about/
│   │   │   └── +page.svelte
│   │   └── dashboard/
│   │       ├── +layout.svelte
│   │       └── +page.svelte
│   ├── lib/
│   │   ├── components/         # 组件
│   │   │   ├── ui/
│   │   │   └── features/
│   │   ├── stores/             # 状态
│   │   ├── utils/
│   │   └── server/             # 服务端
│   ├── app.html
│   ├── app.css                 # 全局样式
│   └── app.d.ts
├── static/
├── svelte.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## 初始化

```bash
npx sv create my-app
# 或
npm create svelte@latest my-app
```

选：`Skeleton project` + `TypeScript` + `Tailwind CSS`

```bash
cd my-app
npm install -D @tailwindcss/typography @tailwindcss/forms
npm install lucide-svelte
```

## Tailwind 配置

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: { extend: { /* 完整 token */ } },
} satisfies Config;
```

## 根布局

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover">
</svelte:head>

<slot />
```

## 基础组件

```svelte
<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type Size = 'sm' | 'md' | 'lg';

  interface $$Props extends HTMLButtonAttributes {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
  }

  export let variant: Variant = 'primary';
  export let size: Size = 'md';
  export let loading = false;
</script>

<button
  {...$$restProps}
  class={cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'disabled:pointer-events-none disabled:opacity-50',
    {
      primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
      secondary: 'bg-surface-tinted text-on-surface hover:bg-border',
      ghost: 'hover:bg-surface-tinted',
      danger: 'bg-error text-error-foreground hover:opacity-90',
    }[variant],
    {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    }[size],
  )}
  disabled={loading || $$restProps.disabled}
>
  {#if loading}
    <span class="spinner" />
  {/if}
  <slot />
</button>
```

## 页面

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
</script>

<main class="container py-24">
  <h1 class="text-5xl md:text-6xl font-bold tracking-tight">
    让设计 <em class="italic">重新</em> 有趣
  </h1>
  <p class="mt-6 text-xl text-on-surface-muted max-w-2xl">
    把 6 周的工作量压缩到 6 分钟。
  </p>
  <div class="mt-8 flex gap-4">
    <Button size="lg">立即开始</Button>
    <Button size="lg" variant="ghost">观看演示</Button>
  </div>
</main>
```

## 数据加载（+page.ts / +page.server.ts）

```ts
// src/routes/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/api/data');
  const data = await res.json();
  return { data };
};
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
</script>

<div>{data.data.value}</div>
```

## Store（状态）

```ts
// src/lib/stores/user.ts
import { writable, derived } from 'svelte/store';

export const user = writable<User | null>(null);

export const isLoggedIn = derived(user, ($user) => !!$user);

export function logout() {
  user.set(null);
}
```

```svelte
<script lang="ts">
  import { user, isLoggedIn } from '$lib/stores/user';
</script>

{#if $isLoggedIn}
  <p>欢迎，{$user?.name}</p>
{:else}
  <Button>登录</Button>
{/if}
```

## 动画（svelte/transition）

```svelte
<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  let visible = true;
</script>

{#if visible}
  <div in:fly={{ y: 20, duration: 300 }} out:fade>
    内容
  </div>
{/if}
```

## 关键约定

- **`<script lang="ts">`** 默认
- **响应式声明**：`let count = 0;` 自动响应
- **store** 全局状态
- **生命周期**：`onMount` / `onDestroy`
- **事件**：`on:click` / `createEventDispatcher`

## 适用场景

- ✅ 极简 Web
- ✅ 营销页 / 博客
- ✅ 仪表盘
- ✅ 追求性能 + 代码简洁
- ❌ 不适合超大型企业 App（生态略小）

## 优化建议

- **SvelteKit SSR** 默认
- **图片**：`<enhanced:img>` 自动优化
- **字体**：`@fontsource` 子集化
- **代码分割**：SvelteKit 自动
- **预取**：`<a data-sveltekit-preload-data>`

## 验证清单

- [ ] TypeScript 默认
- [ ] 路由文件结构清晰
- [ ] 数据用 +page.ts / +page.server.ts 加载
- [ ] 触摸目标 ≥44pt
- [ ] 减弱动效模式
- [ ] 暗色模式支持
- [ ] 没有 AI slop
