---
name: image-forge-skill
description: 图片处理与图标生成技能。压缩、转格式、改尺寸、裁剪、base64、水印、遮罩、多图合成，以及把 SVG path（heroicons 风格）或完整 SVG 批量渲染成 PNG 图标。触发词：「处理图片」「压缩图片」「转 webp」「加水印」「图片合成」「生成图标」「做一套图标」「icon 生成」「生成 png 图标」
---

# image-forge-skill — 图片处理 & 图标生成

基于 sharp 的配置驱动工具，内置可执行脚本 `image-forge.js`。两种配置模式：

- **icons 模式**：把 SVG path（或完整 SVG）批量渲染成 PNG（原 icon-forge 能力）。
- **jobs 模式**：图片处理 —— 压缩、转格式、改尺寸、裁剪、base64、水印、遮罩、多图合成。

## 脚本位置

脚本 `image-forge.js` 与本 SKILL.md **在同一目录**。设该目录为 `$SKILL_DIR`（运行时即本技能所在目录的绝对路径，例如 `~/.claude/skills/image-forge-skill`）。

首次使用前需在该目录装一次依赖（sharp）：
```bash
cd "$SKILL_DIR" && npm install
```

## 调用方式

从技能目录运行，让 `require('sharp')` 能解析到本地依赖：
```bash
cd "$SKILL_DIR" && echo '<JSON>' | node image-forge.js -
```
或写入临时文件再传入：`node image-forge.js /path/to/spec.json`

## ① icons 模式 — 图标生成

用户只需说清「要哪些图标、什么颜色、放哪个目录」，由你写好 JSON 并运行。

```json
{
  "outDir": "<目标项目>/src/static/icons/login",
  "size": 72,
  "color": "#059669",
  "strokeWidth": 2,
  "icons": [
    { "name": "feature-data.png", "path": "M9 12h6m-6 4h6..." },
    { "name": "custom.png", "svg": "<svg ...>...</svg>" }
  ]
}
```

- `outDir` 必填，自动创建。`size`/`color`/`strokeWidth` 可选（默认 72 / #059669 / 2）。
- 每个图标：`path`（heroicons/feather 风格，viewBox 0 0 24 24）或 `svg`（完整字符串）二选一。

**工作流**：确认三要素（输出目录、主题色、要哪些图标）→ 写 JSON → 运行脚本 → 回报 `[OK] 路径`。

**常用 path 速查（heroicons outline，stroke 风格）**：

- 数据/文档：`M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z`
- 看板/图表：`M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z`
- 灯泡/洞察：`M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z`
- 计划/勾选：`M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4`
- 刷新/重测：`M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15`

需要其它图标时，按 heroicons/feather 语义自行给出对应 path。

## ② jobs 模式 — 图片处理

适用于压缩、转格式、改尺寸、裁剪、base64、水印、遮罩、多图合成。

```json
{
  "outDir": "./dist",
  "defaults": { "format": "webp", "quality": 85, "fit": "cover" },
  "jobs": [
    {
      "type": "image",
      "input": "src/photo.jpg",
      "output": "photo-thumb.webp",
      "format": "webp",
      "quality": 85,
      "resize": { "width": 800, "height": 600, "fit": "cover" },
      "base64": false,
      "overlays": []
    },
    {
      "type": "composite",
      "output": "banner.jpg",
      "width": 1200,
      "height": 600,
      "background": "#eeeeee",
      "backgroundOpacity": 1,
      "layers": [
        { "type": "image", "input": "src/bg.jpg", "fit": "cover", "width": 1200, "height": 600 },
        { "type": "color", "color": "#000000", "opacity": 0.3 },
        { "type": "text", "text": "标题", "x": 600, "y": 300, "fontSize": 72, "color": "#ffffff", "align": "center" }
      ]
    }
  ]
}
```

### 处理类型

| 类型 | 字段 | 说明 |
|------|------|------|
| **单图处理** | `format`, `quality`, `resize.*`, `base64` | 压缩、转格式、裁剪 |
| **图片水印** | `overlays[].type: image` | 图片叠加层 |
| **文字水印** | `overlays[].type: text` | 文字叠加层 |
| **纯色遮罩** | `overlays[].type: color` | 颜色遮罩层 |
| **多图合成** | `type: composite` | 画布 + 多图层 |

详细字段说明见 [references/operation-schema.md](references/operation-schema.md)。

### image 任务

- `input` 必填；`output` 缺省从 input 派生（如 `a.jpg` + `format: webp` → `a.webp`）。
- `resize`：`width` / `height` / `fit`（cover/contain/fill/inside/outside）/ `position` / `withoutEnlargement`。
- `overlays`：叠加图片/文字/遮罩。
- `base64: true` 时，结果附带 data URI（`FORGE_OUTPUT_JSON=1` 可打印 JSON 报告）。

### composite 任务

- `width` / `height` 必填（画布尺寸）。
- `background` 背景色（默认 #ffffff）、`backgroundOpacity` 背景透明度。
- `layers` 图层数组：`image`（坐标/尺寸/fit/opacity/blend）、`text`（坐标/字号/颜色/字体/对齐）、`color`（纯色遮罩铺满）。

## 执行边界

以下场景**超出本技能范围**，应拒绝并建议换工具：
- AI 图片放大（需超分模型）
- SVG 描迹（需矢量工具）
- 复杂艺术滤镜（需设计工具）
- 远程图片直接处理（需先下载，可用 icon-image-catch-skill）

## 异常处理

- 输入文件不存在：提示检查路径
- 格式不支持：提示可用格式列表（jpeg, webp, png）
- 工具未安装：`cd "$SKILL_DIR" && npm install`
- 权限问题：提示检查文件权限

## 与其他技能的关系

| 技能 | 关系 |
|------|------|
| **icon-image-catch-skill** | 远程抓图 → 本技能处理 |
| **uniapp-theme-skill** | 主题换肤后，用本技能 icons 模式生成主题色 tabBar 图标 |
