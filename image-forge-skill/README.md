# image-forge-skill — 图片处理指导

## 技能定位

本技能是**纯文本指导型技能**，不直接执行图片处理，而是为 AI 提供处理规范和指导。

## 功能范围

- **格式转换**：JPEG ↔ WebP ↔ PNG
- **压缩**：有损压缩，质量可调 (1-100)
- **改尺寸**：支持 cover/contain/fill/inside/outside 模式
- **裁剪**：通过 resize + position 实现
- **Base64**：输出 Data URI
- **水印**：图片水印、文字水印、纯色遮罩
- **多图合成**：composite 模式，支持图层叠加
- **图标包装**：圆角、背景、边框

## 适用场景

- 把本地图片批量压缩并转为 WebP
- 裁剪图片为指定比例（如 16:9 封面）
- 给图片添加文字或 Logo 水印
- 添加半透明遮罩层（便于叠加文字）
- 多张图合成一张 banner 或分享卡
- 生成 base64 Data URI
- SVG/PNG 图标包装成统一风格

## 核心规范

### JSON Spec 模式（推荐）

适用于复杂需求、批量任务、多图层合成。

```json
{
  "outDir": "./dist",
  "defaults": { "format": "webp", "quality": 85 },
  "jobs": [
    {
      "input": "src/photo.jpg",
      "output": "photo-thumb.webp",
      "resize": { "width": 800, "height": 600, "fit": "cover" }
    },
    {
      "type": "composite",
      "output": "banner.jpg",
      "width": 1200,
      "height": 600,
      "background": "#eeeeee",
      "layers": [
        { "type": "image", "input": "src/bg.jpg", "fit": "cover", "width": 1200, "height": 600 },
        { "type": "color", "color": "#000000", "opacity": 0.3 },
        { "type": "text", "text": "标题", "x": 600, "y": 300, "fontSize": 72, "color": "#ffffff", "align": "center" }
      ]
    }
  ]
}
```

详细字段说明见 [references/operation-schema.md](references/operation-schema.md)

## 执行方式

本技能是纯文本指导型。AI 根据规范生成方案后，推荐以下执行方式：

| 类型 | 工具 |
|------|------|
| 在线工具 | Squoosh、CloudConvert |
| 本地工具 | sharp (Node.js)、ImageMagick、Pillow (Python) |
| Claude 技能 | icon-forge（SVG 渲染） |
| 手动操作 | Photoshop、Figma |

## 边界说明

以下场景超出本技能范围：
- AI 图片放大（需超分模型）
- SVG 描迹（需矢量工具）
- 复杂艺术滤镜（需设计工具）
- 远程图片直接处理（需先配合 icon-image-catch-skill）

## 与其他技能的关系

| 技能 | 关系 |
|------|------|
| icon-image-catch-skill | 远程抓图 → 本技能处理 |
| icon-forge | SVG 渲染场景，与本技能互补 |

## 目录结构

```
image-forge-skill/
├── SKILL.md                     # 技能定义
├── README.md                    # 本文件
└── references/
    └── operation-schema.md     # JSON Spec 字段详解
```

## 触发词

「处理图片」「压缩图片」「转 webp」「加水印」「图片合成」「裁剪图片」
