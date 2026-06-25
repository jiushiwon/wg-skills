---
name: icon-forge
description: Generate PNG icons from SVG paths (heroicons-style) or full SVG strings, batch rendered via sharp. Use when the user wants to create/generate app icons, tabBar icons, login feature icons, or any monochrome PNG icon set for a project (uniapp/小程序/RN/H5) and does not want to hand-edit a script. Triggers — "生成图标", "做一套图标", "icon 生成", "生成 png 图标", "给我加几个图标".
---

# icon-forge — 图标生成技能

把 SVG path（或完整 SVG）批量渲染成 PNG。用户只需说清「要哪些图标、什么颜色、放哪个目录」，由你写好配置并运行生成器，无需用户每次指定脚本文件。

## 生成器位置

脚本 `forge-icons.js` 与本 SKILL.md **在同一目录**。设该目录为 `$SKILL_DIR`（运行时即本技能所在目录的绝对路径，例如 `~/.claude/skills/icon-forge`）。

首次使用前需在该目录装一次依赖（sharp）：
```bash
cd "$SKILL_DIR" && npm install
```

## 调用方式

从技能目录运行，让 `require('sharp')` 能解析到本地依赖：
```bash
cd "$SKILL_DIR" && echo '<JSON>' | node forge-icons.js -
```
或写入临时文件再传入：`node forge-icons.js /path/to/spec.json`

## 配置格式

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

## 工作流

1. 跟用户确认三要素：**输出目录、主题色、要哪些图标**（图标可由你按语义给出常用 heroicons path，无需用户提供）。
2. 写好 JSON，用上面的命令运行。
3. 回报生成的文件清单（脚本会打印每个 `[OK] 路径`）。

## 常用 path 速查（heroicons outline，stroke 风格）

- 数据/文档：`M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z`
- 看板/图表：`M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z`
- 灯泡/洞察：`M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z`
- 计划/勾选：`M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4`
- 刷新/重测：`M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15`

需要其它图标时，按 heroicons/feather 语义自行给出对应 path。
