---
name: uniapp-theme-skill
description: "uni-app 项目主题系统：支持多主题色阶/尺寸阶梯/圆角/全局硬编码替换，三维度主题一键切换换肤"
argument-hint: "[主色 HEX] [--init] [目标项目路径]"
user-invocable: true
triggers:
  - "添加主题系统"
  - "主题切换"
  - "换主题"
  - "切换主题"
  - "统一色阶"
  - "统一尺寸"
  - "统一圆角"
  - "统一硬编码"
  - "去硬编码"
  - "给项目添加主题"
  - "动态生成色阶"
  - "自定义主题色"
  - "生成.*色阶"
  - "主色.*#"
  - "uniapp.*主题"
  - "data-theme"
  - "强制统一"
  - "多主题"
  - "添加多主题"
  - "primary.*secondary.*tertiary"
  - "添加二级主题"
  - "添加三级主题"
  - "添加 secondary 主题"
  - "添加 tertiary 主题"
  - "添加辅助色"
  - "添加第三主题色"
  - "secondary.*色阶"
  - "tertiary.*色阶"
  - "多主题色阶"
  - "生成 secondary"
  - "生成 tertiary"
  - "辅助色.*#"
  - "第三主题色.*#"
---

# uniapp-theme-skill

uni-app 项目主题系统引擎。

## 定位

**本 skill 为 uni-app 项目创建完整的主题切换系统，不是简单的页面换肤。**

核心能力：在项目中建立基于 CSS 变量的三维度主题系统，支持一键切换主题。

## 三大核心能力

| 维度 | 内容 | 示例变量 |
|------|------|----------|
| 主题色 | 多主题完整色阶 50-950 | `--primary-500`, `--secondary-500`, `--tertiary-500` |
| 全局尺寸 | 字号/间距/高度/圆角/图标（静态 rpx，无 calc） | `--font-2xs`, `--space-4`, `--height-btn-md`, `--radius-sm`, `--icon-md` |
| 全局硬编码替换 | 颜色 + 尺寸，按 CSS 属性上下文分类（A/B/C/D/E） | `#fff` → `var(--text-inverse)`, `16rpx` → `var(--space-4)` |

## 边界声明

### ✅ 本 skill 负责

1. 主题色阶生成与切换系统（含多主题 primary/secondary/tertiary）
2. 尺寸阶梯系统（字号/间距/高度/圆角/图标）
3. 全局硬编码替换（颜色 + 尺寸，按 CSS 属性上下文分类）

### ❌ 本 skill 不负责

| 能力 | 状态 |
|------|------|
| Dark Mode 暗色模式 | ❌ 不做 |
| Z-Index 层级系统 | ❌ 不做 |
| Motion / Transition Token | ❌ 不做 |
| JS Bridge / useTheme() | ❌ 不做 |
| CLI 工具 | ❌ 不做 |
| TypeScript 类型定义 | ❌ 不做 |
| Figma / Style Dictionary 对接 | ❌ 不做 |
| A11y 对比度校验 | ❌ 不做 |

## 多主题子系统

支持 **primary / secondary / tertiary / quaternary / quinary** 五级主题色阶，逻辑完全一致，命名统一。

```css
:root {
  --primary-50: #f0fdfa;
  --primary-500: #14b8a6;
  --secondary-500: #6366f1;
  --tertiary-500: #f59e0b;
}
```

### 预设主题（8 套完整）

| 主题 | 主色 | 风格 | 适用场景 |
|------|------|------|----------|
| cute | #FF8FB1 | 胶囊 | 女性向、宠物 |
| business | #2563EB | 小圆角 | 金融、企业 |
| fresh | #34D399 | 中圆角 | 健康、生活 |
| cyber | #00F0FF | 直角 | 科技、游戏 |
| retro | #D97706 | 小圆角 | 文创、手账 |
| glass | #8B5CF6 | 中圆角 | 音乐、社交 |
| minimal | #333333 | 小圆角 | 工具、效率 |
| warm | #F97316 | 中圆角 | 美食、户外 |

## 核心能力

1. **检测主题系统**：检查项目是否已有 CSS 变量主题系统
2. **动态色阶生成**：输入任意 HEX 颜色（如 #6366F1），自动生成 50-950 完整色阶（HSL 算法）
3. **尺寸阶梯生成**：自动生成字号/间距/高度/圆角/图标阶梯（静态 rpx，无 calc）
4. **全局统一配置**：一处配置，全局生效
5. **多主题支持**：primary/secondary/tertiary/quaternary/quinary 五级色阶
6. **预设主题**：内置 8 种主题（cute/business/fresh/cyber/retro/glass/minimal/warm）
7. **一键切换**：通过 `data-theme` 属性切换，无需重新编译
8. **强制统一硬编码**：扫描项目中所有硬编码颜色/尺寸，按 CSS 属性上下文分类替换为 CSS 变量
9. **强制改造**：如果项目已有主题系统但不符合规范，强制改造

## 统一命名体系

所有变量使用以下命名规范，全项目对齐：

| 维度 | 变量格式 | 示例 |
|------|----------|------|
| 间距 | `--space-{n}` | `--space-1` (4rpx), `--space-4` (16rpx) |
| 字号 | `--font-{size}` | `--font-2xs` (20rpx), `--font-md` (28rpx) |
| 高度 | `--height-{comp}-{size}` | `--height-btn-md` (72rpx) |
| 圆角 | `--radius-{size}` | `--radius-sm` (8rpx), `--radius-full` (9999rpx) |
| 图标 | `--icon-{size}` | `--icon-xs` (24rpx), `--icon-md` (48rpx) |
| 颜色 | `--{color}-{step}` | `--primary-500`, `--gray-900` |
| 语义颜色 | `--color-{semantic}` | `--color-primary`, `--color-bg` |
| 文字颜色 | `--text-{level}` | `--text-primary`, `--text-secondary` |
| 背景颜色 | `--bg-{level}` | `--bg-page`, `--bg-card` |
| 边框颜色 | `--border-{level}` | `--border`, `--border-light` |

## 架构说明

### 完整架构（推荐 SCSS 项目）

```
项目/
└── src/
    └── styles/
        ├── config/
        │   └── _theme-config.scss    # 唯一配置（用户只改这里）
        ├── tokens/
        │   ├── _primitive.scss       # 自动生成的基础变量
        │   └── _semantic.scss       # 语义化变量（业务代码引用）
        ├── functions/
        │   └── _generators.scss      # 色阶/尺寸生成函数
        └── variables.scss            # 统一入口
```

### 轻量架构（Less/纯 CSS 项目）

```
项目/
└── src/
    └── static/
        └── css/
            └── base.css              # CSS 变量（手动维护）
```

或使用生成脚本：

```
项目/
└── scripts/
    └── generate-tokens.js           # Node 脚本动态生成
```

运行 `node generate-tokens.js #6366F1` 自动生成 CSS 变量文件。

## 使用场景

### 场景1：项目无主题系统（需要创建）

```
用户：给项目添加主题系统，主色 #6366F1

AI：
  1. 检测到项目没有主题系统
  2. 动态生成 primary 色阶（50-950，基于 #6366F1，HSL 算法）
  3. 生成 gray 灰阶、语义色（success/warning/error/info）
  4. 生成 secondary/tertiary 色阶（如需多主题）
  5. 生成尺寸阶梯（字号/间距/高度/圆角/图标，静态 rpx）
  6. 创建 src/styles/theme/tokens/_colors.css
  7. 创建 src/styles/theme/tokens/_sizes.css
  8. 创建 src/styles/theme/tokens/_radius.css
  9. 创建 src/styles/theme/themes.css（预设主题 + 自定义主题）
  10. 在 App.vue 中引入全局主题样式
  11. 输出 docs/theme-system-report.md
```

### 场景1b：使用预设主题

```
用户：给项目添加 cute 主题

AI：
  1. 使用预设 cute 主题配置
  2. 生成完整的 CSS 变量系统
  3. 其他步骤同上
```

### 场景2：项目有主题系统但不符合规范（强制改造）

```
用户：给项目添加主题系统 --force

AI：
  1. 检测到项目有主题系统但不符合本 skill 规范
  2. 备份现有文件 → *.bak
  3. 强制替换为 skill 定义的 CSS 变量系统
  4. 输出 docs/theme-system-report.md（含强制改造说明）
```

### 场景3：强制统一硬编码（核心能力）

```
用户：给项目添加主题系统，主色 #6366F1，并统一所有硬编码

AI：
  1. 动态生成主题系统（色阶/尺寸/圆角）
  2. 扫描项目中所有 .vue/.scss/.less/.css 文件
  3. 识别硬编码并替换为 CSS 变量（按上下文分类）：
     - A 类（font-size/line-height）：20rpx → var(--font-2xs, 20rpx)
     - B 类（padding/margin/gap）：16rpx → var(--space-4, 16rpx)
     - C 类（width/height）：72rpx → var(--height-btn-md, 72rpx)
     - D 类（border-radius）：8rpx → var(--radius-sm, 8rpx)
     - E 类（px 遗留）：8px → var(--space-2, 8rpx)
  4. 备份原文件 → *.bak
  5. 输出 docs/theme-system-report.md（含替换统计）
```

### 场景4：切换主题

```
用户：切换到可爱风主题

AI：
  1. 检查主题系统是否存在
  2. 修改 App.vue 或根元素，添加 data-theme="cute"
  3. 或者生成 theme-switcher 组件供用户使用
```

## 硬编码替换规则（按上下文分类）

### 核心原则

所有硬编码必须替换为 CSS 变量，不允许任何裸值。替换时根据 CSS 属性上下文分类匹配，确保语义正确。

### A 类：font-size / line-height 上下文

| 原始值 | 替换为 |
|--------|--------|
| `20rpx` | `var(--font-2xs, 20rpx)` |
| `22rpx` | `var(--font-2xs, 20rpx)` |
| `24rpx` | `var(--font-xs, 24rpx)` |
| `26rpx` | `var(--font-sm, 26rpx)` |
| `28rpx` | `var(--font-md, 28rpx)` |
| `30rpx` | `var(--font-lg, 30rpx)` |
| `32rpx` | `var(--font-xl, 32rpx)` |
| `34rpx` | `var(--font-xl, 32rpx)` |
| `36rpx` | `var(--font-xl, 32rpx)` |

### B 类：padding / margin / gap 上下文

| 原始值 | 替换为 |
|--------|--------|
| `0rpx`, `0` | `var(--space-0, 0rpx)` |
| `2rpx` | `var(--space-1, 2rpx)` |
| `4rpx` | `var(--space-1, 4rpx)` |
| `6rpx` | `var(--space-2, 6rpx)` |
| `8rpx` | `var(--space-2, 8rpx)` |
| `10rpx` | `var(--space-3, 10rpx)` |
| `12rpx` | `var(--space-3, 12rpx)` |
| `14rpx` | `var(--space-4, 14rpx)` |
| `16rpx` | `var(--space-4, 16rpx)` |
| `18rpx` | `var(--space-5, 18rpx)` |
| `20rpx` | `var(--space-5, 20rpx)` |
| `22rpx` | `var(--space-6, 22rpx)` |
| `24rpx` | `var(--space-6, 24rpx)` |
| `28rpx` | `var(--space-7, 28rpx)` |
| `32rpx` | `var(--space-8, 32rpx)` |
| `40rpx` | `var(--space-10, 40rpx)` |
| `48rpx` | `var(--space-12, 48rpx)` |
| `56rpx` | `var(--space-14, 56rpx)` |
| `64rpx` | `var(--space-16, 64rpx)` |

### C 类：width / height 上下文

| 原始值 | 替换为 | 说明 |
|--------|--------|------|
| `44rpx` | `var(--height-btn-sm, 44rpx)` | 按钮小 |
| `56rpx` | `var(--height-btn-sm, 56rpx)` | 按钮小 |
| `60rpx` | `var(--height-btn-md, 60rpx)` | 按钮中 |
| `72rpx` | `var(--height-btn-md, 72rpx)` | 按钮中 |
| `80rpx` | `var(--height-btn-lg, 80rpx)` | 按钮大 |
| `88rpx` | `var(--height-btn-lg, 88rpx)` | 按钮大 |
| `40rpx` | `var(--icon-xs, 40rpx)` | 图标 |
| `48rpx` | `var(--icon-md, 48rpx)` | 图标 |
| `56rpx` | `var(--icon-lg, 56rpx)` | 图标 |
| `64rpx` | `var(--icon-lg, 64rpx)` | 图标 |
| `72rpx` | `var(--icon-lg, 72rpx)` | 图标 |
| `96rpx` | `var(--icon-xl, 96rpx)` | 图标 |

### D 类：border-radius 上下文

| 原始值 | 替换为 |
|--------|--------|
| `0`, `0rpx` | `var(--radius-none, 0rpx)` |
| `4rpx` | `var(--radius-sm, 4rpx)` |
| `6rpx` | `var(--radius-sm, 6rpx)` |
| `8rpx` | `var(--radius-sm, 8rpx)` |
| `10rpx` | `var(--radius-md, 10rpx)` |
| `12rpx` | `var(--radius-md, 12rpx)` |
| `14rpx` | `var(--radius-md, 14rpx)` |
| `16rpx` | `var(--radius-md, 16rpx)` |
| `20rpx` | `var(--radius-lg, 20rpx)` |
| `24rpx` | `var(--radius-lg, 24rpx)` |
| `28rpx` | `var(--radius-xl, 28rpx)` |
| `32rpx` | `var(--radius-xl, 32rpx)` |
| `999rpx`, `9999rpx` | `var(--radius-full, 9999rpx)` |

### E 类：px 单位（遗留兼容）

| 原始值 | 替换为 |
|--------|--------|
| `8px` | `var(--space-2, 8rpx)` |
| `12px` | `var(--space-3, 12rpx)` |
| `16px` | `var(--space-4, 16rpx)` |

## CSS 变量系统

### 色阶变量

```css
:root {
  /* 主色阶 50-950 */
  --primary-50: #f0fdfa;
  --primary-100: #ccfbf1;
  --primary-200: #99f6e4;
  --primary-300: #5eead4;
  --primary-400: #2dd4bf;
  --primary-500: #14b8a6;
  --primary-600: #0d9488;
  --primary-700: #0f766e;
  --primary-800: #115e59;
  --primary-900: #134e4a;
  --primary-950: #042f2e;

  /* 灰色阶 50-950 */
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #e5e5e5;
  --gray-300: #d4d4d4;
  --gray-400: #a3a3a3;
  --gray-500: #737373;
  --gray-600: #525252;
  --gray-700: #404040;
  --gray-800: #262626;
  --gray-900: #171717;
  --gray-950: #0a0a0a;

  /* 语义化变量 */
  --color-primary: var(--primary-500);
  --color-secondary: var(--secondary-500);
  --color-tertiary: var(--tertiary-500);
  --color-bg: var(--gray-50);
  --color-text: var(--gray-900);
  --color-text-inverse: var(--gray-50);
}
```

### 尺寸变量

```css
:root {
  /* 字号 */
  --font-2xs: 20rpx;
  --font-xs: 24rpx;
  --font-sm: 26rpx;
  --font-md: 28rpx;
  --font-lg: 30rpx;
  --font-xl: 32rpx;
  --font-2xl: 40rpx;
  --font-3xl: 48rpx;

  /* 间距 */
  --space-0: 0rpx;
  --space-1: 4rpx;
  --space-2: 8rpx;
  --space-3: 12rpx;
  --space-4: 16rpx;
  --space-5: 20rpx;
  --space-6: 24rpx;
  --space-8: 32rpx;
  --space-10: 40rpx;
  --space-12: 48rpx;
  --space-16: 64rpx;
  --space-20: 80rpx;
  --space-24: 96rpx;

  /* 圆角 */
  --radius-none: 0rpx;
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-xl: 32rpx;
  --radius-full: 9999rpx;

  /* 按钮高度 */
  --height-btn-sm: 56rpx;
  --height-btn-md: 72rpx;
  --height-btn-lg: 88rpx;

  /* 图标尺寸 */
  --icon-xs: 24rpx;
  --icon-sm: 36rpx;
  --icon-md: 48rpx;
  --icon-lg: 72rpx;
  --icon-xl: 96rpx;
}
```

## 主题切换机制

### 方式1：data-theme 属性切换（推荐）

```vue
<!-- App.vue -->
<template>
  <view :data-theme="currentTheme">
    <router-view />
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTheme: 'cute'
    }
  }
}
</script>

<style>
[data-theme="cute"] {
  --primary-500: #FF8FB1;
  --radius-btn: 9999rpx;
}

[data-theme="business"] {
  --primary-500: #2563EB;
  --radius-btn: 8rpx;
}
</style>
```

### 方式2：class 切换

```vue
<view class="theme-cute">
  <!-- 内容 -->
</view>

<style>
.theme-cute {
  --primary-500: #FF8FB1;
}
</style>
```

## 预设主题

| 主题 | 主色 | 圆角风格 | 适用场景 |
|------|------|----------|----------|
| cute | #FF8FB1 | 胶囊 | 女性向、宠物 |
| minimal | #333333 | 小圆角 | 工具、效率 |
| business | #2563EB | 小圆角 | 金融、企业 |
| fresh | #34D399 | 中圆角 | 健康、生活 |
| cyber | #00F0FF | 直角 | 科技、游戏 |
| retro | #D97706 | 小圆角 | 文创、手账 |
| glass | #8B5CF6 | 中圆角 | 音乐、社交 |
| warm | #F97316 | 中圆角 | 美食、户外 |

## 触发示例

```
# 动态生成主题（输入任意颜色）
给项目添加主题系统，主色 #6366F1
动态生成色阶 #FF6B6B
生成主题色阶 #34D399

# 使用预设主题
给项目添加 cute 主题
添加商务风主题系统
添加主题切换功能

# 多主题
给项目添加多主题支持，主色 #14b8a6 辅助色 #6366f1
添加 primary 和 secondary 色阶

# 强制初始化
给项目添加主题系统 --force

# 切换主题
切换到可爱风
换成商务风主题

# 统一维度
统一项目色阶
统一全局尺寸
统一圆角规范
统一所有硬编码
```

## 输出物

### 必需输出

- `src/styles/theme/tokens/_colors.css`：全局色阶 CSS 变量（50-950）
- `src/styles/theme/tokens/_sizes.css`：全局尺寸 CSS 变量
- `src/styles/theme/tokens/_radius.css`：圆角 CSS 变量
- `src/styles/theme/themes.css`：预设主题 + 自定义主题定义
- `src/styles/theme/index.css`：统一入口
- `App.vue`：引入全局主题样式，添加 data-theme

### 动态生成

当用户指定主色（如 `#6366F1`）时：
- 自动生成 `primary-50` ~ `primary-950` 完整色阶（HSL 算法）
- 自动生成对应的语义化变量
- 生成自定义主题配置到 themes.css

### 可选输出

- `components/ThemeSwitcher/`：主题切换组件

### 备份文件

- 被替换的原样式文件 → *.bak

### 报告

- `docs/theme-system-report.md`：主题系统创建/改造报告

## 回滚方式

```bash
# 回滚主题系统
mv src/styles/theme/tokens/_colors.css.bak src/styles/theme/tokens/_colors.css
# ... 其他 bak 文件

# 删除主题系统
rm -rf src/styles/theme/

# 恢复 App.vue
mv App.vue.bak App.vue
```

## 与 ui-template-builder-skill 的关系

| skill | 关系 |
|---|---|
| `ui-template-builder-skill` | 上游：生成页面骨架，本 skill 负责主题系统 |
| `frontend-style-harmonizer-skill` | 平行：样式一致性治理，本 skill 负责主题切换 |

## 约束红线

- 不修改业务逻辑（props、data、methods、生命周期）
- 不初始化项目，不生成新页面骨架
- 使用 CSS 变量（var()）而非硬编码值
- uni-app 项目必须使用 rpx 单位
- 默认使用 data-theme 属性切换主题
- 所有 rpx 值为静态，禁止 calc()
- 所有 CSS 变量带 fallback：`var(--x, fallback)`