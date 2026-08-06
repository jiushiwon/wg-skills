# uniapp-theme-skill

uni-app 项目主题系统引擎：为项目添加多主题切换能力，支持色阶/尺寸/圆角/硬编码统一治理。

## 核心能力

给 uni-app 项目创建完整的主题切换系统，使用 CSS 变量实现一键主题切换。

### 三大核心

| 维度 | 内容 | 示例 |
|------|------|------|
| 主题色 | 多主题完整色阶 50-950 + primary/secondary/tertiary | `--primary-500`, `--secondary-500` |
| 全局尺寸 | 字号/间距/高度/圆角/图标（静态 rpx，无 calc） | `--font-2xs`, `--space-4`, `--height-btn-md`, `--radius-sm`, `--icon-md` |
| 全局硬编码替换 | 颜色 + 尺寸，按 CSS 属性上下文分类（A/B/C/D/E） | `#fff` → `var(--text-inverse)`, `16rpx` → `var(--space-4)` |

### 边界声明

✅ 负责：主题色阶、尺寸阶梯、硬编码替换
❌ 不负责：Dark Mode、Z-Index、Motion、JS Bridge、CLI、TS 类型、Figma、A11y

## 触发词清单

```
# 主题生成
添加主题系统
给项目添加主题系统，主色 #6366F1
动态生成色阶
自定义主题色

# 预设主题
给项目添加 cute 主题
添加商务风主题
添加主题切换功能

# 多主题
给项目添加多主题支持，主色 #14b8a6 辅助色 #6366f1
添加 primary 和 secondary 色阶

# 强制统一
统一所有硬编码
统一项目色阶
统一全局尺寸
统一圆角规范
强制统一

# 主题切换
切换到可爱风
换成商务风主题
换主题
```

## 使用示例

```
# 完整流程：生成主题 + 统一硬编码
给项目添加主题系统，主色 #2563EB，统一所有硬编码

# 简单换色
给项目添加 cute 主题

# 多主题
给项目添加多主题支持，主色 #14b8a6 辅助色 #6366f1

# 仅统一硬编码（保持现有主题）
统一所有硬编码
```

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

## 主题切换示例

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

## 目录说明

```
uniapp-theme-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
├── references/
│   ├── theme-generator.js        # HSL 色阶生成器（多主题支持）
│   ├── color-scale.md            # 色阶系统说明（多主题 50-950）
│   ├── size-scale.md             # 尺寸系统说明（统一命名）
│   ├── radius-scale.md           # 圆角系统说明
│   └── hardcode-replace-rules.md # 硬编码替换规则（按上下文分类 A/B/C/D/E）
├── templates/
│   ├── vite.config.ts          # Vite 配置示例
│   └── src/
│       ├── main.js            # 入口文件示例
│       ├── styles/
│       │   ├── index.less     # Less 入口
│       │   ├── _functions.scss # SCSS 函数（HSL 工具 + 静态 rpx）
│       │   ├── config/
│       │   │   └── _theme-config.scss  # 主题配置（多主题）
│       │   ├── tokens/
│       │   │   ├── _primitive.scss     # 基础变量（多主题完整色阶 50-950）
│       │   │   └── _semantic.scss      # 语义变量
│       │   └── variables.scss         # SCSS 统一入口（多主题 CSS 变量导出）
│       ├── static/
│       │   └── css/
│       │       └── base.css   # CSS 变量模板（多主题完整覆盖 + APP fallback）
│       └── scripts/
│           └── generate-tokens.js  # Node 生成脚本（新命名 + HSL + 多主题）
```

## 快速开始

### 方式1：SCSS 项目（推荐）

1. 复制 `templates/src/styles/` 到项目
2. 修改 `config/_theme-config.scss` 中的主色
3. 配置 vite.config.ts 自动注入

### 方式2：Less 项目

1. 复制 `templates/src/static/css/base.css`
2. 在 `main.js` 中引入

### 方式3：动态生成

```bash
node scripts/generate-tokens.js #6366F1
```

## CSS 变量清单

### 颜色变量

| 类别 | 变量 | 示例值 |
|------|------|--------|
| 主色 | `--primary-50` ~ `--primary-950` | `#f0fdfa` ~ `#042f2e` |
| 灰阶 | `--gray-50` ~ `--gray-950` | `#fafafa` ~ `#0a0a0a` |
| 功能色 | `--success/warning/error/info` | 标准色值 |
| 语义颜色 | `--color-primary/secondary/tertiary` | 主色阶变量引用 |
| 文字色 | `--text-primary/secondary/tertiary` | 灰阶映射 |
| 背景色 | `--bg-page/card/light` | 灰阶映射 |

### 尺寸变量

| 类别 | 变量 | 示例值 |
|------|------|--------|
| 字号 | `--font-2xs` ~ `--font-3xl` | `20rpx` ~ `48rpx` |
| 间距 | `--space-0` ~ `--space-24` | `0rpx` ~ `96rpx` |
| 圆角 | `--radius-none/sm/md/lg/xl/full` | `0rpx` ~ `9999rpx` |
| 按钮高度 | `--height-btn-sm/md/lg` | `56rpx/72rpx/88rpx` |
| 图标尺寸 | `--icon-xs/sm/md/lg/xl` | `24rpx` ~ `96rpx` |

### 语义变量

| 变量 | 说明 |
|------|------|
| `--color-primary` | 主色语义（指向 `--primary-500`） |
| `--color-secondary` | 第二主题色语义（指向 `--secondary-500`） |
| `--color-tertiary` | 第三主题色语义（指向 `--tertiary-500`） |
| `--color-bg` | 背景色语义 |
| `--color-text` | 文字色语义 |
| `--color-text-inverse` | 反色文字 |
| `--radius-btn` | 按钮圆角（默认 full） |
| `--radius-input` | 输入框圆角（默认 md） |
| `--radius-card` | 卡片圆角（默认 lg） |

## 与 ui-template-builder-skill 的关系

```
ui-template-builder-skill  →  生成页面骨架
uniapp-theme-skill        →  添加主题系统
```

## 完整换主题流程

### 第1步：修改主色

修改目标项目的 `src/static/css/base.css`：

```css
/* 蓝色主题 */
--primary-500: #2563EB;
--primary-600: #1D4ED8;
```

### 第2步：修改 pages.json（tabBar 选中色）

```json
"tabBar": {
  "selectedColor": "#2563EB"
}
```

### 第3步：替换硬编码（颜色+尺寸）

扫描并替换项目中的硬编码，技能会自动处理。

#### 颜色替换

| 原始值 | 替换为 |
|--------|--------|
| `#fff`, `#ffffff` | `var(--text-inverse)` |
| `#000`, `#111` | `var(--gray-900)` |
| `#f5f5f5` | `var(--gray-100)` |
| `#e5e5e5` | `var(--gray-200)` |

#### 尺寸替换（rpx）

| 原始值 | 替换为 |
|--------|--------|
| `8rpx`, `4rpx` | `var(--space-2)`, `var(--space-1)` |
| `12rpx` | `var(--space-3)` |
| `16rpx` | `var(--space-4)` |
| `24rpx` | `var(--space-6)` |
| `32rpx` | `var(--space-8)` |
| `40rpx` | `var(--space-10)` |
| `80rpx` | `var(--size-md)` |
| `200rpx` | `var(--size-img-md)` |
| `300rpx` | `var(--size-img-lg)` |
| `500rpx` | `var(--height-xl)` |

#### 字号替换

| 原始值 | 替换为 |
|--------|--------|
| `24rpx` | `var(--font-xs)` |
| `26rpx` | `var(--font-sm)` |
| `28rpx` | `var(--font-md)` |
| `30rpx` | `var(--font-lg)` |
| `32rpx` | `var(--font-xl)` |

#### 圆角替换

| 原始值 | 替换为 |
|--------|--------|
| `8rpx`, `4rpx` | `var(--radius-sm)` |
| `16rpx` | `var(--radius-md)` |
| `24rpx` | `var(--radius-lg)` |
| `32rpx` | `var(--radius-xl)` |
| `9999rpx` | `var(--radius-full)` |

### 第4步：生成主题图标（配合 image-forge-skill）

```bash
# 安装依赖（首次）
cd "$SKILL_DIR/image-forge-skill" && npm install

# 生成选中状态图标（蓝色）
node image-forge.js config.json
```

配置示例：
```json
{
  "outDir": "项目/src/static/tabbar",
  "size": 40,
  "color": "#2563EB",
  "icons": [
    { "name": "home-active.png", "path": "M3 12l2-2m0..." }
  ]
}
```

## 项目结构示例

```
项目/src/
├── App.vue                      # 引入主题
├── static/
│   └── css/
│       └── base.css            # CSS 变量定义
├── styles/
│   └── index.less             # Less 别名 + 公共样式
└── pages.json                  # tabBar 配置
```

## 配合技能

| 技能 | 用途 |
|------|------|
| image-forge-skill | 生成主题色图标（tabBar、按钮等） |
| frontend-style-harmonizer | 扫描并替换硬编码 |

## 注意事项

- 本 skill 只创建主题系统，不改业务逻辑
- 使用 CSS 变量（var()）而非硬编码值
- uni-app 项目必须使用 rpx 单位
- 推荐使用 data-theme 属性切换主题
- pages.json 中的 tabBar 选中色需手动修改
- 所有 CSS 变量带 fallback：`var(--x, fallback)`，确保 APP 端兼容
- 所有 rpx 值为静态，禁止 calc()，确保微信小程序兼容
- 命名体系统一：`--space-{n}` / `--font-{size}` / `--height-{comp}-{size}` / `--icon-{size}`