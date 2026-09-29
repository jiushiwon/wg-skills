# 技术栈：HTML + Tailwind

最快出活的方式。适合落地页、demo、静态站。

---

## 项目结构

```
project/
├── index.html
├── pages/
│   ├── about.html
│   └── contact.html
├── assets/
│   ├── css/
│   │   └── custom.css          # 补充 Tailwind 覆盖不到的部分
│   ├── js/
│   │   └── main.js
│   ├── fonts/
│   └── images/
├── components/                  # 可选：复用片段
│   ├── header.html
│   └── footer.html
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 初始化

```bash
npm init -y
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 配置文件

```js
// tailwind.config.js
// 直接套用 templates/tokens.tailwind.tpl
module.exports = {
  content: ['./**/*.html', './components/**/*.html'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: { extend: { /* 完整 token 见 templates/ */ } },
  plugins: [require('@tailwindcss/forms')],
};
```

```css
/* assets/css/input.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 引入 tokens.css（如果有自定义 CSS 变量） */
@import './tokens.css';

/* 自定义层 */
@layer components {
  .btn-primary { /* ... */ }
  .card { /* ... */ }
}
```

## HTML 模板

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>项目名</title>
  <link rel="stylesheet" href="./assets/css/output.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap">
</head>
<body class="bg-surface text-on-surface min-h-dvh antialiased">
  <!-- 导航 -->
  <header class="sticky top-0 z-sticky bg-surface-elevated/80 backdrop-blur border-b border-border">
    <div class="container flex items-center justify-between h-16">
      <a class="text-xl font-semibold">Logo</a>
      <nav class="hidden md:flex items-center gap-6">
        <a class="text-sm">产品</a>
        <a class="text-sm">价格</a>
        <a class="text-sm">关于</a>
      </nav>
      <a class="btn-primary">开始使用</a>
    </div>
  </header>

  <!-- Hero -->
  <main class="container py-24">
    <h1 class="text-5xl md:text-6xl font-bold tracking-tight">
      让设计 <em class="italic">重新</em> 有趣
    </h1>
    <p class="mt-6 text-xl text-on-surface-muted max-w-2xl">
      把 6 周的工作量压缩到 6 分钟，所有约束都为你提前预设。
    </p>
    <div class="mt-8 flex gap-4">
      <a class="btn-primary btn-lg">立即开始</a>
      <a class="btn-ghost btn-lg">观看演示</a>
    </div>
  </main>

  <script src="./assets/js/main.js"></script>
</body>
</html>
```

## 关键约定

- **HTML 优先** + Tailwind utility
- **自定义组件**用 `@apply` 在 CSS 中
- **不引入框架**（React / Vue）
- **构建产物**用 Vite 或 Parcel（可选）

## 适用场景

- ✅ 营销落地页
- ✅ 静态文档
- ✅ 个人作品集
- ✅ 快速 demo
- ❌ 不适合复杂 SPA
- ❌ 不适合大型项目

## 优化建议

- **图片**：WebP / AVIF + `loading="lazy"`
- **CSS**：`purge` 已配置，避免重复
- **字体**：`font-display: swap` + 预加载
- **JS**：尽量不用，必须用时 defer / async
- **缓存**：HTML 设 `Cache-Control: max-age=0`，静态资源 `1y`

## 验证清单

- [ ] viewport meta 正确
- [ ] Tailwind purge 配置覆盖所有 HTML
- [ ] 字体预加载 + font-display: swap
- [ ] 图片 WebP + lazy load
- [ ] 触摸目标 ≥44pt
- [ ] 减弱动效模式
- [ ] 无障碍（alt、aria-label、语义化）
- [ ] 构建产物 < 100KB（gzip）
