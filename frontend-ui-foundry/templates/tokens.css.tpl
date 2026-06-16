/* ==========================================================================
   Frontend UI Foundry - 完整设计 Token
   复制此文件到项目根目录，命名为 tokens.css，按需调整主色相和承诺度
   ========================================================================== */

:root {
  /* ---------- 间距（4pt 网格） ---------- */
  --space-0: 0;
  --space-1: 0.25rem;     /* 4px */
  --space-2: 0.5rem;      /* 8px */
  --space-3: 0.75rem;     /* 12px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-8: 2rem;        /* 32px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-32: 8rem;       /* 128px */
  --space-40: 10rem;
  --space-48: 12rem;
  --space-64: 16rem;

  /* ---------- 字体 ---------- */
  --font-family-sans: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Geist', system-ui, sans-serif;
  --font-family-serif: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-3xl: 2.5rem;
  --font-size-4xl: 3.5rem;
  --font-size-5xl: 4.5rem;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.1;
  --line-height-snug: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
  --line-height-loose: 1.8;

  /* ---------- 圆角 ---------- */
  --radius-none: 0;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-3xl: 32px;
  --radius-full: 9999px;

  /* ---------- 阴影 ---------- */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.20);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

  /* ---------- 动效 ---------- */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-quick: 150ms;
  --duration-base: 200ms;
  --duration-medium: 300ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;

  --ease-out-quart: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in-quart: cubic-bezier(0.5, 0, 0.75, 0);
  --ease-in-cubic: cubic-bezier(0.32, 0, 0.67, 0);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* ---------- 断点（仅 CSS 变量，@media 不能用 var） ---------- */
  /* 使用时直接写: @media (min-width: 768px) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* ---------- 容器 ---------- */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
  --container-prose: 65ch;

  /* ---------- Z-index ---------- */
  --z-hide: -1;
  --z-base: 0;
  --z-raised: 1;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-notification: 80;
  --z-max: 9999;

  /* ---------- 触摸目标 ---------- */
  --touch-target-min: 44px;
  --touch-target-android: 48px;
}

/* ==========================================================================
   调色板：赤琥金（默认 - 浅色主题）
   替换以下变量即可切换其他调色板
   ========================================================================== */
:root,
[data-theme="light"] {
  --color-primary: oklch(0.55 0.16 28);
  --color-primary-hover: oklch(0.48 0.18 28);
  --color-primary-foreground: oklch(0.99 0.005 75);

  --color-secondary: oklch(0.74 0.10 75);
  --color-secondary-hover: oklch(0.68 0.12 75);

  --color-accent: oklch(0.62 0.12 60);
  --color-accent-foreground: oklch(0.99 0.005 75);

  --color-surface: oklch(0.97 0.01 75);
  --color-surface-tinted: oklch(0.94 0.03 75);
  --color-surface-elevated: oklch(0.99 0.005 75);

  --color-on-surface: oklch(0.18 0.01 30);
  --color-on-surface-muted: oklch(0.45 0.01 30);
  --color-on-primary: oklch(0.99 0.005 75);

  --color-border: oklch(0.85 0.02 60);
  --color-border-strong: oklch(0.65 0.04 50);

  --color-error: oklch(0.55 0.20 25);
  --color-error-foreground: oklch(0.99 0.005 25);
  --color-success: oklch(0.60 0.15 145);
  --color-success-foreground: oklch(0.99 0.005 145);
  --color-warning: oklch(0.75 0.15 80);
  --color-warning-foreground: oklch(0.20 0.01 80);
  --color-info: oklch(0.60 0.15 220);
  --color-info-foreground: oklch(0.99 0.005 220);
}

/* ==========================================================================
   暗色主题
   ========================================================================== */
[data-theme="dark"] {
  --color-primary: oklch(0.62 0.18 28);
  --color-primary-hover: oklch(0.68 0.20 28);
  --color-primary-foreground: oklch(0.99 0.005 75);

  --color-secondary: oklch(0.74 0.10 75);
  --color-secondary-hover: oklch(0.80 0.12 75);

  --color-accent: oklch(0.68 0.12 60);
  --color-accent-foreground: oklch(0.10 0.01 30);

  --color-surface: oklch(0.18 0.01 30);
  --color-surface-tinted: oklch(0.22 0.02 30);
  --color-surface-elevated: oklch(0.25 0.02 30);

  --color-on-surface: oklch(0.95 0.005 75);
  --color-on-surface-muted: oklch(0.65 0.01 75);
  --color-on-primary: oklch(0.99 0.005 75);

  --color-border: oklch(0.32 0.02 50);
  --color-border-strong: oklch(0.50 0.04 50);

  --color-error: oklch(0.65 0.20 25);
  --color-error-foreground: oklch(0.99 0.005 25);
  --color-success: oklch(0.70 0.18 145);
  --color-success-foreground: oklch(0.99 0.005 145);
  --color-warning: oklch(0.80 0.15 80);
  --color-warning-foreground: oklch(0.20 0.01 80);
  --color-info: oklch(0.70 0.15 220);
  --color-info-foreground: oklch(0.99 0.005 220);
}

/* ==========================================================================
   基础样式
   ========================================================================== */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-family: var(--font-family-sans);
  font-size: 16px;
  line-height: var(--line-height-normal);
  color: var(--color-on-surface);
  background: var(--color-surface);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  margin: 0;
  min-height: 100dvh;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

p {
  margin: 0;
  line-height: var(--line-height-relaxed);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--duration-quick) var(--ease-out-quart);
}
a:hover {
  color: var(--color-primary-hover);
}

button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

img, svg, video {
  display: block;
  max-width: 100%;
  height: auto;
}

/* 减弱动效 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 焦点环（可访问性） */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
