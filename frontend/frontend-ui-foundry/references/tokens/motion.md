# 动效（Motion）

动效是设计的肌肉——用得好让界面活起来，用得差让界面烦躁。

---

## 黄金法则

1. **不动 CSS 布局属性**（width/height/top/left/margin/padding）
2. **只用 transform 和 opacity**（触发 GPU 合成，60fps）
3. **ease-out 指数曲线**，无 bounce/elastic
4. **动效必须有意义**——传达因果、空间、层级，不为动而动
5. **尊重 `prefers-reduced-motion`**——所有动效必须能关闭

---

## 时长阶梯

```css
--duration-instant: 0ms;       /* 立即 */
--duration-fast: 100ms;        /* 极快 - 颜色变化 */
--duration-quick: 150ms;       /* 快 - 微交互 */
--duration-base: 200ms;        /* 基础 - 按钮、链接 */
--duration-medium: 300ms;      /* 中 - 卡片、菜单 */
--duration-slow: 400ms;        /* 慢 - 模态、抽屉 */
--duration-slower: 600ms;      /* 更慢 - 页面切换 */
--duration-slowest: 1000ms;    /* 最慢 - 庆祝动画 */
```

### 用途映射

| 时长 | 用途 |
|------|------|
| 100ms | 颜色、背景、边框 hover |
| 150ms | 按钮按下/抬起、tooltip 出现 |
| 200ms | 输入框聚焦、链接 hover、卡片悬停 |
| 300ms | 菜单展开/收起、tab 切换、tooltip 移动 |
| 400ms | 抽屉滑入、模态缩放 |
| 600ms | 页面切换、骨架屏过渡 |
| 1000ms+ | 庆祝、成就、loading 完成 |

---

## 缓动函数

```css
/* ease-out 指数曲线（推荐默认） */
--ease-out-quart: cubic-bezier(0.16, 1, 0.3, 1);     /* 强力推出 */
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);    /* 更强推出 */
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);     /* 最强推出 */
--ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);    /* 标准 */

/* ease-in 用于离开 */
--ease-in-quart: cubic-bezier(0.5, 0, 0.75, 0);
--ease-in-cubic: cubic-bezier(0.32, 0, 0.67, 0);

/* ease-in-out 用于循环（不推荐用于 UI） */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* 弹簧（仅用于游戏化场景） */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);    /* 注意：过强会显得轻浮 */
```

### 进出配对

```css
/* 入场用 ease-out（强出） */
.modal-enter { transition: all 300ms var(--ease-out-quart); }

/* 离场用 ease-in（快入） */
.modal-exit { transition: all 200ms var(--ease-in-quart); }

/* 离场比入场快 60-70% → 响应感强 */
```

---

## 动效类型

### 1. 颜色 / 背景变化
```css
.button {
  transition: background-color 150ms var(--ease-out-quart),
              color 150ms var(--ease-out-quart),
              border-color 150ms var(--ease-out-quart);
}
```

### 2. 悬停浮起
```css
.card {
  transition: transform 200ms var(--ease-out-quart),
              box-shadow 200ms var(--ease-out-quart);
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### 3. 按下反馈
```css
.button:active {
  transform: scale(0.97);
  transition-duration: 100ms; /* 按下要快 */
}
```

### 4. 模态 / 抽屉
```css
/* 入场：从下往上滑入 + 淡入 */
.modal {
  animation: modal-in 300ms var(--ease-out-quart);
}
@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 离场：快入 */
.modal.is-closing {
  animation: modal-out 200ms var(--ease-in-quart);
}
@keyframes modal-out {
  to {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
}
```

### 5. 列表交错入场
```css
.list-item {
  animation: item-in 300ms var(--ease-out-quart) backwards;
}
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 40ms; }
.list-item:nth-child(3) { animation-delay: 80ms; }
.list-item:nth-child(4) { animation-delay: 120ms; }
/* 每项延迟 30-50ms，太多反而拖沓 */
```

### 6. 页面切换
```css
/* 前进：左滑 */
.page-forward-enter {
  transform: translateX(20px);
  opacity: 0;
}

/* 后退：右滑 */
.page-backward-enter {
  transform: translateX(-20px);
  opacity: 0;
}
```

### 7. 骨架屏 / 加载
```css
.skeleton {
  background: linear-gradient(90deg,
    var(--color-surface-tinted) 0%,
    var(--color-border) 50%,
    var(--color-surface-tinted) 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1500ms infinite linear;
}
@keyframes skeleton-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
```

### 8. 进度条
```css
.progress-bar-fill {
  transition: width 300ms var(--ease-out-quart);
}
```

---

## 绝对禁止

### ❌ 动 CSS 布局属性
```css
/* ❌ 触发重排，性能差 */
height: 100px;
transition: height 300ms;

/* ✅ 用 transform 模拟 */
transform: scaleY(1);
transition: transform 300ms;
```

### ❌ bounce / elastic
```css
/* ❌ 违背物理 */
transition: all 500ms cubic-bezier(0.68, -0.55, 0.27, 1.55);

/* ✅ 平滑推出 */
transition: all 300ms var(--ease-out-quart);
```

### ❌ 装饰性动效
```css
/* ❌ 旋转 logo、闪烁边框、滚动监听函数堆叠 */
.logo { animation: spin 5s infinite linear; }

/* ✅ 动效必须有用途 */
.icon { transition: transform 200ms; }
.icon:hover { transform: rotate(15deg); }
```

### ❌ 动画时长 >500ms 用于 UI
```css
/* ❌ 让人等待 */
transition: all 800ms;

/* ✅ 复杂动画 ≤400ms */
transition: all 300ms;
```

---

## prefers-reduced-motion

**所有动效必须支持减弱模式**：

```css
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
```

也可以在 JavaScript 中检测：
```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  // 关闭非必要动效
}
```

---

## 性能检查

- [ ] 只用 transform / opacity 动画
- [ ] 用 will-change 提示浏览器（适度，不滥用）
  ```css
  .animating {
    will-change: transform, opacity;
  }
  .idle {
    will-change: auto;
  }
  ```
- [ ] 主线程每帧工作 ≤16ms（60fps）
- [ ] 触摸响应 ≤100ms（HIG 标准）
- [ ] 输入延迟 ≤100ms（Material 标准）

---

## 交互响应反馈

| 操作 | 反馈 | 时长 |
|------|------|------|
| 点击按钮 | scale 0.97 + 阴影变化 | 100ms |
| Hover 卡片 | translateY(-2px) + 阴影 | 200ms |
| 输入框聚焦 | 边框变色 + ring | 150ms |
| 切换开关 | 滑块平移 | 200ms |
| Toast 出现 | 上滑 + 淡入 | 300ms |
| Toast 消失 | 下滑 + 淡出 | 200ms |

---

## 场景动效建议

| 场景 | 动效风格 |
|------|---------|
| 营销落地页 | 戏剧性、丰富、scroll-triggered |
| 管理后台 | 极简、克制、快（200ms 内） |
| 文档站 | 几乎无动效，焦点在内容 |
| 金融应用 | 极简，无弹跳，体现稳重 |
| 移动 App | 平台一致（iOS/Material） |
| 3D 沉浸 | 大量、戏剧、与 3D 场景同步 |

---

## 验证清单

- [ ] 没有动 CSS 布局属性
- [ ] 缓动是 ease-out 指数曲线或 ease-in（离场）
- [ ] 没有 bounce / elastic
- [ ] 复杂动画 ≤400ms
- [ ] 装饰性动效 = 0
- [ ] prefers-reduced-motion 已被处理
- [ ] will-change 适度使用
- [ ] 触摸响应 < 100ms
- [ ] hover/focus/active 三态都有反馈
