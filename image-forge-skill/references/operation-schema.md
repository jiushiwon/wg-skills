# image-forge JSON Spec 完整字段说明

## 顶层结构

```json
{
  "outDir": "./dist",
  "defaults": {
    "format": "jpeg",
    "quality": 80,
    "fit": "cover",
    "position": "center",
    "background": "#ffffff",
    "font": "Microsoft YaHei, PingFang SC, sans-serif",
    "fontWeight": "normal",
    "align": "left"
  },
  "jobs": [
    { "type": "image", "input": "a.jpg", ... },
    { "type": "composite", "width": 1200, "height": 600, ... }
  ]
}
```

| 字段 | 必填 | 类型 | 默认值 | 说明 |
|---|---|---|---|---|
| `outDir` | 否 | string | `.` | 输出根目录 |
| `defaults` | 否 | object | 见下文 | 全局默认值 |
| `jobs` | 是 | array | — | 任务数组 |

## defaults

| 字段 | 默认值 | 说明 |
|---|---|---|
| `format` | `jpeg` | 输出格式 |
| `quality` | `80` | JPEG/WebP 质量 |
| `fit` | `cover` | resize 策略 |
| `position` | `center` | resize/crop 重心 |
| `background` | `#ffffff` | composite 背景色 |
| `font` | `Microsoft YaHei, PingFang SC, sans-serif` | 文字字体 |
| `fontWeight` | `normal` | 文字粗细 |
| `align` | `left` | 文字对齐 |

## image 任务

```json
{
  "type": "image",
  "input": "src/photo.jpg",
  "output": "dist/photo.webp",
  "format": "webp",
  "quality": 85,
  "resize": {
    "width": 800,
    "height": 600,
    "fit": "cover",
    "position": "center",
    "withoutEnlargement": true
  },
  "base64": false,
  "overlays": []
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `type` | 否 | `"image"`，可省略 |
| `input` | 是 | 输入图片路径 |
| `output` | 否 | 输出文件名；缺省从 input 派生 |
| `format` | 否 | `jpeg` / `webp` / `png` |
| `quality` | 否 | 1-100 |
| `resize` | 否 | 尺寸调整对象 |
| `base64` | 否 | true 时附带 base64 |
| `overlays` | 否 | 叠加层数组 |

### resize 对象

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `width` | number | — | 目标宽度 |
| `height` | number | — | 目标高度 |
| `fit` | string | `cover` | `cover` / `contain` / `fill` / `inside` / `outside` |
| `position` | string | `center` | `center` / `top` / `left` / `right` / `bottom` / `top-left` / `top-right` / `bottom-left` / `bottom-right` |
| `withoutEnlargement` | boolean | `true` | 禁止放大 |

## composite 任务

```json
{
  "type": "composite",
  "output": "dist/banner.jpg",
  "width": 1200,
  "height": 600,
  "background": "#ffffff",
  "backgroundOpacity": 1,
  "format": "jpeg",
  "quality": 90,
  "base64": false,
  "layers": [
    { "type": "image", "input": "bg.jpg", "fit": "cover", "width": 1200, "height": 600 },
    { "type": "color", "color": "#000000", "opacity": 0.4 },
    { "type": "text", "text": "标题", "x": 600, "y": 300, "fontSize": 72, "color": "#ffffff", "align": "center" }
  ]
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `type` | 是 | `"composite"` |
| `output` | 否 | 输出文件名 |
| `width` | 是 | 画布宽度 |
| `height` | 是 | 画布高度 |
| `background` | 否 | 背景色 |
| `backgroundOpacity` | 否 | 背景透明度 |
| `format` | 否 | 输出格式 |
| `quality` | 否 | 质量 |
| `base64` | 否 | 是否输出 base64 |
| `layers` | 是 | 图层数组 |

## 图层对象

### image 图层

```json
{
  "type": "image",
  "input": "logo.png",
  "x": 20,
  "y": 20,
  "width": 160,
  "height": 80,
  "fit": "contain",
  "position": "center",
  "opacity": 0.8,
  "blend": "over"
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `input` | 是 | 图片路径 |
| `x` / `y` | 否 | 坐标，默认 0 |
| `width` / `height` | 否 | 目标尺寸，默认原图尺寸 |
| `fit` | 否 | resize 策略 |
| `position` | 否 | resize 重心 |
| `opacity` | 否 | 0-1 |
| `blend` | 否 | 混合模式 |

### text 图层

```json
{
  "type": "text",
  "text": "标题",
  "x": 600,
  "y": 300,
  "fontSize": 72,
  "color": "#ffffff",
  "font": "Microsoft YaHei, PingFang SC, sans-serif",
  "fontWeight": "bold",
  "align": "center",
  "opacity": 1
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `text` | 是 | 文字内容 |
| `x` / `y` | 否 | 坐标，默认 0 |
| `fontSize` | 否 | 字号，默认 32 |
| `color` | 否 | 颜色，默认 `#ffffff` |
| `font` | 否 | 字体 |
| `fontWeight` | 否 | `normal` / `bold` |
| `align` | 否 | `left` / `center` / `right` |
| `opacity` | 否 | 0-1 |

### color 图层

```json
{
  "type": "color",
  "color": "#000000",
  "opacity": 0.4
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `color` | 否 | 颜色，默认 `#000000` |
| `opacity` | 否 | 0-1，默认 1 |

`color` 图层默认铺满整个画布。

## 输出 JSON 结构

```json
{
  "jobs": [
    {
      "type": "image",
      "input": "src/photo.jpg",
      "file": "/project/dist/thumb.webp",
      "width": 800,
      "height": 600,
      "format": "webp",
      "bytes": 28765,
      "base64": "data:image/webp;base64,..."
    }
  ]
}
```

如果任务失败，对应项为：

```json
{ "type": "image", "error": "错误信息" }
```
