# icon-catch-skill — 图标抓取子技能

输入语义关键词，从 Iconify 聚合的多个开源图标库中搜索并下载 SVG 图标。**免费、无需 Key**。

完整抓取流程与规范见 [SKILL.md](SKILL.md)。

## 快速使用

对 Claude 说：

```
帮我抓一个 home 图标
给"个人中心、订单、设置"三个入口各配一个图标，灰色 24px
把页面里的 Emoji 都换成 lucide 专业图标
```

Claude 会询问你想用的图标库，确认后直接调用 Iconify API 下载到项目目录。

## 目录说明

- `SKILL.md` — 完整抓取流程与规范
- `references/icon-sources.md` — 图标库对照、选择策略、中英文映射

## 备注

- 默认优先级：Iconify 聚合 → lucide → tabler → heroicons → phosphor → remix → feather → simple-icons → mdi
- 搜不到时换英文词重试；仍不行建议改用 `icon-forge` 技能生成
- 需要 PNG 时，建议优先使用 SVG；确需 PNG 可用 `icon-forge` 或其他渲染工具
