# uniapp-theme-skill

uni-app 项目主题系统引擎：为项目添加三维度主题切换能力。

## 核心能力

给 uni-app 项目创建完整的主题切换系统，使用 CSS 变量实现一键主题切换。

### 三维度主题系统

| 维度 | 内容 | 示例 |
|------|------|------|
| 主题色 | 全局色阶 50-900 | `--primary-500` |
| 全局尺寸 | 间距/字号/高度 | `--spacing-md`, `--font-body` |
| 圆角 | 有圆角/无圆角 | `--radius-none`, `--radius-full` |

## 功能

- **动态色阶生成**：输入任意 HEX 颜色，自动生成 50-900 完整色阶
- **尺寸阶梯生成**：自动生成字号/间距/高度阶梯（rpx 单位）
- **全局统一配置**：一处配置，全局生效（参考 hv-health-miniapp 架构）
- **强制统一硬编码**：扫描并替换所有硬编码颜色/尺寸为 CSS 变量
- **预设主题**：内置 7 种主题一键应用
- **一键切换**：通过 `data-theme` 属性切换，无需重新编译
- **强制改造**：不符合规范时强制改造

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

# 仅统一硬编码（保持现有主题）
统一所有硬编码
```

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
      currentTheme: 'cute'  // 切换这个值即可切换主题
    }
  }
}
</script>

<style>
[data-theme="cute"] {
  --primary-500: #FF8FB1;
  --radius-btn: 999rpx;
}

[data-theme="minimal"] {
  --primary-500: #333333;
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

## 目录说明

```
uniapp-theme-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
├── references/
│   ├── theme-generator.js          # 动态色阶生成器
│   ├── color-scale.md              # 色阶系统说明
│   ├── size-scale.md               # 尺寸系统说明
│   ├── radius-scale.md             # 圆角系统说明
│   └── hardcode-replace-rules.md  # 硬编码替换规则
├── templates/                  # 模板文件（输出到目标项目）
│   ├── vite.config.ts          # Vite 配置示例
│   └── src/
│       ├── main.js            # 入口文件示例
│       ├── styles/
│       │   ├── index.less     # Less 入口
│       │   ├── _functions.scss # SCSS 函数
│       │   ├── config/         # SCSS 配置模板
│       │   │   └── _theme-config.scss
│       │   ├── tokens/        # SCSS Tokens
│       │   │   ├── _primitive.scss
│       │   │   └── _semantic.scss
│       │   └── variables.scss  # SCSS 入口
│       ├── static/
│       │   └── css/
│       │       └── base.css   # CSS 变量模板
│       └── scripts/
│           └── generate-tokens.js  # Node 生成脚本
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
| 主色 | `--primary-50` ~ `--primary-900` | `#eff6ff` ~ `#172554` |
| 灰阶 | `--gray-50` ~ `--gray-900` | `#f9fafb` ~ `#111827` |
| 功能色 | `--success/warning/error/info` | 标准色值 |
| 文字色 | `--text-primary/secondary/tertiary` | 灰阶映射 |
| 背景色 | `--bg-page/card/light` | 灰阶映射 |

### 尺寸变量

| 类别 | 变量 | 示例值 |
|------|------|--------|
| 字号 | `--font-xs` ~ `--font-xl` | `24rpx` ~ `32rpx` |
| 间距 | `--space-1` ~ `--space-35` | `4rpx` ~ `140rpx` |
| 圆角 | `--radius-sm/md/lg/xl/full` | `8rpx` ~ `9999rpx` |
| 按钮高度 | `--height-btn-sm/md/lg` | `56rpx/72rpx/88rpx` |
| 头像尺寸 | `--size-avatar-sm/md/lg` | `64rpx/80rpx/120rpx` |
| 图片尺寸 | `--size-img-sm/md/lg` | `120rpx/200rpx/300rpx` |
| 通用尺寸 | `--size-xs/sm/md/lg` | `40rpx/60rpx/80rpx/100rpx` |
| 边框 | `--border-width` | `1rpx` |

### 语义变量

| 变量 | 说明 |
|------|------|
| `--white` | 纯白 `#ffffff` |
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

扫描并替换项目中的硬编码，技能会自动处理：

#### 颜色替换

| 原始值 | 替换为 |
|--------|--------|
| `#fff`, `#ffffff` | `var(--white)` |
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
