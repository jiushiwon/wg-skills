# 硬编码模式库

## 1. 颜色裸值

### 检测正则

```javascript
// 十六进制
/#([0-9a-f]{3,8})\b/gi

// rgb/rgba
/rgba?\s*\(\s*([\d\s,%.]+)\s*\)/gi

// hsl/hsla
/hsla?\s*\(\s*([\d\s,%.deg]+)\s*\)/gi

// 命名色（最常见 AI 写死）
/\b(red|blue|green|yellow|black|white|pink|purple|orange|gray|grey|cyan|magenta|navy|teal|maroon|olive|lime|aqua|silver)\b/gi
```

### 变量映射约定

#### 主色阶

| 裸值 | 建议变量 | 说明 |
|------|----------|------|
| `#c45c48`, `#c85948`, `#bd5640` | `--color-primary` | 主色（最高频） |
| `#d4a574`, `#e0b080` | `--color-secondary` | 副色 |
| `#4ade80`, `#22c55e` | `--color-success` | 成功 |
| `#fbbf24`, `#f59e0b` | `--color-warning` | 警告 |
| `#ef4444`, `#dc2626` | `--color-error` | 错误 |
| `#3b82f6`, `#2563eb` | `--color-info` | 信息 |

#### 中性色

| 裸值 | 建议变量 | 说明 |
|------|----------|------|
| `#1a1a1a`, `#171717` | `--color-on-surface` | 主文字 |
| `#6b6b6b`, `#737373` | `--color-text-secondary` | 次要文字 |
| `#a3a3a3`, `#a1a1aa` | `--color-text-muted` | 弱化文字 |
| `#fafaf5`, `#f5f5f4` | `--color-surface` | 背景 |
| `#ffffff`, `#fff` | `--color-surface-elevated` | 浮层背景 |
| `#e5e5e0`, `#e5e5e4` | `--color-border` | 边框 |
| `#f3f4f6` | `--color-bg-subtle` | 次要背景 |

#### 近义色聚类

```
cluster-1: #c45c48, #c85948, #bd5640, #b85540 → --color-primary
cluster-2: #3b82f6, #2563eb, #1d4ed8 → --color-info
cluster-3: #6b6b6b, #737373, #525252 → --color-text-secondary
```

**聚类规则**：色相差 ≤15° 且明度差 ≤20% 视为同色系，归为同一 token。

---

## 2. 尺寸裸值

### 检测正则

```javascript
// rpx（uniapp 移动端）
/\b(\d+)rpx\b/gi

// px（web 端）
/\b(\d+)px\b/gi

// rem
/\b(\d+\.?\d*)rem\b/gi
```

### 间距变量映射

| 裸值 | rpx | px(近似) | 建议 token | 档位 |
|------|-----|----------|------------|------|
| 4rpx | 4 | 2 | `--space-1` | 1 |
| 8rpx | 8 | 4 | `--space-2` | 2 |
| 12rpx | 12 | 6 | -- | - |
| 16rpx | 16 | 8 | `--space-3` | 3 |
| 24rpx | 24 | 12 | `--space-4` | 4 |
| 32rpx | 32 | 16 | `--space-5` | 5 |
| 48rpx | 48 | 24 | `--space-6` | 6 |
| 64rpx | 64 | 32 | `--space-7` | 7 |
| 96rpx | 96 | 48 | `--space-8` | 8 |

**4pt 网格对齐**：不在上表的裸值，若 `parseFloat(val) % 4 === 0` 则建议就近映射。

### 字号变量映射

| 裸值 | rpx | px(近似) | 建议 token |
|------|-----|----------|------------|
| 20rpx | 20 | 10 | `--text-xs` |
| 22rpx | 22 | 11 | -- |
| 24rpx | 24 | 12 | `--text-sm` |
| 26rpx | 26 | 13 | -- |
| 28rpx | 28 | 14 | `--text-base` |
| 32rpx | 32 | 16 | `--text-lg` |
| 36rpx | 36 | 18 | -- |
| 40rpx | 40 | 20 | `--text-xl` |
| 48rpx | 48 | 24 | `--text-2xl` |
| 56rpx | 56 | 28 | `--text-3xl` |

**iOS 缩放防护**：移动端字号 ≥16px（32rpx），低于此值 iOS 会自动缩放。

### 圆角变量映射

| 裸值 | rpx | 建议 token | 形态 |
|------|-----|------------|------|
| 4rpx | 4 | `--radius-sm` | 小圆角 |
| 8rpx | 8 | -- | - |
| 12rpx | 12 | -- | - |
| 16rpx | 16 | `--radius-md` | 中圆角 |
| 24rpx | 24 | `--radius-lg` | 大圆角 |
| 32rpx | 32 | `--radius-xl` | 超大 |
| 999rpx | 999 | `--radius-full` | 药丸 |

---

## 3. 未走变量的典型模式

### 内联 style

```vue
<!-- 检测这类 -->
<view style="padding: 32rpx; background: #f5f5f4;">
<view :style="{ color: '#c45c48' }">
```

### 选择器内硬编码

```scss
// 检测这类
.card {
  padding: 32rpx;  // 硬编码
  border-radius: 16rpx;  // 硬编码
}
```

### 建议迁移路径

```scss
// Before
.card {
  padding: 32rpx;
  background: #f5f5f4;
}

// After
.card {
  padding: var(--space-5);
  background: var(--color-bg-subtle);
}
```

---

## 4. AI 写死高频词（重点审计）

AI 生成代码时，以下值极高频写死：

| 类别 | 常见写死值 |
|------|------------|
| 颜色 | `red`, `blue`, `#ffffff`, `#000000` |
| 字号 | `12px`, `14px`, `13px` |
| 间距 | `10px`, `15px`, `13px`, `5px` |
| 圆角 | `5px`, `10px` |
| 高度 | `30px`, `40px`, `50px` |

**审计规则**：检测到上述值时，**必须**报告并建议变量化。

---

## 5. 验证规则

### 对比度校验

颜色变量化后必须校验对比度：

```javascript
// WCAG AA
const contrastRatio = (l1, l2) => {
  const L1 = l1 > 0.03928 ? Math.pow((l1 + 0.055) / 1.055, 2.4) : l1 / 12.92;
  const L2 = l2 > 0.03928 ? Math.pow((l2 + 0.055) / 1.055, 2.4) : l2 / 12.92;
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
};

// 规则
// - 正文文字 vs 背景 ≥ 4.5:1
// - 大文本（18px+ 或 14px+ bold）≥ 3:1
// - UI 组件边框/图标 ≥ 3:1
```

### 风险等级

| 风险 | 条件 |
|------|------|
| **低** | 已变量化，或裸值对比度 ≥ 4.5:1 |
| **中** | 裸值对比度 3-4.5:1 |
| **高** | 裸值对比度 < 3，或未检测到 |
