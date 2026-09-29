# 场景：移动端响应式（Mobile-Responsive）

移动端优先的响应式 Web，**先做好手机，再向上扩展到桌面**。

---

## 适用

- 移动优先 Web App
- 响应式营销页
- 跨端 Web 工具
- 移动端 SaaS 控制台

## 不适用

- 桌面独占工具（用 `pc-corporate` 或 `admin-dashboard`）
- 原生 App（用 `mobile-native`）
- 沉浸式 Web 体验（用 `threejs-3d`）

---

## 核心组件

| 组件 | 说明 |
|------|------|
| **Top Bar** | sticky/fixed，logo + menu icon，56-64px |
| **Bottom Nav** | 移动端主导航，3-5 项，56-72px 高，sticky bottom |
| **Tab Bar** | 横向 tab，sticky 在 top bar 下方 |
| **Card Stack** | 垂直堆叠的卡片，间距 16px |
| **FAB** | 主操作浮动按钮，56-72px 圆形，固定右下 |
| **Drawer** | 左侧抽屉/底部 sheet，二级导航 |
| **Modal Sheet** | 底部弹出 sheet（替代桌面模态框） |
| **Pull to Refresh** | 下拉刷新手势 |
| **Swipe Actions** | 左滑/右滑列表项操作 |
| **Skeleton Loader** | 加载占位（不用 spinner） |

---

## 布局基线

### 移动端（默认 < 768px）

```css
.page {
  padding: var(--space-4);  /* 16px */
  padding-top: calc(env(safe-area-inset-top, 0) + var(--space-4));
  padding-bottom: calc(env(safe-area-inset-bottom, 0) + 80px); /* 留出 bottom nav */
  min-height: 100dvh;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: 56px;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: var(--z-fixed);
  background: var(--color-surface-elevated);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

### 平板（768px-1023px）

```css
@media (min-width: 768px) {
  .page {
    padding: var(--space-6);
    max-width: var(--container-md);
    margin: 0 auto;
  }
  /* bottom nav 可改为侧边栏 */
  .bottom-nav {
    position: static;
    width: 200px;
    height: auto;
    border-top: none;
    border-right: 1px solid var(--color-border);
  }
}
```

### 桌面（≥ 1024px）

```css
@media (min-width: 1024px) {
  .page {
    padding: var(--space-8);
    max-width: var(--container-xl);
  }
  /* 布局改为三栏：左导航 + 主内容 + 右侧详情 */
  .layout {
    display: grid;
    grid-template-columns: 240px 1fr 320px;
    gap: var(--space-6);
  }
}
```

---

## 关键 Token 偏向

```css
/* 间距偏小，主间距 16px */
--space-section: var(--space-8);     /* 32px 区块间距，移动偏小 */

/* 圆角偏大，亲和感 */
--radius-button: var(--radius-md);   /* 8px */
--radius-card: var(--radius-lg);     /* 12px */
--radius-image: var(--radius-xl);    /* 16px 大圆角图片 */

/* 触摸目标 ≥44pt */
--touch-target: 44px;

/* 字体偏大，最小 16px 避免 iOS 缩放 */
--font-size-min: 16px;
```

---

## 关键交互

### 1. 触摸反馈
```css
.tappable {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 100ms var(--ease-out-quart),
              background-color 100ms var(--ease-out-quart);
}
.tappable:active {
  transform: scale(0.97);
  background-color: var(--color-surface-tinted);
}
```

### 2. 安全区
```css
.fixed-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.fixed-top {
  padding-top: env(safe-area-inset-top, 0);
}
```

### 3. 模态改为底部 Sheet
```html
<!-- ❌ 桌面式居中模态，移动端糟糕 -->
<div class="modal-center">...</div>

<!-- ✅ 移动端底部 sheet（手势友好） -->
<div class="modal-bottom-sheet">
  <div class="sheet-handle"></div>
  <div class="sheet-content">...</div>
</div>
```

### 4. 滚动行为
```css
.scroll-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain; /* 防止页面级滚动穿透 */
}
```

### 5. 软键盘适配
```css
/* 输入框聚焦时，关键内容不被遮挡 */
input:focus {
  scroll-margin-bottom: env(safe-area-inset-bottom, 0);
}
```

---

## 推荐调色板

- **冷调极简**（Linear / Vercel 风格）— 开发者工具、技术品牌
- **原生移动**（iOS / Material 系统色）— 工具型 App
- **暖色商务**（Stripe 风）— 电商、支付
- **金融稳重** — 银行、支付

---

## 反模式

- ❌ 横向滚动（移动端禁用）
- ❌ 固定 px 容器宽度（必须响应式）
- ❌ 字号 < 16px（iOS 自动缩放）
- ❌ 触摸目标 < 44pt
- ❌ 依赖 hover 显示关键信息（移动端不可用）
- ❌ 桌面式居中模态框（移动端应改为 sheet）
- ❌ disable user zoom
- ❌ 用 100vh 代替 100dvh（地址栏会重叠）

---

## 输出模板（React 示例）

```tsx
// App.tsx
import './tokens.css';

function App() {
  return (
    <div className="app">
      <header className="top-bar">
        <Logo />
        <button className="menu-icon" aria-label="菜单">≡</button>
      </header>

      <main className="page">
        <h1>移动优先页面</h1>
        <CardList />
      </main>

      <nav className="bottom-nav" aria-label="主导航">
        <NavItem icon="🏠" label="首页" active />
        <NavItem icon="🔍" label="搜索" />
        <NavItem icon="👤" label="我的" />
      </nav>
    </div>
  );
}
```

---

## 验证清单

- [ ] 移动优先（< 768px 默认样式完整可用）
- [ ] viewport meta 正确配置
- [ ] 触摸目标 ≥44pt
- [ ] 字号 ≥16px 避免 iOS 缩放
- [ ] safe-area-inset-* 正确处理
- [ ] bottom nav 数量 ≤5
- [ ] 模态用底部 sheet 而非居中弹窗
- [ ] 100dvh 替代 100vh
- [ ] 横向滚动已禁止
- [ ] 加载用骨架屏不用 spinner
- [ ] 触摸有反馈（scale + 颜色）
- [ ] 适配横屏（不强制竖屏）
- [ ] 减弱动效模式支持
