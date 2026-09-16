---
name: vue-theme-skill
description: Vue 3 主题系统（设计 Token 层），对齐 uniapp-theme-skill 命名体系。提供完整色阶（HSL 算法 50-950）、多主题切换、尺寸阶梯（space/font/height/icon）、静态 px 值（避免 calc 跨端兼容问题）。当用户提到"vue 主题"、"设计变量"、"theme token"、"颜色系统"、"vue 多主题"、"CSS 变量"时触发。严格只做 Token，不做组件、不做 dark mode、不做 JS bridge。
---

# Vue Theme Skill（Vue 设计 Token 层）

## ⚠️ 边界声明（绝不可越界）

| 能力 | 状态 |
|------|------|
| 设计 Token 体系（颜色 / 尺寸 / 圆角 / 阴影） | ✅ 负责 |
| 多主题色阶（HSL 算法 50-950） | ✅ 负责 |
| CSS 变量导出 | ✅ 负责 |
| 主题切换（运行时 / 构建时） | ✅ 负责 |
| **组件库** | ❌ 不做（由 vue-base-skill 负责） |
| **Dark Mode** | ❌ 不做 |
| **Z-Index / Motion / Transition** | ❌ 不做 |
| **JS Bridge / 主题持久化** | ❌ 不做（由业务层处理） |
| **TypeScript 类型生成** | ❌ 不做 |
| **Figma 对接 / A11y 校验** | ❌ 不做 |

## ⚠️ 严格依赖对齐

本 Skill 的命名体系**完全对齐** `uniapp-theme-skill`：

| 维度 | 命名规范 |
|------|---------|
| 颜色 | `--color-primary-{50~950}` + `--color-primary` |
| 间距 | `--space-2` / `--space-3` / `--space-4` ... |
| 字体 | `--font-{2xs,xs,sm,base,lg,xl,2xl,3xl}` |
| 圆角 | `--radius-{sm,md,lg,xl,full}` |
| 高度 | `--height-{button,input,card}-{sm,md,lg}` |
| 图标 | `--icon-{xs,sm,md,lg,xl}` |

## When to Use

- "vue 项目配置主题色"
- "vue 设计变量"
- "vue 多主题切换"
- "vue CSS 变量系统"
- "vue 色阶生成"

**Not for**：
- ❌ 组件库（→ vue-base-skill）
- ❌ 工程化骨架（→ vue-generate-skill）
- ❌ uniapp 项目（→ uniapp-theme-skill）

## 三大核心能力

### 能力 1：主题色（HSL 算法 50-950）

#### 9 级色阶

```css
--color-primary-50:   hsl(211, 100%, 96%);
--color-primary-100:  hsl(211, 100%, 92%);
--color-primary-200:  hsl(211, 100%, 86%);
--color-primary-300:  hsl(211, 100%, 76%);
--color-primary-400:  hsl(211, 100%, 66%);  /* 浅色 hover */
--color-primary-500:  hsl(211, 100%, 56%);  /* 主色（= --color-primary） */
--color-primary-600:  hsl(211, 100%, 48%);  /* 主色按下 */
--color-primary-700:  hsl(211, 100%, 40%);
--color-primary-800:  hsl(211, 100%, 32%);
--color-primary-950:  hsl(211, 100%, 16%);  /* 深色文本 */
```

**为什么用 HSL 而不是 RGB 混合？**
- ✅ 色相绝对稳定（hue 不变）
- ✅ 调整饱和度 / 亮度即可生成色阶
- ✅ 与 Tailwind / Material 等业界方案对齐

#### 8 套预设主题

| 主题 | 主色 HSL | 命名 |
|------|---------|------|
| 蓝（默认） | hsl(211, 100%, 56%) | `blue` |
| 绿 | hsl(152, 69%, 45%) | `green` |
| 紫 | hsl(262, 83%, 58%) | `purple` |
| 红 | hsl(0, 84%, 60%) | `red` |
| 橙 | hsl(33, 100%, 56%) | `orange` |
| 青 | hsl(180, 77%, 47%) | `cyan` |
| 粉 | hsl(330, 81%, 60%) | `pink` |
| 灰 | hsl(220, 9%, 46%) | `slate` |

### 能力 2：尺寸阶梯（命名统一）

#### 间距 `--space-{n}`（以 4px 为基准）

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;  /* 基准 */
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

#### 字体 `--font-{size}`

```css
--font-2xs: 11px;
--font-xs:  12px;
--font-sm:  13px;
--font-base:14px;  /* 基准 */
--font-lg:  16px;
--font-xl:  18px;
--font-2xl: 22px;
--font-3xl: 28px;
```

#### 圆角 `--radius-{size}`

```css
--radius-sm:   8px;
--radius-md:   12px;  /* 输入框、缩略图 */
--radius-lg:   16px;  /* 卡片 */
--radius-xl:   20px;
--radius-full: 999px; /* 头像、胶囊 */
```

#### 组件高度 `--height-{comp}-{size}`

```css
--height-button-sm: 32px;
--height-button-md: 40px;  /* 基准 */
--height-button-lg: 48px;

--height-input-sm:  32px;
--height-input-md:  40px;
--height-input-lg:  48px;

--height-card-sm:   80px;
--height-card-md:   120px;
--height-card-lg:   200px;
```

#### 图标 `--icon-{size}`

```css
--icon-xs: 12px;
--icon-sm: 16px;
--icon-md: 20px;  /* 基准 */
--icon-lg: 24px;
--icon-xl: 32px;
```

#### 阴影 `--shadow-{size}`

```css
--shadow-sm:   0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
```

#### 字重 `--weight-{level}`

```css
--weight-normal:   400;
--weight-medium:   500;
--weight-semibold: 600;
--weight-bold:     700;
```

#### 行高 `--leading-{level}`

```css
--leading-none:    1;
--leading-tight:   1.25;
--leading-snug:    1.375;
--leading-normal:  1.5;
--leading-relaxed: 1.625;
```

#### 表格行高 `--height-table-row-{size}`

```css
--height-table-row-sm: 36px;
--height-table-row-md: 44px;  /* 基准 */
--height-table-row-lg: 56px;
```

### 能力 3：CSS 变量导出（tokens.css）

**完整文件**：`templates/src/styles/tokens.css`

```css
/* ============================================
 * Vue Theme Skill — 完整设计 Token
 * 由 templates/scripts/generate-tokens.js 自动生成
 * 不要手改，由 generator 维护
 * ============================================ */

:root {
  /* === 主题色 === */
  --color-primary:        hsl(211, 100%, 56%);
  --color-primary-light:  hsl(211, 100%, 76%);
  --color-primary-dark:   hsl(211, 100%, 48%);
  
  /* === 语义色 === */
  --color-success: hsl(152, 69%, 45%);
  --color-warning: hsl(33, 100%, 56%);
  --color-danger:  hsl(0, 84%, 60%);
  --color-info:    hsl(211, 100%, 56%);
  
  /* === 中性色 === */
  --color-bg:           hsl(0, 0%, 98%);
  --color-surface:      hsl(0, 0%, 100%);
  --color-border:       hsl(220, 14%, 96%);
  --color-text:         hsl(220, 13%, 18%);
  --color-text-secondary: hsl(220, 9%, 46%);
  --color-text-tertiary:  hsl(220, 9%, 65%);
  --color-text-inverse:    hsl(0, 0%, 100%);
  
  /* === 间距 === */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  
  /* === 字体 === */
  --font-2xs:  11px;
  --font-xs:   12px;
  --font-sm:   13px;
  --font-base: 14px;
  --font-lg:   16px;
  --font-xl:   18px;
  --font-2xl:  22px;
  --font-3xl:  28px;
  
  /* === 圆角 === */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-full: 999px;
  
  /* === 组件高度 === */
  --height-button-md: 40px;
  --height-input-md:  40px;
  
  /* === 图标 === */
  --icon-md: 20px;
}

/* === 多主题：通过 [data-theme] 切换 === */
[data-theme="green"] {
  --color-primary:       hsl(152, 69%, 45%);
  --color-primary-light: hsl(152, 69%, 65%);
  --color-primary-dark:  hsl(152, 69%, 38%);
}

[data-theme="purple"] {
  --color-primary:       hsl(262, 83%, 58%);
  --color-primary-light: hsl(262, 83%, 75%);
  --color-primary-dark:  hsl(262, 83%, 48%);
}

/* ... 其余主题 ... */
```

## 使用方式

### Step 1：复制 templates 到项目

```bash
cp -r vue-theme-skill/templates/src/styles your-project/src/
```

### Step 2：在 main.ts 导入

```typescript
// src/main.ts
import '@/styles/tokens.css'  // 必须在其他样式之前
import '@/styles/global.css'
```

### Step 3：使用 Token

```vue
<template>
  <button class="primary-btn">提交</button>
</template>

<style scoped>
.primary-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--space-3) var(--space-6);
  height: var(--height-button-md);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
}
.primary-btn:hover {
  background: var(--color-primary-light);
}
.primary-btn:active {
  background: var(--color-primary-dark);
}
</style>
```

### Step 4：运行时切换主题

```typescript
// 切换为绿色主题
document.documentElement.setAttribute('data-theme', 'green')

// 切换为默认蓝色主题
document.documentElement.removeAttribute('data-theme')
```

## 命名对齐表（重要！）

| 类别 | 命名 | 示例 |
|------|------|------|
| 颜色 | `--color-{name}-{50~950}` | `--color-primary-500` |
| 颜色简写 | `--color-{name}` | `--color-primary` |
| 间距 | `--space-{n}` | `--space-4` |
| 字体 | `--font-{size}` | `--font-base` |
| 圆角 | `--radius-{size}` | `--radius-md` |
| 高度 | `--height-{comp}-{size}` | `--height-button-md` |
| 图标 | `--icon-{size}` | `--icon-md` |

**禁止**：
- ❌ `--spacing-xs`（旧命名）
- ❌ `--gap-4`（不统一）
- ❌ `--text-color`（缺类别）
- ❌ `#4a90e2`（裸色值）

## 红线（绝不可违反）

1. ❌ 业务代码不允许出现裸色值（必须用 `var(--color-*)`）
2. ❌ 业务代码不允许出现裸 px（必须用 `var(--space-*)` / `--font-*` 等）
4. ❌ 禁止使用 `calc()` 生成主题值（跨端兼容问题）
5. ❌ 禁止修改 tokens.css 的命名（必须由 generator 生成）
6. ❌ 禁止在组件内定义全局变量
7. ❌ 禁止混用 uniapp / vue 主题（命名必须对齐）

## 文件清单

| 文件 | 作用 |
|------|------|
| `SKILL.md` | 本文档 |
| `README.md` | 快速使用指南 |
| `references/color-scale.md` | 9 级色阶 + HSL 算法说明 |
| `references/size-scale.md` | 尺寸阶梯完整规范 |
| `references/hardcode-replace-rules.md` | 硬编码替换规则（A/B/C/D/E） |
| `templates/src/styles/tokens.css` | 完整设计 Token（默认主题） |
| `templates/src/styles/tokens/{primitive,semantic}.css` | 分层 Token |
| `templates/src/styles/config/theme-config.ts` | TypeScript 主题配置 |
| `templates/scripts/generate-tokens.js` | HSL Token 生成器 |

## 与其他 Skill 的协同

```
vue-generate-skill（骨架）
  └─→ vue-theme-skill（设计 Token，本 Skill）
       └─→ vue-base-skill（业务组件，强依赖本 Skill）
```

- **vue-generate-skill**：vite/tsconfig/pinia/请求层
- **vue-theme-skill**：颜色 / 尺寸 / 圆角 / 阴影（**本 Skill 边界**）
- **vue-base-skill**：base-card / base-button / base-input / base-radio / base-select / base-table