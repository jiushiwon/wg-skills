# base-upload

> 统一上传组件。一个组件，三种模式：
> - `mode="file"` — 通用文件上传（拖拽/多文件/进度条）
> - `mode="image"` — 图片上传（预览/裁剪/压缩/头像）
> - `mode="list"` — 文件列表展示（可独立使用/拖拽排序）
>
> **必须**嵌入 `<base-card>` 使用（容器原则）。
>
> **唯一 HTML5 例外**：隐藏的 `<input type="file">`（浏览器安全模型硬性要求）。

## 设计原则

**一个组件 > 三个组件**。新增上传变体只需扩展 props，不需要新建 md 文件。

```
base-upload mode="file"   → 通用文件上传
base-upload mode="image"  → 图片上传（裁剪/压缩/预览）
base-upload mode="list"   → 纯展示列表
```

## Props

### 基础 Props（所有 mode 共享）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string[]` | `[]` | 已上传文件 URL 列表（v-model） |
| `action` | `string` | `''` | 上传接口地址（list 模式可不填） |
| `mode` | `'file' \| 'image' \| 'list'` | `'file'` | 组件模式 |
| `maxCount` | `number` | `5` | 最大上传数量 |
| `maxSize` | `number` | `10` | 单文件大小上限（MB） |
| `multiple` | `boolean` | `true` | 是否多选 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读（list 模式下隐藏操作） |

### 文件模式 Props（mode="file"）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `accept` | `string` | `'*/*'` | 接受的文件类型 |
| `listType` | `'text' \| 'picture' \| 'picture-card'` | `'picture-card'` | 列表形态 |
| `drag` | `boolean` | `false` | 拖拽上传 |
| `autoUpload` | `boolean` | `true` | 选择后自动上传 |
| `name` | `string` | `'file'` | 上传字段名 |
| `headers` | `Record<string, string>` | `{}` | 自定义请求头 |
| `data` | `Record<string, any>` | `{}` | 额外表单数据 |
| `tip` | `string` | `''` | 提示文案 |
| `beforeUpload` | `(file: File) => boolean \| Promise<boolean>` | - | 上传前钩子 |

### 图片模式 Props（mode="image"，继承文件模式）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `crop` | `boolean` | `false` | 启用裁剪 |
| `cropRatio` | `number` | `1` | 裁剪宽高比（1=正方形，16/9=宽屏） |
| `cropTitle` | `string` | `'裁剪图片'` | 裁剪弹窗标题 |
| `compress` | `boolean` | `false` | 启用客户端压缩 |
| `compressQuality` | `number` | `0.8` | 压缩质量 0-1 |
| `compressMaxWidth` | `number` | `1920` | 压缩后最大宽度 |
| `compressMaxHeight` | `number` | `1080` | 压缩后最大高度 |
| `preview` | `boolean` | `true` | 点击预览大图 |
| `avatar` | `boolean` | `false` | 头像模式（自动：单图+圆形+裁剪） |

### 列表模式 Props（mode="list"）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `files` | `UploadFile[]` | `[]` | 文件列表（直接传入对象，非 URL） |
| `listType` | `'text' \| 'picture' \| 'picture-card'` | `'text'` | 列表形态 |
| `sortable` | `boolean` | `false` | 拖拽排序 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `string[]` | URL 列表变化 |
| `change` | `UploadFile[]` | 文件列表变化 |
| `success` | `{ file, response }` | 单文件上传成功 |
| `error` | `{ file, error }` | 上传失败 |
| `exceed` | `UploadFile[]` | 超出数量 |
| `preview` | `UploadFile` | 点击预览 |
| `remove` | `UploadFile` | 文件移除 |
| `crop-confirm` | `{ file, dataUrl }` | 裁剪确认 |
| `compress` | `{ original, compressed, ratio }` | 压缩完成 |
| `sort-change` | `UploadFile[]` | 排序变化 |

## Types

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

## 使用速查

### 文件附件（text 模式）

```vue
<base-upload
  v-model="files"
  action="/api/upload/file"
  mode="file"
  list-type="text"
  accept=".pdf,.doc,.xlsx"
  :max-count="3"
  tip="支持 PDF、Word、Excel"
/>
```

### 图片墙（裁剪 + 压缩）

```vue
<base-upload
  v-model="images"
  action="/api/upload/image"
  mode="image"
  crop
  compress
  :max-count="9"
/>
```

### 头像上传

```vue
<base-upload
  v-model="avatar"
  action="/api/upload/image"
  mode="image"
  avatar
  :compress="true"
/>
```

### 拖拽上传区

```vue
<base-upload
  v-model="files"
  action="/api/upload/file"
  mode="file"
  drag
  list-type="text"
/>
```

### 文件列表（独立展示）

```vue
<base-upload
  mode="list"
  :files="fileList"
  list-type="text"
  :sortable="true"
  @remove="handleRemove"
  @sort-change="handleSort"
/>
```

### 手动上传

```vue
<base-upload
  ref="uploadRef"
  v-model="files"
  action="/api/upload/file"
  mode="file"
  :auto-upload="false"
/>
<base-button @click="uploadRef?.submit()">开始上传</base-button>
```

### 证件照（3:4 裁剪）

```vue
<base-upload
  v-model="certs"
  action="/api/upload/image"
  mode="image"
  crop
  :crop-ratio="3 / 4"
  crop-title="裁剪证件照"
  :max-count="2"
/>
```

## 与 frontend-request-skill 对齐

```typescript
// src/api/upload.ts（frontend-request-skill 提供）
export async function upload<T = string>(options: UploadOptions): Promise<T> {
  const { url, file, name = 'file', formData, header, timeout, onProgress } = options
  const fd = new FormData()
  fd.append(name, file as File)
  if (formData) Object.entries(formData).forEach(([k, v]) => fd.append(k, v as string | Blob))
  const res = await request<T>({ url, method: 'POST', data: fd, header, timeout, skipDebounce: true })
  return res.data
}
```

## 裁剪原理

原生 Canvas API，零依赖：
1. FileReader → Image 加载
2. Canvas 绘制原图 + 半透明遮罩 + 裁剪框 + 九宫格
3. mousedown/mousemove 拖拽裁剪框（带边界约束）
4. 确认时 canvas.toBlob() 导出裁剪后 File

## 压缩原理

Canvas drawImage + toBlob(quality)：
1. 超尺寸 → 等比缩放到 maxWidth/maxHeight
2. toBlob(callback, 'image/jpeg', quality) 导出
3. 一般节省 40%-70%，肉眼无损

## 容器原则

```vue
<!-- ✅ 正确 -->
<base-card title="上传附件">
  <base-upload v-model="files" action="/api/upload/file" mode="file" />
</base-card>

<!-- ❌ 错误 -->
<base-upload v-model="files" action="/api/upload/file" mode="file" />
```

## 红线

- ❌ 禁止脱离 base-card 使用
- ❌ 禁止自写按钮/标签（引用 base-button / base-tag）
- ❌ 禁止硬编码颜色/间距/字号
- ❌ 禁止自写请求逻辑（调用 upload() from frontend-request-skill）
- ❌ 除隐藏 `<input type="file">` 外禁止 HTML5 标签
- ❌ 禁止彩色 emoji（用纯文本 + CSS badge 代替）
