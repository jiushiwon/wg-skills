# image-catch-skill — 图片抓取子技能

输入语义关键词，从可配置远程源搜索并下载高清图片。

完整抓取流程与规范见 [SKILL.md](SKILL.md)。

## 快速使用

对 Claude 说：

```
帮我抓一张猫的图片
给首页 Hero 区域配一张科技感办公背景图，1920 宽横版
给三个功能卡片配图：团队协作、数据分析、创新设计
```

Claude 会询问你想用的图片来源，确认后直接调用对应 API 下载到项目目录。

## 配置（可选）

- **自定义源**：提供你自己的图片 CDN/图片服务地址。
- **正版图库**：申请 Pexels / Pixabay / Unsplash 免费 Key，质量更高。
- **默认兜底**：什么都不配时，自动使用 Lorem Flickr（关键词语义）和 Picsum（随机占位）。

## 目录说明

- `SKILL.md` — 完整抓取流程与规范
- `references/image-sources.md` — 数据源对比与端点速查
- `references/image-sizes.md` — 项目图片尺寸参考规范

## 备注

- 数据源优先级：自定义源 → Pexels / Pixabay / Unsplash（需 Key）→ Lorem Flickr（关键词语义）→ Picsum（随机占位）
- 需要本地压缩/裁剪/格式转换/水印时，转 `image-forge-skill`
- 未配置任何源时，Lorem Flickr 与 Picsum 会自动兜底
