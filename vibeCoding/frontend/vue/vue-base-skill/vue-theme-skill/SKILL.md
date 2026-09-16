---
name: vue-theme-skill
description: Vue 主题系统技能。提供 CSS 变量设计 Token 规范，支持 light/dark 双主题切换。所有 Vue 组件技能统一引用本技能的变量。当用户说"主题切换"、"深色模式"、"CSS 变量"、"设计 token"时触发。
---

# vue-theme-skill

> 所有 Vue 组件技能的样式必须引用本技能定义的 CSS 变量，禁止硬编码颜色/间距/字号。

## 设计 Token 规范

```css
:root {
  /* 色彩 */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-primary-light: #60a5fa;
  --color-primary-subtle: rgba(59,130,246,0.08);

  --color-bg: #ffffff;
  --color-bg-muted: #f3f4f6;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #e11d48;
  --color-info: #3b82f6;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 999px;

  /* 字号 */
  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-md: 15px;
  --font-size-lg: 18px;
  --font-size-xl: 22px;

  /* 字重 */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}

/* 深色主题 */
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-primary-dark: #3b82f6;
  --color-primary-light: #93c5fd;

  --color-bg: #111827;
  --color-bg-muted: #1f2937;
  --color-text: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-border: #374151;
  --color-border-strong: #4b5563;
}
```

## 主题切换实现

```ts
// composables/useTheme.ts
export function useTheme() {
  const theme = ref<'light' | 'dark'>(
    localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')
  )

  watch(theme, (val) => {
    document.documentElement.setAttribute('data-theme', val)
    localStorage.setItem('theme', val)
  }, { immediate: true })

  return { theme, toggle: () => theme.value = theme.value === 'dark' ? 'light' : 'dark' }
}
```

## 使用规范

1. 所有组件样式必须使用 `var(--color-*)` 而非硬编码色值
2. 深色主题只需覆盖 `:root` 变量，组件代码零改动
3. 新增 Token 时同步更新 light 和 dark 两套值
4. 语义化命名：`--color-primary` 而非 `--color-blue`
