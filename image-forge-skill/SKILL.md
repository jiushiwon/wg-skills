---
name: image-forge-skill
description: 图片处理指导：压缩、转格式、改尺寸、裁剪、base64、水印、遮罩、多图合成。触发词：「处理图片」「压缩图片」「转 webp」「加水印」「图片合成」
---

# image-forge-skill — 图片处理指导

本技能是**纯文本指导型技能**，不直接执行任何图片处理操作。所有处理逻辑交给 AI，由 AI 根据本技能提供的规范生成处理方案或调用外部工具。

## 技能职责

1. **理解需求**：解析用户对图片的处理意图（压缩、转格式、裁剪、水印等）
2. **生成方案**：根据用户输入，生成对应的 JSON Spec 或 CLI 命令
3. **指导执行**：告知用户如何执行，或直接调用外部工具（如 icon-forge、sharp）
4. **结果验证**：检查输出是否符合预期

## 适用场景

- 把本地图片批量压缩并转为 WebP
- 裁剪图片为指定比例（如 16:9 封面）
- 给图片添加文字或 Logo 水印
- 添加半透明遮罩层（便于叠加文字）
- 多张图合成一张 banner 或分享卡
- 生成 base64 Data URI
- SVG/PNG 图标包装成统一风格（圆角、背景、边框）

## 核心规范

### 1. JSON Spec 模式（推荐）

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

### 2. CLI 命令示例

以下为常用命令行示例，可用于参考或迁移到其他工具：

```bash
# sharp 示例
sharp input.jpg resize(800, 600, { fit: 'cover' }).webp(85).toFile('output.webp')

# ImageMagick 示例
convert input.jpg -resize 800x600^ -gravity center -extent 800x600 output.jpg
```

## 处理类型

| 类型 | 字段 | 说明 |
|------|------|------|
| **单图处理** | `format`, `quality`, `resize.*`, `base64` | 压缩、转格式、裁剪 |
| **图片水印** | `overlays[].type: image` | 图片叠加层 |
| **文字水印** | `overlays[].type: text` | 文字叠加层 |
| **纯色遮罩** | `overlays[].type: color` | 颜色遮罩层 |
| **多图合成** | `type: composite` | 画布 + 多图层 |

详细字段说明见 [references/operation-schema.md](references/operation-schema.md)

## 执行方式

本技能是**纯文本指导型**，不执行任何操作。AI 根据本技能规范生成处理方案后，由用户自行选择执行方式：

1. **使用在线工具**：Squoosh、CloudConvert、PicPick
2. **使用本地工具**：sharp (Node.js)、ImageMagick、Pillow (Python)
3. **使用 Claude 技能**：如 `icon-forge`（SVG 渲染）
4. **手动操作**：Photoshop、Figma

AI 应在输出中提供：
- 处理方案（JSON Spec 或 CLI 命令）
- 推荐的工具和安装方式
- 执行步骤说明

## 边界判定

以下场景**超出本技能范围**，应拒绝并建议换工具：

- AI 图片放大（需超分模型）
- SVG 描迹（需矢量工具）
- 复杂艺术滤镜（需设计工具）
- 远程图片直接处理（需先下载，可用 icon-image-catch-skill）

## 与其他技能的关系

| 技能 | 关系 |
|------|------|
| **icon-image-catch-skill** | 远程抓图 → 本技能处理 |
| **icon-forge** | SVG 渲染场景，与本技能互补 |

## 异常处理

- 输入文件不存在：提示检查路径
- 格式不支持：提示可用格式列表（jpeg, webp, png）
- 工具未安装：推荐在线工具或安装对应本地工具
- 权限问题：提示检查文件权限
