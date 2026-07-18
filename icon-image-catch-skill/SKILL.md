---
name: icon-image-catch-skill
description: Use when 用户需要为项目搜索/下载图标（icon）、真实图片（配图、背景图、banner），或要求审计项目素材需求。
---

# icon-image-catch-skill — 远程素材抓取总入口

本技能不执行任何本地脚本，只提供**规范与流程**。Claude 应根据以下规则，直接调用 Iconify、图库 API 或浏览器/网络工具完成素材抓取。

## 路由判断

| 用户意图 | 进入子技能 |
|---|---|
| 要图标、icon、小图标、功能图标、tabBar 图标 | `icon-catch-skill` |
| 要图片、配图、背景图、banner、头图、照片 | `image-catch-skill` |
| 两者都要 | 先 icon 后图片，分别执行 |
| 审计项目需要哪些素材 | 见下文「项目素材需求审计」 |

## 通用工作原则

1. **语义先行**：先把用户需求翻译成精准英文搜索词。
2. **选库/选源询问**：抓图标前先问用户想用的图标库；抓图片前先问图源。用户不选则默认自动降级。
3. **就近落地**：素材下载到用户项目约定的目录（如 `static/icons`、`static/images`）。
4. **可追溯**：记录素材来源、作者、原始链接，必要时写入同目录元数据文件。
5. **风格统一**：同一项目的图标必须来自同一图标集、同一风格；图片色调与项目主题色协调。
6. **降级意识**：icon 某库失败 → 自动降级下一库；抓不到 → 换关键词 → 仍不行建议用 `icon-forge` 生成。图片某源失败 → 自动降级下一源。
7. **压缩询问**：下载图片时默认询问用户是否压缩；若压缩，可用 `image-forge-skill` 等工具处理，或依赖图源远程缩放参数。

## 环境准备（由 Claude 负责）

- **icon 抓取**：基于 [Iconify](https://api.iconify.design)，零配置、免费、无需 Key。
- **图片抓取**：
  - 自定义源：询问用户是否有自己的图片 CDN/图片服务。
  - 正版图库：Pexels / Pixabay / Unsplash，需用户自行申请免费 Key。
  - 默认兜底：未配置任何 Key 时，使用 Lorem Flickr（关键词语义）和 Picsum（随机占位）。

Claude 不应在 skill 目录下执行 `npm install` 或运行 Node.js 脚本。

## 项目素材需求审计

当用户要求审计项目素材时：

1. 读取用户项目文件（页面、组件、样式、配置文件）。
2. 探测项目框架（uniapp / vue3 / react / next / nuxt 等）、平台类型（移动端 / PC / Web）、主题色、静态资源目录。
3. 扫描代码中可能需要 icon / image 的位置（如 `tabBar`、`navbar`、`hero`、`banner`、`background`、`avatar`、`logo` 等关键词）。
4. 盘点已有 icon / image / font 资源。
5. 输出 `assets-requirements-report.md`，包含：
   - 项目框架、平台、主题色
   - 现有资源清单
   - 按平台推荐的尺寸规格
   - 发现的素材需求位置
   - 可复用现有资源的建议
   - 推荐抓取风格与色调

Claude 应使用文件读取、搜索等工具完成审计，**不运行任何本地审计脚本**。

## 与其他技能的关系

- **icon-forge**：本技能「抓取」现成专业图标；抓不到合适图标时，建议转 `icon-forge` 生成。
- **image-forge-skill**：本技能负责找图；需要本地压缩、裁剪、格式转换、水印、合成时，转 `image-forge-skill`。
- **uniapp-app-generate-skill / frontend-ui-foundry**：生成页面时若需要图标与配图，应调用本技能能力获取真实素材。
