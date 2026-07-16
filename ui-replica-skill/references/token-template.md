# 设计 Token 模板

本模板用于 `ui-replica-skill` 收敛视觉规格。从图中提取颜色/间距/字号后，按此模板归类。

## 颜色

```scss
:root {
  /* 品牌色 */
  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --primary-active: #1E40AF;
  --primary-light: #EFF6FF;

  /* 语义色 */
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;

  /* 中性色 */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;

  /* 文字色 */
  --text-main: var(--gray-900);
  --text-sub: var(--gray-500);
  --text-placeholder: var(--gray-400);
  --text-inverse: #FFFFFF;

  /* 背景色 */
  --bg-page: var(--gray-100);
  --bg-card: #FFFFFF;
  --bg-hover: var(--gray-50);

  /* 边框色 */
  --border-light: var(--gray-200);
  --border-default: var(--gray-300);
}
```

## 间距

```scss
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;
  --space-4xl: 40px;
}
```

## 圆角

```scss
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

## 阴影

```scss
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
}
```

## 字号

```scss
:root {
  --text-xs: 12px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 20px;
  --text-3xl: 24px;
}
```

## 使用方式

Tailwind 项目中可通过 `tailwind.config.js` 的 `extend` 注入：

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'text-main': 'var(--text-main)',
        'bg-page': 'var(--bg-page)',
      }
    }
  }
}
```

Vue/uniapp 项目中可注入到 `:root` 或页面级样式。
