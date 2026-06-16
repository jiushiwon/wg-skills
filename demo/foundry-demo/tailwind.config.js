/** @type {import('tailwindcss').Config} */
/* eslint-disable */
module.exports = {
  content: [
    './index.html',
    './pages/**/*.{html,js,ts,vue,jsx,tsx}',
    './components/**/*.{html,js,ts,vue,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    /* 关闭默认色板 — 强制使用品牌 token */
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: {
        DEFAULT: 'var(--color-primary)',
        hover: 'var(--color-primary-hover)',
        fg: 'var(--color-primary-fg)',
        soft: 'var(--color-primary-soft)',
      },
      secondary: {
        DEFAULT: 'var(--color-secondary)',
        fg: 'var(--color-secondary-fg)',
      },
      accent: {
        DEFAULT: 'var(--color-accent)',
        fg: 'var(--color-accent-fg)',
      },
      info: {
        DEFAULT: 'var(--color-info)',
        fg: 'var(--color-info-fg)',
      },
      surface: {
        DEFAULT: 'var(--color-surface)',
        tinted: 'var(--color-surface-tinted)',
        elevated: 'var(--color-surface-elevated)',
        overlay: 'var(--color-surface-overlay)',
      },
      fg: {
        DEFAULT: 'var(--color-on-surface)',
        muted: 'var(--color-on-surface-muted)',
        subtle: 'var(--color-on-surface-subtle)',
      },
      border: {
        DEFAULT: 'var(--color-border)',
        strong: 'var(--color-border-strong)',
        focus: 'var(--color-border-focus)',
      },
      success: { DEFAULT: 'var(--color-success)', fg: 'var(--color-success-fg)' },
      warning: { DEFAULT: 'var(--color-warning)', fg: 'var(--color-warning-fg)' },
      error:   { DEFAULT: 'var(--color-error)',   fg: 'var(--color-error-fg)' },
    },
    spacing: {
      0: '0',
      px: '1px',
      0.5: '2px',
      1: 'var(--space-1)',
      2: 'var(--space-2)',
      3: 'var(--space-3)',
      4: 'var(--space-4)',
      5: 'var(--space-5)',
      6: 'var(--space-6)',
      8: 'var(--space-8)',
      10: 'var(--space-10)',
      12: 'var(--space-12)',
      16: 'var(--space-16)',
      20: 'var(--space-20)',
      24: 'var(--space-24)',
    },
    fontSize: {
      xs:   ['var(--fs-xs)',   { lineHeight: 'var(--lh-normal)' }],
      sm:   ['var(--fs-sm)',   { lineHeight: 'var(--lh-normal)' }],
      base: ['var(--fs-base)', { lineHeight: 'var(--lh-normal)' }],
      md:   ['var(--fs-md)',   { lineHeight: 'var(--lh-normal)' }],
      lg:   ['var(--fs-lg)',   { lineHeight: 'var(--lh-snug)'  }],
      xl:   ['var(--fs-xl)',   { lineHeight: 'var(--lh-snug)'  }],
      '2xl':['var(--fs-2xl)',  { lineHeight: 'var(--lh-tight)' }],
      '3xl':['var(--fs-3xl)',  { lineHeight: 'var(--lh-tight)' }],
    },
    fontFamily: {
      sans: ['var(--font-sans)'],
      mono: ['var(--font-mono)'],
    },
    borderRadius: {
      none: '0',
      xs: 'var(--radius-xs)',
      sm: 'var(--radius-sm)',
      DEFAULT: 'var(--radius-md)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      '2xl': 'var(--radius-2xl)',
      full: 'var(--radius-full)',
    },
    boxShadow: {
      xs: 'var(--shadow-xs)',
      sm: 'var(--shadow-sm)',
      DEFAULT: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      glow: 'var(--shadow-glow)',
    },
    transitionDuration: {
      100: 'var(--duration-fast)',
      150: 'var(--duration-quick)',
      200: 'var(--duration-base)',
      300: 'var(--duration-medium)',
    },
    transitionTimingFunction: {
      'out-quart': 'var(--ease-out-quart)',
      'in-out': 'var(--ease-in-out)',
    },
    extend: {
      /* 主题最大宽度（admin 偏宽） */
      maxWidth: {
        screen: '1440px',
      },
      /* 触摸目标保证 ≥44pt */
      minHeight: {
        touch: 'var(--touch-min)',
      },
    },
  },
  plugins: [],
};
