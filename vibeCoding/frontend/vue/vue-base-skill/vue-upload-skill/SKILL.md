---
name: vue-upload-skill
description: Vue 上传组件技能。一个 base-upload 组件，三种模式（file/image/list），覆盖文件上传、图片预览裁剪压缩、头像上传、文件列表展示。对齐 frontend-request-skill 与 vue-theme-skill。触发词："Vue 上传"、"文件上传"、"图片上传"、"图片裁剪"、"头像上传"、"拖拽上传"。
trigger: |
  做一个上传组件 | 做一个文件上传 | 做一个图片上传
  做一个图片裁剪 | 做一个头像上传 | 做一个拖拽上传
  图片压缩上传 | 图片预览 | 文件列表
  vue-upload | base-upload
  上传组件 | 上传图片 | 上传文件 | 上传附件
---

# vue-upload-skill

> **容器原则**：所有上传区域必须嵌入 `<base-card>`。无例外。
> **零 HTML5 标签唯一例外**：隐藏的 `<input type="file">`（浏览器安全模型硬性要求）。
> **一个组件，三种模式**：新增变体扩展 props 即可，不需要新建 md。

## 核心组件

| 组件 | 三种模式 | 说明 | 文档 |
|------|----------|------|------|
| **base-upload** | `mode="file"` | 通用文件上传（拖拽/多文件/进度条/三种 listType） | [base-upload.md](base-upload.md) |
| | `mode="image"` | 图片上传（预览大图/Canvas 裁剪/客户端压缩/头像） | |
| | `mode="list"` | 文件列表展示（独立使用/拖拽排序） | |

## 模式速查

```vue
<!-- 通用文件上传 -->
<base-upload mode="file" v-model="files" action="/api/upload/file" drag />

<!-- 图片上传（裁剪+压缩） -->
<base-upload mode="image" v-model="images" action="/api/upload/image" crop compress />

<!-- 头像上传 -->
<base-upload mode="image" v-model="avatar" action="/api/upload/image" avatar />

<!-- 文件列表（独立展示） -->
<base-upload mode="list" :files="fileList" :sortable="true" />
```

## 共享类型（即插即用核心）

```typescript
export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error'
export type UploadMode = 'file' | 'image' | 'list'
export type ListType = 'text' | 'picture' | 'picture-card'

export interface UploadFile {
  uid: number
  name: string
  size?: number
  type?: string
  url?: string
  thumbUrl?: string
  raw?: File
  status: UploadStatus
  percent: number
  response?: unknown
}
```

## 场景矩阵

| 场景 | mode | 关键 props |
|------|------|-----------|
| 文件附件 | file | `list-type="text" accept=".pdf,.doc"` |
| 商品图片 | image | `crop compress :max-count="9"` |
| 头像上传 | image | `avatar :compress="true"` |
| 证件照 | image | `crop :crop-ratio="3/4" :max-count="2"` |
| 拖拽上传 | file | `drag list-type="text"` |
| 文件管理 | list | `:sortable="true"` |
| 手动上传 | file | `:auto-upload="false"` + ref.submit() |

## 跨技能协同

| 对接技能 | 对接方式 |
|----------|----------|
| [vue-theme-skill](../vue-theme-skill/) | Token 唯一来源，零硬编码 |
| [frontend-request-skill](../../frontend-request-skill/) | 调用 `upload()` 封装 |
| [vue-card-skill](../vue-card-skill/) | 上传区域用 `<base-card>` 包裹 |
| [vue-button-skill](../vue-button-skill/) | 按钮引用 `<base-button>` |
| [vue-tag-skill](../vue-tag-skill/) | 状态标签引用 `<base-tag>` |
| [vue-form-skill](../vue-form-skill/) | 作为 form-item 子组件，v-model 对接 |
| [vue-generate-skill](../vue-generate-skill/) | 骨架项目自动放置到 `src/components/` |

## 设计 Token

| 类别 | 命名 | 示例 |
|------|------|------|
| 颜色 | `--color-{name}` | `--color-primary` `--color-danger` |
| 间距 | `--space-{n}` | `--space-2`(8px) `--space-4`(16px) |
| 字号 | `--font-{size}` | `--font-xs`(12px) `--font-base`(14px) |
| 圆角 | `--radius-{size}` | `--radius-md`(12px) |

**禁止硬编码任何颜色 / 间距 / 字号 / 圆角值。**

## 容器原则（铁律）

```vue
<!-- ✅ 正确 -->
<base-card title="上传附件">
  <base-upload mode="file" v-model="files" action="/api/upload/file" />
</base-card>

<!-- ❌ 错误：游离 -->
<base-upload mode="file" v-model="files" action="/api/upload/file" />
```

## 文件结构

```
vue-upload-skill/
├── SKILL.md              # 本文件
├── README.md             # 快速使用指南
├── base-upload.md        # 核心组件（一个组件三种模式）
├── references/
│   └── backend-contract.md  # 后端契约（Go/Java/FastAPI）
└── demo-components/
    └── base-upload/
        └── html/
            └── 00-showcase.html  # 可交互演示
```

## Demo 定位

| 文件 | 性质 | 说明 |
|------|------|------|
| `demo-components/base-upload/html/00-showcase.html` | **独立组件 demo** | 所有 BEM 类名均为 `upload-*`，不引用 base-card / base-button / base-tag |
| `vue-complex-skill/vue-upload-integration-skill/demo-components/html/00-showcase.html` | **综合集成 demo** | 多 skill 联动：base-upload + base-card + base-button + base-tag + design-tokens |

## 红线

- ❌ 禁止脱离 base-card 使用
- ❌ 禁止自写按钮（引用 base-button）
- ❌ 禁止自写标签（引用 base-tag）
- ❌ 禁止硬编码颜色/间距/字号/圆角
- ❌ 禁止 Element Plus / 任何第三方 UI 库
- ❌ 禁止自写请求逻辑（调用 upload() from frontend-request-skill）
- ❌ 除隐藏 `<input type="file">` 外禁止 HTML5 标签
- ❌ 禁止彩色 emoji（文件图标用 `PDF` `DOC` 等纯文本 + CSS badge）
