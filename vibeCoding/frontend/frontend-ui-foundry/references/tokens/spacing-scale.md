# 间距阶梯（Spacing Scale）

基于 4pt 网格的间距系统。**所有间距值必须落在 4pt 网格上**。

---

## 间距 Token（4pt 网格）

```css
--space-0: 0;            /* 0 */
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
--space-32: 8rem;        /* 128px */
--space-40: 10rem;       /* 160px */
--space-48: 12rem;       /* 192px */
--space-64: 16rem;       /* 256px */
```

---

## 间距语义 Token

把抽象尺寸映射到语义角色，避免每个组件自己决定：

```css
/* 内边距 */
--padding-component-tight: var(--space-2);    /* 8px - 紧凑控件 */
--padding-component: var(--space-4);          /* 16px - 标准组件 */
--padding-component-loose: var(--space-6);    /* 24px - 宽松组件 */

/* 卡片 */
--padding-card: var(--space-6);               /* 24px - 标准卡片 */
--padding-card-loose: var(--space-8);         /* 32px - 强调卡片 */

/* 区块 */
--padding-section: var(--space-16);           /* 64px - 标准 section */
--padding-section-loose: var(--space-24);     /* 96px - 强调 section */
--padding-section-tight: var(--space-8);      /* 32px - 紧凑 section */

/* 页面 */
--padding-page-mobile: var(--space-4);        /* 16px - 移动端页面边距 */
--padding-page-desktop: var(--space-8);       /* 32px - 桌面端页面边距 */

/* 列表项 */
--gap-list-tight: var(--space-2);             /* 8px */
--gap-list: var(--space-4);                   /* 16px */
--gap-list-loose: var(--space-6);             /* 24px */

/* 网格 */
--gap-grid-tight: var(--space-4);             /* 16px */
--gap-grid: var(--space-6);                   /* 24px */
--gap-grid-loose: var(--space-8);             /* 32px */

/* 表单 */
--gap-form: var(--space-4);                   /* 16px - 字段间距 */
--gap-form-loose: var(--space-6);             /* 24px - 分组间距 */
```

---

## 间距使用规则

### 1. 节奏对比
不要处处相同。视觉层次需要"密集-疏-密"的对比：

```
- 列表项：8px（紧）
- 区块内：24px（中）
- 区块间：64px（疏）
- 页面段：96px（极疏）
```

### 2. 奇偶关系
相邻元素间距成对子，避免累加误差：

```
- 标题到正文：8-16px
- 正文段内：4-8px
- 段间：16-24px
- 区块间：48-64px
```

### 3. 容器内部 vs 外部
```css
/* ❌ 内部和外部间距相同 → 视觉模糊 */
.section { padding: 24px; margin: 24px; }

/* ✅ 内部紧凑 + 外部宽松 */
.section { padding: 24px; margin-bottom: 64px; }
```

### 4. 触摸目标内部 padding
```css
/* iOS: 触摸目标 ≥44pt，文字 + padding = 44 */
button {
  min-height: 44px;
  padding: 12px 16px; /* 12+12+文字高度 ≈ 44 */
}

/* Material: 触摸目标 ≥48dp */
button {
  min-height: 48px;
  padding: 14px 16px;
}
```

### 5. 安全区
```css
/* iOS safe area */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);

/* 内容避开 notch/home indicator */
.content {
  margin-top: env(safe-area-inset-top, 0);
  margin-bottom: env(safe-area-inset-bottom, 0);
}
```

---

## 场景适配

### 移动端
- 页面边距：`16px`
- 卡片内边距：`16px`
- 区块间距：`32-48px`
- 列表项间距：`12px`

### 桌面端
- 页面边距：`32-64px`
- 卡片内边距：`24-32px`
- 区块间距：`64-96px`
- 列表项间距：`16-24px`

### 大屏（>1440px）
- 页面边距：`64-96px`
- 区块间距：`96-128px`
- 内容容器：`max-w-7xl` 居中

---

## 间距比例参考

| 比例 | 用途 | 应用 |
|------|------|------|
| 1:1 | 等距 | 列表项、按钮内 |
| 1:2 | 段落内 | 字段标签与输入 |
| 1:3 | 区块内 | 标题与正文 |
| 1:4 | 区块间 | 卡片组 |
| 1:6 | 章节间 | 页面 section |
| 1:8 | 大段间 | 页面顶部 hero 与下方 |

---

## 常见反模式

```css
/* ❌ 奇数值 */
padding: 13px 17px 21px;

/* ❌ 魔法数字 */
gap: 23px;

/* ❌ 处处相同 */
.card { padding: 16px; }
.section { padding: 16px; }
.page { padding: 16px; }

/* ❌ 内外不分 */
padding: 48px;
margin: 48px;
```

```css
/* ✅ 4pt 网格 */
padding: 16px 24px;

/* ✅ 语义 Token */
padding: var(--padding-card);

/* ✅ 节奏对比 */
.card { padding: 24px; }
.section { padding: 64px 0; }
.page { padding: 32px; }

/* ✅ 内外有别 */
.section {
  padding: 64px 32px;   /* 内 */
  margin-bottom: 96px;  /* 外 */
}
```

---

## 工具函数

```js
// 间距转换
function space(n) {
  return `${n * 4}px`; // 4pt 网格
}

// 响应式间距
function responsiveSpace(mobile, desktop) {
  return {
    mobile: space(mobile),
    desktop: space(desktop),
  };
}

// 例：mobile 16, desktop 24
const sectionPadding = responsiveSpace(4, 6); // 16px / 24px
```

---

## 验证

生成或优化时检查：
- [ ] 所有 padding/margin/gap 值都在 4pt 网格上（4, 8, 12, 16, 20, 24, 32, ...）
- [ ] 没有奇数值（5px, 7px, 13px 等）
- [ ] 内部 padding < 外部 margin（视觉分组清晰）
- [ ] 触摸目标高度 = 文字 + 上下 padding ≥44px
- [ ] 移动端页面边距 ≥16px
- [ ] 安全区正确处理（iOS notch/home indicator）
