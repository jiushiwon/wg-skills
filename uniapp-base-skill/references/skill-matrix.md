# uniapp-base-skill 技能矩阵

> 本文件定义 `uniapp-base-skill` 在技能矩阵中的定位与协作流程。
> 任何通过本技能生成页面的场景，默认遵循以下矩阵关系。

## 核心定位

`uniapp-base-skill` 不是孤立生成页面的工具，而是 **uniapp 技能矩阵的核心入口**。它负责：

- 基于 `base-card` 生成页面骨架
- 定义组件参数组合方式
- 触发并串联下游技能完成真实可用页面

## 配套技能

| 配套技能 | 职责 | 协作方式 | 文档 |
|---------|------|---------|------|
| [uniapp-theme-skill](../../uniapp-theme-skill/) | 主题变量系统 | 生成代码时必须使用 `var(--*)` 变量，禁止写死色值/尺寸 | 强制规范 §1 |
| [uniapp-style-skill](../../uniapp-style-skill/) | 设计系统与组件规范 | 生成后审查 Typography、Token、布局、动画、设计审计 | 生成后调用 |
| [frontend-style-harmonizer-skill](../../frontend-style-harmonizer-skill/) | 样式一致性治理 | 生成后审查跨页面复用、同类组件对齐、硬编码收敛 | 生成后调用 |
| [icon-image-catch-skill](../../icon-image-catch-skill/) | 远程素材抓取 | 图标 → `icon-catch-skill`；图片 → `image-catch-skill` | 强制规范 §2 |
| [image-forge-skill](../../image-forge-skill/) | 图标生成 / 图片处理 | 抓不到合适素材时生成图标，或对素材压缩/裁剪/合成 | 兜底与后处理 |

## 标准工作流

```
Step 1: uniapp-base-skill
        → 接收需求，生成页面骨架与 base-card 组合

Step 2: uniapp-theme-skill
        → 应用主题变量，替换所有硬编码颜色/字号/间距/圆角/阴影

Step 3: icon-catch-skill
        → 抓取页面所需功能图标、TabBar 图标、操作图标

Step 4: image-catch-skill
        → 抓取头像、配图、Banner、头图、商品图等真实图片

Step 5: image-forge-skill（按需）
        → 生成缺失图标、压缩图片、裁剪尺寸、格式转换

Step 6: uniapp-style-skill
        → 审查是否符合设计系统（D01-D34 红线、组件 Token、页面布局）

Step 7: frontend-style-harmonizer-skill
        → 审查跨页面样式一致性，收敛硬编码，抽取公共样式
```

## 强制约束

1. **主题变量优先**：所有颜色、字号、间距、圆角、阴影必须引用主题变量。
2. **真实素材优先**：功能图标和图片必须通过配套技能获取，禁止 emoji 和空白占位。
3. **uniapp 标签**：页面代码使用 `view` / `text` / `image` / `input` / `picker`，禁止使用 `div` / `p` / `span` / `img` / `button` / `scroll-view`。
4. **生成后对齐**：页面生成完毕后，主动提示可调用 `uniapp-style-skill` 或 `frontend-style-harmonizer-skill` 做规范对齐。

## 素材来源约定

| 素材类型 | 默认来源 | 降级来源 | 落地目录 |
|---------|---------|---------|---------|
| 功能图标 | Iconify / lucide | simple-icons（品牌）/ image-forge-skill 生成 | `static/icons/` |
| 真实图片 | 自定义 CDN | Pexels / Pixabay / Unsplash / Lorem Flickr / Picsum | `static/images/` |

## 触发词映射

| 用户意图 | 默认进入技能 | 联动技能 |
|---------|-------------|---------|
| 生成页面骨架 | uniapp-base-skill | theme + icon/image |
| 应用主题 | uniapp-theme-skill | — |
| 抓取图标 | icon-catch-skill | image-forge-skill（兜底生成） |
| 抓取图片 | image-catch-skill | image-forge-skill（压缩/裁剪） |
| 样式审查 | uniapp-style-skill | frontend-style-harmonizer-skill |
| 样式治理 | frontend-style-harmonizer-skill | uniapp-style-skill |

## 版本

- v1.3.0 (2026-08-16)：首次沉淀技能矩阵文档
