# 尺寸阶梯完整规范

> 命名严格对齐 `uniapp-theme-skill`：以 `4px` 为基准。

## 一、间距 `--space-{n}`

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-1` | 4px | 极小间距（图标与文字） |
| `--space-2` | 8px | 标签内边距 |
| `--space-3` | 12px | 紧凑间距 |
| `--space-4` | 16px | **基准间距**（卡片内边距） |
| `--space-5` | 20px | 中等间距 |
| `--space-6` | 24px | 区块间距 |
| `--space-8` | 32px | 大区块 |
| `--space-10` | 40px | 页面分区 |
| `--space-12` | 48px | 章节间距 |
| `--space-16` | 64px | 大章节 |

## 二、字体 `--font-{size}`

| Token | 值 | 字重 | 用途 |
|-------|-----|------|------|
| `--font-2xs` | 11px | 400 | 角标、徽章 |
| `--font-xs` | 12px | 400 | 辅助说明、时间 |
| `--font-sm` | 13px | 400 | 紧凑正文 |
| `--font-base` | 14px | 400 | **基准正文** |
| `--font-lg` | 16px | 500 | 卡片标题 |
| `--font-xl` | 18px | 600 | 区块标题 |
| `--font-2xl` | 22px | 600 | 页面标题 |
| `--font-3xl` | 28px | 700 | 大标题 |
| `--font-4xl` | 36px | 700 | Hero 标题 |

### 行高 `--leading-*`

```css
--leading-tight:  1.2;  /* 标题 */
--leading-normal: 1.5;  /* 正文 */
--leading-loose:  1.8;  /* 长文本 */
```

### 字重 `--weight-*`

```css
--weight-normal:   400;
--weight-medium:   500;
--weight-semibold: 600;
--weight-bold:     700;
```

## 三、圆角 `--radius-{size}`

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | 8px | 小标签、小按钮 |
| `--radius-md` | 12px | 输入框、缩略图 |
| `--radius-lg` | 16px | 卡片 |
| `--radius-xl` | 20px | 大卡片、Banner |
| `--radius-2xl` | 24px | 浮层、弹窗 |
| `--radius-full` | 999px | 头像、胶囊 |

## 四、组件高度 `--height-{comp}-{size}`

### 按钮

```css
--height-button-sm: 32px;  /* 小按钮 */
--height-button-md: 40px;  /* 基准按钮 */
--height-button-lg: 48px;  /* 大按钮 */
```

### 输入框

```css
--height-input-sm:  32px;
--height-input-md:  40px;
--height-input-lg:  48px;
```

### 卡片

```css
--height-card-sm:   80px;   /* 紧凑卡片 */
--height-card-md:   120px;  /* 标准卡片 */
--height-card-lg:   200px;  /* 大卡片 */
```

### 表格行

```css
--height-table-row-sm: 40px;  /* 紧凑表格 */
--height-table-row-md: 52px;  /* 基准表格 */
--height-table-row-lg: 64px;  /* 宽松表格 */
```

## 五、图标 `--icon-{size}`

| Token | 值 | 用途 |
|-------|-----|------|
| `--icon-xs` | 12px | 内联小图标 |
| `--icon-sm` | 16px | 列表图标 |
| `--icon-md` | 20px | **基准图标** |
| `--icon-lg` | 24px | 按钮图标 |
| `--icon-xl` | 32px | 大图标 |

## 六、阴影 `--shadow-{size}`

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | 卡片底部 |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | 卡片悬浮 |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | 浮层 |
| `--shadow-xl` | `0 16px 48px rgba(0,0,0,0.16)` | 弹窗 |

## 七、命名红线

❌ **禁止**的命名（已废弃）：
```css
--spacing-xs          /* 旧：应改为 --space-2 */
--gap-4               /* 不统一 */
--text-color          /* 缺类别 */
--button-height       /* 应改为 --height-button-md */
--font-size-small     /* 应改为 --font-sm */
```

✅ **正确**的命名：
```css
--space-4
--font-base
--height-button-md
--color-primary
--radius-md
```