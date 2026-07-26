---
name: uniapp-theme-skill
description: "uni-app 项目主题系统：支持动态生成色阶/尺寸/圆角，三维度主题一键切换换肤"
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
---

# uniapp-theme-skill

uni-app 项目主题系统引擎。

## 定位

**本 skill 为 uni-app 项目创建完整的主题切换系统，不是简单的页面换肤。**

核心能力：在项目中建立基于 CSS 变量的三维度主题系统，支持一键切换主题。

## 三维度主题系统

| 维度 | 内容 | 示例变量 |
|------|------|----------|
| 主题色 | 全局色阶 50-900 | `--primary-500`, `--primary-600` |
| 全局尺寸 | 间距/字号/高度 | `--spacing-md`, `--font-body`, `--height-btn` |
| 圆角 | 有圆角/无圆角状态 | `--radius-none`, `--radius-full` |

## 核心能力

1. **检测主题系统**：检查项目是否已有 CSS 变量主题系统
2. **动态色阶生成**：输入任意 HEX 颜色（如 #6366F1），自动生成 50-900 完整色阶
3. **尺寸阶梯生成**：自动生成字号/间距/高度/圆角阶梯（rpx 单位）
4. **全局统一配置**：一处配置，全局生效（参考 hv-health-miniapp 架构）
5. **预设主题**：内置 7 种主题（cute/minimal/business/fresh/cyber/retro/glass）
6. **一键切换**：通过 `data-theme` 属性切换，无需重新编译
7. **强制统一硬编码**：扫描项目中所有硬编码颜色/尺寸，替换为 CSS 变量
8. **强制改造**：如果项目已有主题系统但不符合规范，强制改造

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

**工作流程**：
1. 用户修改 `_theme-config.scss` 中的主色
2. SCSS 编译时自动生成所有色阶和尺寸
3. 业务代码引用语义变量（如 `$color-primary`）
4. 改配置 → 全局自动更新

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

### CSS 变量清单

| 类别 | 变量 | 说明 |
|------|------|------|
| 色阶 | `--primary-50` ~ `--primary-900` | 主色 9 阶 |
| 色阶 | `--gray-50` ~ `--gray-900` | 灰度 9 阶 |
| 字号 | `--font-xs` ~ `--font-4xl` | 7 档字号 |
| 间距 | `--space-1` ~ `--space-24` | 13 档间距 |
| 圆角 | `--radius-sm/md/lg/xl/full` | 5 档圆角 |
| 高度 | `--height-btn-sm/md/lg` | 按钮高度 |
| 图标 | `--icon-xs/sm/md/lg/xl` | 图标尺寸 |

## 使用场景

### 场景1：项目无主题系统（需要创建）

```
用户：给项目添加主题系统，主色 #6366F1

AI：
  1. 检测到项目没有主题系统
  2. 动态生成 primary 色阶（50-900，基于 #6366F1）
  3. 生成 gray 灰阶、语义色（success/warning/error/info）
  4. 生成尺寸阶梯（字号/间距/高度）
  5. 生成圆角阶梯
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
  3. 识别硬编码并替换为 CSS 变量：
     - 颜色：#ffffff → var(--white) 或 var(--gray-50)
     - 字号：28rpx → var(--font-md)
     - 间距：16rpx → var(--spacing-md)
     - 圆角：10rpx → var(--radius-sm)
  4. 备份原文件 → *.bak
  5. 输出 docs/theme-system-report.md（含替换统计）
```

#### 硬编码替换规则（全部替换，一个不漏）

**核心原则**：项目中所有颜色和尺寸值都必须替换为 CSS 变量，不允许任何裸值。

##### 颜色替换

| 匹配模式 | 替换为 | 备注 |
|----------|--------|------|
| `#fff`, `#ffffff` | `var(--white)` | 纯白 |
| `#000`, `#000000` | `var(--gray-900)` | 纯黑 |
| 项目主色 HEX | `var(--primary-500)` | 主色 |
| `#f5f5f5` | `var(--gray-100)` | 浅灰背景 |
| `#e5e5e5` | `var(--gray-200)` | 边框灰 |
| `#666`, `#666666` | `var(--text-secondary)` | 次要文字 |
| `#999`, `#999999` | `var(--text-tertiary)` | 弱化文字 |
| `#333`, `#333333` | `var(--text-primary)` | 主要文字 |
| `red`, `blue`, `green` | `var(--error)`, `var(--info)`, `var(--success)` | 状态色 |
| 其他 HEX 颜色 | 根据色阶最近值替换 | 如 `#ccc` → `var(--gray-300)` |

##### 尺寸替换（rpx）

| 匹配模式 | 替换为 |
|----------|--------|
| `20rpx` | `var(--font-xs)` |
| `24rpx` | `var(--font-sm)` |
| `26rpx`, `28rpx` | `var(--font-md)` |
| `30rpx`, `32rpx` | `var(--font-lg)` |
| `36rpx` | `var(--font-xl)` |
| `4rpx` | `var(--space-1)` |
| `8rpx` | `var(--space-2)` |
| `12rpx` | `var(--space-3)` |
| `16rpx` | `var(--space-4)` |
| `20rpx` | `var(--space-5)` |
| `24rpx` | `var(--space-6)` |
| `32rpx` | `var(--space-8)` |
| `40rpx` | `var(--space-10)` |
| `48rpx` | `var(--space-12)` |
| `64rpx` | `var(--space-16)` |

##### 圆角替换

| 匹配模式 | 替换为 |
|----------|--------|
| `0rpx`, `0` | `var(--radius-none)` |
| `4rpx` | `var(--radius-sm)` |
| `8rpx` | `var(--radius-sm)` |
| `12rpx` | `var(--radius-md)` |
| `16rpx` | `var(--radius-md)` |
| `20rpx` | `var(--radius-lg)` |
| `24rpx` | `var(--radius-lg)` |
| `999rpx`, `9999rpx` | `var(--radius-full)` |

##### 高度替换

| 匹配模式 | 替换为 |
|----------|--------|
| `56rpx` | `var(--height-btn-sm)` |
| `72rpx` | `var(--height-btn-md)` |
| `88rpx` | `var(--height-btn-lg)` |

##### 通用尺寸替换

| 匹配模式 | 替换为 |
|----------|--------|
| `40rpx` | `var(--size-xs)` |
| `60rpx` | `var(--size-sm)` |
| `80rpx` | `var(--size-md)` |
| `100rpx` | `var(--size-lg)` |
| `64rpx` | `var(--size-avatar-sm)` |
| `120rpx` | `var(--size-img-sm)` |
| `200rpx` | `var(--size-img-md)` |
| `300rpx` | `var(--size-img-lg)` |
| `500rpx` | `var(--height-xl)` |

##### 字号替换

| 匹配模式 | 替换为 |
|----------|--------|
| `24rpx` | `var(--font-xs)` |
| `26rpx` | `var(--font-sm)` |
| `28rpx` | `var(--font-md)` |
| `30rpx` | `var(--font-lg)` |
| `32rpx` | `var(--font-xl)` |

##### 边框替换

| 匹配模式 | 替换为 |
|----------|--------|
| `1rpx` | `var(--border-width)` |

#### 执行步骤

1. 扫描 `.vue`, `.scss`, `.less`, `.css` 文件
2. 使用正则匹配硬编码值
3. 根据映射表替换为 CSS 变量
4. 备份原文件 `.bak`
5. 生成替换报告

### 场景4：切换主题

```
用户：切换到可爱风主题

AI：
  1. 检查主题系统是否存在
  2. 修改 App.vue 或根元素，添加 data-theme="cute"
  3. 或者生成 theme-switcher 组件供用户使用
```

## CSS 变量系统

### 色阶变量

```css
:root {
  /* 主色阶 */
  --primary-50: #FFF5F8;
  --primary-100: #FFEDF3;
  --primary-200: #FFD6E4;
  --primary-300: #FFB6D9;
  --primary-400: #FF8FB1;
  --primary-500: #FF8FB1;  /* 主色 */
  --primary-600: #FF7AA3;
  --primary-700: #FF6B8A;
  --primary-800: #4A3B4A;
  --primary-900: #2D242D;

  /* 灰色阶 */
  --gray-50: #FAFAFA;
  --gray-100: #F5F5F5;
  /* ... */

  /* 语义化变量 */
  --color-primary: var(--primary-500);
  --color-bg: var(--gray-50);
  --color-text: var(--gray-900);
}
```

### 尺寸变量

```css
:root {
  /* 间距 */
  --spacing-xs: 8rpx;
  --spacing-sm: 16rpx;
  --spacing-md: 24rpx;
  --spacing-lg: 32rpx;
  --spacing-xl: 48rpx;

  /* 字号 */
  --font-xs: 22rpx;
  --font-sm: 24rpx;
  --font-md: 28rpx;
  --font-lg: 32rpx;
  --font-xl: 36rpx;

  /* 按钮高度 */
  --height-btn-sm: 56rpx;
  --height-btn-md: 72rpx;
  --height-btn-lg: 88rpx;
}
```

### 圆角变量

```css
:root {
  /* 圆角状态 */
  --radius-none: 0rpx;
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-xl: 32rpx;
  --radius-full: 9999rpx;

  /* 常用组合 */
  --radius-card: var(--radius-lg);
  --radius-btn: var(--radius-full);
  --radius-input: var(--radius-md);
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
      currentTheme: 'cute'  // 切换这个值即可切换主题
    }
  }
}
</script>

<style>
/* 主题定义 */
[data-theme="cute"] {
  --primary-500: #FF8FB1;
  --radius-btn: 999rpx;
}

[data-theme="minimal"] {
  --primary-500: #333333;
  --radius-btn: 8rpx;
}

[data-theme="cyber"] {
  --primary-500: #00F0FF;
  --radius-btn: 4rpx;
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

### 方式3：主题切换组件

本 skill 可以生成一个主题切换器组件：

```vue
<template>
  <picker :value="themes.indexOf(currentTheme)" :range="themes" @change="onThemeChange">
    <view>当前主题：{{ currentTheme }}</view>
  </picker>
</template>
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

# 强制初始化
给项目添加主题系统 --force

# 切换主题
切换到可爱风
换成商务风主题

# 统一维度
统一项目色阶
统一全局尺寸
统一圆角规范
```

## 输出物

### 必需输出

- `src/styles/theme/tokens/_colors.css`：全局色阶 CSS 变量（50-900）
- `src/styles/theme/tokens/_sizes.css`：全局尺寸 CSS 变量
- `src/styles/theme/tokens/_radius.css`：圆角 CSS 变量
- `src/styles/theme/themes.css`：预设主题 + 自定义主题定义
- `src/styles/theme/index.css`：统一入口
- `App.vue`：引入全局主题样式，添加 data-theme

### 动态生成

当用户指定主色（如 `#6366F1`）时：
- 自动生成 `primary-50` ~ `primary-900` 完整色阶
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
