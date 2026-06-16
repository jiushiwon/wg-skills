# 圆角与阴影（Radius & Elevation）

圆角与阴影共同构成视觉深度。**慎用阴影**——扁平风宁少用，深色/3D 风多用。

---

## 圆角阶梯（Radius Scale）

```css
--radius-none: 0;
--radius-xs: 2px;     /* 极轻 */
--radius-sm: 4px;     /* 标签、小按钮 */
--radius-md: 8px;     /* 标准按钮、输入框 */
--radius-lg: 12px;    /* 卡片 */
--radius-xl: 16px;    /* 大卡片、模态框 */
--radius-2xl: 24px;   /* 强调卡片、浮层 */
--radius-3xl: 32px;   /* 特殊强调 */
--radius-full: 9999px;/* 头像、徽章、pill 按钮 */
```

### 语义映射

```css
--radius-button: var(--radius-md);       /* 8px */
--radius-input: var(--radius-md);        /* 8px */
--radius-card: var(--radius-lg);         /* 12px */
--radius-modal: var(--radius-xl);        /* 16px */
--radius-tooltip: var(--radius-sm);      /* 4px */
--radius-avatar: var(--radius-full);     /* 圆形 */
--radius-pill: var(--radius-full);       /* 胶囊 */
--radius-image: var(--radius-lg);        /* 12px - 图片圆角 */
```

---

## 圆角使用规则

### 1. 风格统一
所有圆角必须落在阶梯上，**禁用奇数**（3px、5px、7px 等）。

### 2. 层级关系
```css
/* ✅ 容器圆角 > 子元素圆角 + 内边距 */
.card { border-radius: 12px; padding: 16px; }
.card-child { border-radius: 8px; } /* 12 - 4 = 8 */

/* ❌ 子元素圆角 > 容器圆角 */
.card { border-radius: 12px; }
.card-child { border-radius: 16px; } /* 溢出 */
```

### 3. 风格匹配
| 风格 | 推荐圆角 | 原因 |
|------|---------|------|
| 极简 | 4-8px | 克制、几何感 |
| 现代 SaaS | 8-12px | 平衡亲和与专业 |
| 移动端 | 12-16px | iOS / Material 大圆角趋势 |
| 创意广告 | 16-24px | 戏剧性、亲和力 |
| 工具/控制台 | 2-4px | 工业感、密集 |
| 儿童/休闲 | 16-24px | 亲和、有趣 |

### 4. 元素大小匹配
- 小元素（按钮 32-40px）：4-8px
- 中元素（输入框 40-48px）：8-12px
- 大元素（卡片）：12-16px
- 巨大元素（模态框、抽屉）：16-24px

---

## 阴影阶梯（Elevation）

### 浅色主题

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.08);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.20);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

### 深色主题

深色主题阴影更弱，因为背景已经暗。改为发光 + 弱阴影：

```css
--shadow-xs-dark: 0 1px 2px 0 rgba(0, 0, 0, 0.30);
--shadow-sm-dark: 0 1px 3px 0 rgba(0, 0, 0, 0.40), 0 1px 2px -1px rgba(0, 0, 0, 0.30);
--shadow-md-dark: 0 4px 6px -1px rgba(0, 0, 0, 0.40), 0 2px 4px -2px rgba(0, 0, 0, 0.30);
--shadow-lg-dark: 0 10px 15px -3px rgba(0, 0, 0, 0.50), 0 4px 6px -4px rgba(0, 0, 0, 0.40);
```

### 语义映射

```css
--shadow-card: var(--shadow-sm);
--shadow-card-hover: var(--shadow-md);
--shadow-dropdown: var(--shadow-lg);
--shadow-modal: var(--shadow-xl);
--shadow-popover: var(--shadow-md);
--shadow-button: var(--shadow-xs);
--shadow-button-hover: var(--shadow-sm);
```

---

## 阴影使用规则

### 1. 扁平风宁少用
```css
/* 极简风：用细边框代替阴影 */
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: none;
}
```

### 2. 阴影颜色匹配场景
```css
/* 浅色背景：深色阴影 */
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.08);

/* 深色背景：黑色阴影更强（因为背景已经暗） */
--shadow-sm-dark: 0 1px 3px 0 rgba(0, 0, 0, 0.40);

/* 彩色阴影：呼应品牌色 */
--shadow-brand: 0 4px 12px 0 rgba(196, 92, 72, 0.20); /* 赤琥金 */
```

### 3. 阴影 vs 边框选择
- 阴影：表达"浮起"（卡片、模态、tooltip）
- 边框：表达"区分"（表单、表格行、按钮）
- 边框 + 弱阴影：表达"高级感"

### 4. 触摸反馈阴影
```css
button {
  box-shadow: var(--shadow-button);
  transition: box-shadow 150ms ease-out;
}
button:hover {
  box-shadow: var(--shadow-button-hover);
}
button:active {
  box-shadow: var(--shadow-inner);
  transform: translateY(1px);
}
```

---

## 边框（Border）

```css
--border-width-none: 0;
--border-width-thin: 1px;
--border-width-medium: 2px;
--border-width-thick: 4px;

--border-color: var(--color-border);
--border-color-strong: var(--color-border-strong);
--border-color-focus: var(--color-primary);

--border-style-solid: solid;
--border-style-dashed: dashed;
--border-style-dotted: dotted;
```

### 边框使用
```css
/* 标准 */
border: 1px solid var(--border-color);

/* 聚焦 */
border-color: var(--border-color-focus);
box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.20);

/* 错误 */
border-color: var(--color-error);
```

---

## Z-index 层级

```css
--z-index-hide: -1;
--z-index-base: 0;
--z-index-raised: 1;
--z-index-dropdown: 10;
--z-index-sticky: 20;
--z-index-fixed: 30;
--z-index-modal-backdrop: 40;
--z-index-modal: 50;
--z-index-popover: 60;
--z-index-tooltip: 70;
--z-index-notification: 80;
--z-index-max: 9999;
```

**规则**：
- 同一容器内不冲突
- 模态 > 抽屉 > 弹窗 > 下拉 > sticky
- 通知/toast 永远在最上

---

## 组合模式

### 卡片（标准）
```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-card);
  transition: box-shadow 200ms ease-out, transform 200ms ease-out;
}
.card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}
```

### 浮层（Dropdown / Popover）
```css
.popover {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  box-shadow: var(--shadow-dropdown);
  z-index: var(--z-index-popover);
}
```

### 模态框
```css
.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  z-index: var(--z-index-modal);
}
.modal-backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: var(--z-index-modal-backdrop);
}
```

### 按钮
```css
.button {
  height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-button);
  transition: all 150ms ease-out;
}
.button:hover {
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-1px);
}
.button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-inner);
}
```

---

## 验证清单

- [ ] 所有圆角在阶梯上（4/8/12/16/24/full）
- [ ] 没有奇数圆角
- [ ] 子元素圆角 < 容器圆角 - padding
- [ ] 阴影数量克制（同一视口不超过 3 个强阴影）
- [ ] 深色主题阴影用专用 token
- [ ] 触摸反馈（hover/active/focus）有视觉变化
- [ ] 焦点环可见（不靠颜色或阴影）
- [ ] Z-index 层级清晰、不冲突
