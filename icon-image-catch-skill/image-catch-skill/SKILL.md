---
name: image-catch-skill
description: Use when 用户需要按语义搜索并下载高清图片。
---

# image-catch-skill — 图片抓取规范

本技能提供图片抓取流程，**不执行本地脚本**。Claude 应根据以下规范，直接调用图库 API 或浏览器/网络工具完成下载。

## 数据源

本技能采用**可配置源优先**设计：

| 源类型 | 配置方式 | 说明 |
|---|---|---|
| **自定义源**（推荐） | 用户提供的远程图片服务 / CDN | 地址内容由用户控制 |
| 正版图库 | Pexels / Pixabay / Unsplash API Key | 质量更高，适合正式项目 |
| 默认兜底 | Lorem Flickr（关键词语义）+ Picsum（随机占位） | 无需任何配置 |

### 各图源特点

| 源 | 质量 | 推荐场景 | 是否需要 Key |
|---|---|---|---|
| **Pexels** | ⭐⭐⭐⭐⭐ | 正式项目、Hero、Banner | 免费 Key |
| **Pixabay** | ⭐⭐⭐⭐ | 内容运营、营销页、插画 | 免费 Key |
| **Unsplash** | ⭐⭐⭐⭐⭐ | 大图/Hero/品牌视觉 | 免费 Key |
| **Lorem Flickr** | ⭐⭐⭐ | Demo、原型、占位图 | 无需 Key |
| **Picsum** | ⭐⭐ | 纯视觉占位、测试 | 无需 Key |

## 使用前询问规范

当用户要求抓图片时，Claude **必须先询问用户想用的图源**，给出风格/质量推荐，再执行。示例：

> 准备抓「科技感办公」配图，可选图源：
> 1. **Pexels** — 高质量真实照片（推荐正式项目）
> 2. **Pixabay** — 量大，含插画/矢量
> 3. **Unsplash** — 画质最高，艺术感强
> 4. **Lorem Flickr** — 无需 Key，真实照片但授权不确定
> 5. **Picsum** — 无需 Key，纯占位
> 6. **全部自动** — 按 Pexels → Pixabay → Unsplash → Lorem Flickr → Picsum 顺序自动降级（默认）
>
> 你想用哪个？直接回车默认全部自动。

如果用户明确指定了源，或已配置自定义源，则不再询问。

## 标准抓取流程

1. **明确主题**：从需求提取图片内容词（如「团队配图」→ `teamwork`），越具体越好。
2. **询问图源**：向用户展示可选源及风格推荐，确认后执行；用户已指定则跳过。
3. **英文关键词**：优先使用英文搜索；中文需求参考 `references/image-sources.md` 的中英文映射表。
4. **定规格**：按使用位置定方向（横版/竖版/方形）与尺寸。参考 `../references/image-sizes.md`。
5. **询问压缩**：下载图片时先询问是否压缩。若需要本地压缩/裁剪/格式转换，转 `image-forge-skill`；若仅需远程缩放，使用各图源支持的缩放参数。
6. **选源降级**：优先使用用户自定义源；未配置则尝试 Pexels/Pixabay/Unsplash；仍无则使用 Lorem Flickr 和 Picsum 兜底。
7. **落地保存**：保存到项目图片目录（uniapp 默认 `static/images/`）。

## API 调用参考

### Pexels

```
GET https://api.pexels.com/v1/search?query={query}&per_page={count}&orientation={landscape|portrait|square}
Authorization: {PEXELS_API_KEY}
```

### Pixabay

```
GET https://pixabay.com/api/?key={KEY}&q={query}&per_page={count}&image_type=photo&safesearch=true&orientation={horizontal|vertical}
```

### Unsplash

```
GET https://api.unsplash.com/search/photos?query={query}&per_page={count}&orientation={landscape|portrait|squarish}
Authorization: Client-ID {ACCESS_KEY}
```

### Lorem Flickr

```
GET https://loremflickr.com/{width}/{height}/{keyword}?lock={seed}
```

### Picsum

```
GET https://picsum.photos/seed/{seed}/{width}/{height}
```

## 参数规范

| 参数 | 说明 | 示例 |
|---|---|---|
| `source` | 指定源 | `pexels` / `pixabay` / `unsplash` / `loremflickr` / `picsum` / `custom` / `all` |
| `count` | 数量 | `5` |
| `out` | 下载目录 | `./static/images` |
| `width` | 目标宽度 | `1920` |
| `height` | 目标高度 | `600` |
| `orientation` | 方向 | `landscape` / `portrait` / `squarish` |
| `name` | 文件名前缀 | `hero-bg` |

## 压缩/切图/格式转换

本技能**不本地执行图片处理脚本**。需要时：

- 优先使用 `image-forge-skill` 处理本地图片。
- 或在下载时利用图源远程缩放参数（如 Unsplash `?w=1920&q=80`）。

## 异常处理

- **无可用源**：提示用户配置自定义源或 API Key；未配置时自动使用 Lorem Flickr 和 Picsum 兜底。
- **某源限流/失败**：自动降级到下一源。
- **搜不到合适图片**：换更具体的英文词，或加风格词（如 `minimal`、`flat lay`）。

## 使用规范

- 需要图片的场景尽量用真实图片，禁止用渐变色区块占位。
- 背景图上的文字需加遮罩确保对比度。
- 按显示区域选尺寸；首屏图预加载、非首屏懒加载；支持时优先 WebP。
- 图片必须添加 `alt` 属性描述内容。
- 图片加载失败时要有纯色背景 fallback。
