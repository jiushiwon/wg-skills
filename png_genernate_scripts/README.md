# PNG 图标生成脚本集 🖼️

> 一键批量生成项目所需的 PNG 图标，从 SVG 源文件或纯代码路径生成 tabBar 图标、通用图标、分享封面等。

## 目录

- [这是什么？](#这是什么)
- [脚本说明](#脚本说明)
- [安装依赖](#安装依赖)
- [快速开始](#快速开始)
- [SVG 源文件](#svg-源文件)
- [输出规范](#输出规范)
- [常见问题](#常见问题)

---

## 这是什么？

`png_genernate_scripts` 是一套图标自动化生成工具，目标是：**维护一份 SVG 源文件，一键输出项目所需的所有 PNG 图标**。

适合小程序、uniapp、React Native、H5 等需要多尺寸 PNG 图标的场景。避免手动导出、命名混乱、尺寸不一致等问题。

### 核心能力

| 能力 | 说明 |
|------|------|
| **SVG → PNG** | 将 `svgs/` 下的 SVG 批量转换为指定尺寸 PNG |
| **tabBar 图标** | 自动生成默认态 / 选中态 tabBar 图标（81×81px） |
| **通用图标** | 生成 48×48px 页面图标 |
| **分享封面** | 生成 500×400px 分享卡片封面 |
| **自动修复 pages.json** | 扫描 tabBar 配置，自动补全 `iconPath` 和 `selectedIconPath` |
| **智能图标匹配** | 根据 tabBar 文字自动匹配语义图标（支持中英文别名） |

---

## 脚本说明

| 脚本 | 语言 | 用途 | 主要功能 |
|------|------|------|----------|
| `gen-icons.js` | Node.js | 智能图标生成器（推荐） | 扫描项目 → 自动匹配图标 → 生成 tabBar / 分享图 → 修复 `pages.json` |
| `generate-all-icons.js` | Node.js | 批量 SVG → PNG | 批量转换 `svgs/` 和 `svgs/tabbar/` 下所有 SVG |
| `generate-all-icons.py` | Python | 批量 SVG → PNG | Python 版，使用 `svglib` + `reportlab` |
| `svg-to-png.py` | Python | SVG 转 PNG 工具 | 指定尺寸 / 颜色，单文件转换 |
| `gen-extra-images.js` | Node.js | 扩展图片生成 | 生成其他项目所需图片 |
| `gen-growth-icons.py` | Python | 成长类图标生成 | 特定主题图标生成 |
| `generate-basic-icons.py` | Python | 基础图标生成 | 常用基础图标快速生成 |
| `generate-icons.py` | Python | 图标生成 | 通用图标生成脚本 |
| `generate-theme-icons.py` | Python | 主题图标生成 | 按主题色生成图标 |

### 推荐用法

```bash
# 智能生成全部图标（推荐）
node png_genernate_scripts/gen-icons.js

# 预览需要生成哪些文件（不实际生成）
node png_genernate_scripts/gen-icons.js --dry-run

# 清理旧图标后重新生成
node png_genernate_scripts/gen-icons.js --clean
```

### 批量转换 SVG

```bash
# Node.js + sharp
node png_genernate_scripts/generate-all-icons.js

# Python + svglib/reportlab
python png_genernate_scripts/generate-all-icons.py
```

### 单独转换 SVG → PNG

```bash
# Python 版，默认 48x48 白色
python png_genernate_scripts/svg-to-png.py

# 指定尺寸和颜色
python png_genernate_scripts/svg-to-png.py --size 64 --color '#7BA59D'
```

---

## 安装依赖

### Node.js 依赖

```bash
cd png_genernate_scripts
npm install
```

依赖包：`sharp`

### Python 依赖

```bash
pip install svglib reportlab
```

---

## 快速开始

### 1. 准备 SVG 源文件

将 SVG 文件放入对应目录：

```text
png_genernate_scripts/
└── svgs/
    ├── ai.svg
    ├── assessment.svg
    ├── checkin.svg
    ├── data.svg
    ├── diet.svg
    ├── eyes.svg
    ├── lumbar.svg
    ├── quiz.svg
    ├── rank.svg
    ├── share-default.svg
    ├── sleep.svg
    ├── sport.svg
    ├── weight.svg
    ├── health-profile.svg
    └── tabbar/
        ├── home.svg
        ├── home-active.svg
        ├── dashboard.svg
        ├── dashboard-active.svg
        ├── profile.svg
        └── profile-active.svg
```

### 2. 生成图标

```bash
# 方式一：智能生成（推荐）
node png_genernate_scripts/gen-icons.js

# 方式二：批量转换
node png_genernate_scripts/generate-all-icons.js
```

### 3. 查看输出

```text
frontend/src/static/
├── tabbar/
│   ├── home.png
│   ├── home-active.png
│   ├── dashboard.png
│   ├── dashboard-active.png
│   ├── profile.png
│   └── profile-active.png
├── images/
│   └── share-default.png
└── icons/
    ├── icon-ai.png
    ├── icon-assessment.png
    └── ...
```

---

## SVG 源文件

### 位置

- 通用图标：`png_genernate_scripts/svgs/*.svg`
- tabBar 图标：`png_genernate_scripts/svgs/tabbar/*.svg`
- 分享封面：`png_genernate_scripts/svgs/share-default.svg`

### SVG 规范

- 使用 `currentColor` 作为描边/填充颜色，方便脚本替换为主题色
- 推荐 `viewBox="0 0 24 24"`
- 推荐描边宽度 `1.5-2px`，圆角端点
- 纯图标，无文字，无复杂渐变

示例 SVG：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <path d="M9 22V12h6v10"/>
</svg>
```

---

## 输出规范

| 类型 | 尺寸 | 输出路径 | 命名示例 |
|------|------|----------|----------|
| tabBar 默认态 | 81×81 | `src/static/tabbar/{name}.png` | `home.png` |
| tabBar 选中态 | 81×81 | `src/static/tabbar/{name}-active.png` | `home-active.png` |
| 通用图标 | 48×48 | `src/static/icons/icon-{name}.png` | `icon-ai.png` |
| 分享封面 | 500×400 | `src/static/images/share-default.png` | `share-default.png` |

### 主题色

默认主题色可在脚本中配置：

```javascript
const THEME = {
  primary: '#7BA59D',
  tabDefault: '#8C8C8C',
  tabSelected: '#7BA59D',
  bgPage: '#F5F7F4',
};
```

---

## 常见问题

**Q: 为什么生成的图标有白边或模糊？**

A: 检查 SVG 的 `viewBox` 是否规范，推荐使用 `0 0 24 24`。输出尺寸应为标准像素值（如 48、81、500）。

**Q: 可以不依赖外部 SVG，直接用代码生成图标吗？**

A: 可以。`gen-icons.js` 内置了常见图标的路径库，支持通过 tabBar 文字自动匹配图标。

**Q: 我不想修改 pages.json 怎么办？**

A: 使用 `generate-all-icons.js` 或 `svg-to-png.py`，它们只转换 SVG，不修改项目配置。

**Q: 如何添加新的图标尺寸？**

A: 修改对应脚本中的 `width` / `height` 参数，或新增一个转换任务。

---

## 贡献

欢迎补充：

- 新的 SVG 源文件
- 新的图标尺寸规格
- 新的生成脚本
- 更智能的图标匹配规则

---

## 许可证

MIT License
