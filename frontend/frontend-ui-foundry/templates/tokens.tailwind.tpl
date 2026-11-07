/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx,vue}'],

  darkMode: ['class', '[data-theme="dark"]'],

  theme: {
    extend: {
      // ---------- 颜色（默认赤琥金，切换调色板改这里） ----------
      colors: {
        primary: {
          DEFAULT: 'oklch(0.55 0.16 28)',
          hover: 'oklch(0.48 0.18 28)',
          foreground: 'oklch(0.99 0.005 75)',
        },
        secondary: {
          DEFAULT: 'oklch(0.74 0.10 75)',
          hover: 'oklch(0.68 0.12 75)',
        },
        accent: {
          DEFAULT: 'oklch(0.62 0.12 60)',
          foreground: 'oklch(0.99 0.005 75)',
        },
        surface: {
          DEFAULT: 'oklch(0.97 0.01 75)',
          tinted: 'oklch(0.94 0.03 75)',
          elevated: 'oklch(0.99 0.005 75)',
        },
        'on-surface': {
          DEFAULT: 'oklch(0.18 0.01 30)',
          muted: 'oklch(0.45 0.01 30)',
        },
        border: {
          DEFAULT: 'oklch(0.85 0.02 60)',
          strong: 'oklch(0.65 0.04 50)',
        },
        error: {
          DEFAULT: 'oklch(0.55 0.20 25)',
          foreground: 'oklch(0.99 0.005 25)',
        },
        success: {
          DEFAULT: 'oklch(0.60 0.15 145)',
          foreground: 'oklch(0.99 0.005 145)',
        },
        warning: {
          DEFAULT: 'oklch(0.75 0.15 80)',
          foreground: 'oklch(0.20 0.01 80)',
        },
        info: {
          DEFAULT: 'oklch(0.60 0.15 220)',
          foreground: 'oklch(0.99 0.005 220)',
        },
      },

      // ---------- 字体 ----------
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'Geist', 'system-ui', 'sans-serif'],
        serif: ['"Source Han Serif SC"', '"Noto Serif SC"', '"Songti SC"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', '"SF Mono"', 'monospace'],
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.25rem', { lineHeight: '1.4' }],
        xl: ['1.5rem', { lineHeight: '1.3' }],
        '2xl': ['2rem', { lineHeight: '1.2' }],
        '3xl': ['2.5rem', { lineHeight: '1.1' }],
        '4xl': ['3.5rem', { lineHeight: '1.1' }],
        '5xl': ['4.5rem', { lineHeight: '1.05' }],
      },

      // ---------- 间距（4pt 网格，补充 Tailwind 默认） ----------
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // ---------- 圆角 ----------
      borderRadius: {
        none: '0',
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
      },

      // ---------- 阴影 ----------
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.20)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },

      // ---------- 动效 ----------
      transitionDuration: {
        fast: '100ms',
        quick: '150ms',
        base: '200ms',
        medium: '300ms',
        slow: '400ms',
        slower: '600ms',
      },

      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
        'in-quart': 'cubic-bezier(0.5, 0, 0.75, 0)',
        'in-cubic': 'cubic-bezier(0.32, 0, 0.67, 0)',
      },

      // ---------- 断点（补充） ----------
      screens: {
        '3xl': '1920px',
      },

      // ---------- 最大宽度 ----------
      maxWidth: {
        prose: '65ch',
        '8xl': '1536px',
      },

      // ---------- 触摸目标 ----------
      minHeight: {
        touch: '44px',
        'touch-android': '48px',
      },
      minWidth: {
        touch: '44px',
        'touch-android': '48px',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
    require('@tailwindcss/typography'),
  ],
};
