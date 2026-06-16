# 布局栅格（Layout Grid）

断点、容器、栅格、列宽、间距、安全区。

---

## 断点（Breakpoints）

```css
--breakpoint-sm: 640px;     /* 手机横屏 / 小平板 */
--breakpoint-md: 768px;     /* 平板竖屏 */
--breakpoint-lg: 1024px;    /* 平板横屏 / 小桌面 */
--breakpoint-xl: 1280px;    /* 桌面 */
--breakpoint-2xl: 1536px;   /* 大桌面 */
--breakpoint-3xl: 1920px;   /* 全高清 */
```

### 设备映射

| 断点 | 设备 | 列数建议 |
|------|------|---------|
| < sm | 手机竖屏 | 4 |
| sm-md | 手机横屏 / 小平板 | 8 |
| md-lg | 平板 | 12 |
| lg-xl | 桌面 | 12 |
| xl-2xl | 大桌面 | 12 |
| > 2xl | 4K | 12（max-w 不变） |

### 移动优先

```css
/* 移动优先：默认 mobile，min-width 升级 */
.container {
  padding: 0 var(--space-4);
}
@media (min-width: 768px) {
  .container { padding: 0 var(--space-6); }
}
@media (min-width: 1024px) {
  .container { padding: 0 var(--space-8); }
}
```

---

## 容器（Container）

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
--container-prose: 65ch;  /* 阅读宽度 */
```

### 容器宽度策略

| 类型 | max-width | 用途 |
|------|----------|------|
| prose | 65ch (480px) | 博客文章、长文阅读 |
| sm | 640px | 表单、登录页 |
| md | 768px | 详情页、博客列表 |
| lg | 1024px | 仪表盘、设置页 |
| xl | 1280px | 标准落地页 |
| 2xl | 1536px | 大屏 SaaS 后台 |
| 7xl | 1280px | Tailwind 通用容器 |

### 居中 + 内边距

```css
.container {
  max-width: var(--container-xl);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}
```

---

## 栅格（Grid）

### 12 列栅格（默认）

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-6);
}

/* 列宽 */
.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.col-span-4 { grid-column: span 4; }
.col-span-5 { grid-column: span 5; }
.col-span-6 { grid-column: span 6; }
.col-span-7 { grid-column: span 7; }
.col-span-8 { grid-column: span 8; }
.col-span-9 { grid-column: span 9; }
.col-span-10 { grid-column: span 10; }
.col-span-11 { grid-column: span 11; }
.col-span-12 { grid-column: span 12; }
```

### 响应式列数

| 场景 | mobile | tablet | desktop |
|------|--------|--------|---------|
| 卡片网格 | 1 | 2 | 3-4 |
| 表单单列 | 1 | 1 | 1 |
| 表单双列 | 1 | 2 | 2 |
| 数据表格 | 横向滚动 | 横向滚动 | 完整展示 |
| 详情页侧栏 | 隐藏 | 隐藏 | 1/3 |
| 营销 hero | 1 | 1 | 1（可分两栏） |

### 6/4 不对称栅格（推荐用于落地页）

```css
.hero {
  display: grid;
  grid-template-columns: 6fr 4fr; /* 6+4 不对称，制造张力 */
  gap: var(--space-8);
}
```

### 5/7 编辑感栅格

```css
.feature {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: var(--space-12);
}
```

---

## 触摸目标

```css
--touch-target-min: 44px;       /* iOS HIG */
--touch-target-android: 48px;   /* Material */
--touch-target-comfortable: 48px;
--touch-target-large: 56px;
```

**规则**：
- 所有可点击元素 ≥ 44×44pt
- 触摸目标间距 ≥ 8px
- 主要操作 ≥ 48×48dp（更舒适）

---

## Z-index 层级

```css
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
```

---

## 安全区（Safe Area）

### iOS
```css
/* 顶部 notch / Dynamic Island */
padding-top: env(safe-area-inset-top);    /* 47pt (with notch) */

/* 底部 home indicator */
padding-bottom: env(safe-area-inset-bottom);  /* 34pt */

/* 横屏 */
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### 关键 CSS 函数
```css
/* 视口高度（移动浏览器地址栏友好） */
min-height: 100vh;        /* 包含地址栏 */
min-height: 100dvh;       /* 动态视口（推荐） */
min-height: 100svh;       /* 小视口稳定 */
min-height: 100lvh;       /* 大视口稳定 */
```

### 完整移动端布局
```css
.page {
  min-height: 100dvh;
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}
```

---

## 视口与缩放

```html
<!-- 必须配置：禁止禁用缩放 -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover">
```

**规则**：
- 必须 `width=device-width`（不是固定值）
- 必须允许缩放（`user-scalable=yes`，最多 5x）
- iOS 全屏：`viewport-fit=cover` 启用 safe-area-inset-*

---

## 容器查询（Container Queries）

针对组件级响应式：

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-4);
  }
}
```

**适用场景**：可复用组件（卡片、列表项）在不同父容器中自适应。

---

## 滚动行为

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

/* 自定义滚动条 */
.scrollable {
  overflow-y: auto;
  scrollbar-width: thin;  /* Firefox */
  scrollbar-color: var(--color-border-strong) transparent;
}
.scrollable::-webkit-scrollbar {
  width: 8px;
}
.scrollable::-webkit-scrollbar-track {
  background: transparent;
}
.scrollable::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: 4px;
}
```

---

## 布局模式

### 1. 经典侧边栏布局
```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

@media (max-width: 1023px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: fixed;
    z-index: var(--z-fixed);
  }
}
```

### 2. 三栏布局（管理后台）
```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr 280px;
  min-height: 100vh;
  gap: 0;
}

@media (max-width: 1279px) {
  .layout { grid-template-columns: 240px 1fr; }
  .right-panel { display: none; }
}

@media (max-width: 1023px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar, .right-panel { display: none; }
}
```

### 3. 居中表单（登录/设置）
```css
.centered-form {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: var(--space-4);
}
.centered-form form {
  width: 100%;
  max-width: 400px;
}
```

### 4. 移动端单列
```css
.mobile-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}
```

### 5. 营销 Hero
```css
.hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
  padding: var(--space-16) var(--space-4);
  text-align: center;
  max-width: var(--container-xl);
  margin: 0 auto;
}
@media (min-width: 1024px) {
  .hero {
    grid-template-columns: 1.2fr 1fr;
    text-align: left;
    padding: var(--space-24) var(--space-8);
  }
}
```

### 6. 仪表盘网格
```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-6);
  padding: var(--space-6);
}
.metric { grid-column: span 12; }
@media (min-width: 768px) {
  .metric { grid-column: span 6; }
}
@media (min-width: 1024px) {
  .metric { grid-column: span 3; }
}
```

---

## 验证清单

- [ ] 移动优先（默认 mobile，min-width 升级）
- [ ] viewport meta 配置正确（不禁止缩放）
- [ ] 12 列栅格 + 响应式断点
- [ ] 容器 max-width + 居中
- [ ] 触摸目标 ≥44pt
- [ ] 触摸目标间距 ≥8px
- [ ] 安全区正确处理（iOS）
- [ ] min-h-dvh 替代 100vh（移动）
- [ ] 横屏 / 竖屏适配
- [ ] 横向滚动已禁止（移动端）
- [ ] prefers-reduced-motion 支持
- [ ] Z-index 层级清晰
