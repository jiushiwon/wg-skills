# base-upload

> 文件/图片上传组件。基于 `base-card` 风格，对接 `frontend-request-skill` 的上传封装。
>
> ⚠️ **零 HTML5 标签铁律的唯一例外**：Web 端文件选择必须依赖一个**隐藏的原生 file 控件**（浏览器安全模型的硬性要求，Element Plus / Naive UI 等所有上传组件均如此）。除此之外，可见触发区、文件列表、删除按钮全部用 `<div>` + ARIA 实现。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string[]` | `[]` | 已上传文件 URL 列表（v-model） |
| `action` | `string` | **必填** | 上传接口地址（如 `/upload/image`） |
| `accept` | `string` | `'image/*'` | 接受的文件类型 |
| `maxCount` | `number` | `5` | 最大上传数量 |
| `maxSize` | `number` | `5` | 单文件大小上限（MB） |
| `multiple` | `boolean` | `true` | 是否多选 |
| `listType` | `'picture' \| 'picture-card' \| 'text'` | `'picture-card'` | 列表展示类型 |
| `disabled` | `boolean` | `false` | 禁用 |
| `autoUpload` | `boolean` | `true` | 选择后自动上传 |
| `showFileList` | `boolean` | `true` | 是否展示文件列表 |
| `name` | `string` | `'file'` | 上传字段名 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `string[]` | 文件 URL 列表变化 |
| `change` | `UploadFile[]` | 文件列表变化 |
| `success` | `{ file: UploadFile, response: unknown }` | 单个文件上传成功 |
| `error` | `{ file: UploadFile, error: unknown }` | 单个文件上传失败 |
| `exceed` | `UploadFile[]` | 超出数量限制 |
| `preview` | `UploadFile` | 点击预览 |

## 类型定义

```typescript
/** 上传文件状态 */
export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error'

/** 上传文件对象 */
export interface UploadFile {
  uid: number                    // 唯一标识
  name: string                   // 文件名
  url?: string                   // 上传成功后的 URL
  raw?: File                     // 原始文件对象（通用前端）
  status: UploadStatus           // 状态
  percent: number                // 上传进度 0-100
  response?: unknown             // 上传响应
}

interface BaseUploadProps {
  modelValue?: string[]
  action: string
  accept?: string
  maxCount?: number
  maxSize?: number
  multiple?: boolean
  listType?: 'picture' | 'picture-card' | 'text'
  disabled?: boolean
  autoUpload?: boolean
  showFileList?: boolean
  name?: string
}
```

## 实现要点

### 1. 触发区（零标签：用 div role=button）

```vue
<template>
  <div class="base-upload" :class="{ 'base-upload--disabled': disabled }">
    <!-- 隐藏的原生 file 控件：零标签铁律唯一例外（Web 文件选择硬限制） -->
    <input
      ref="fileInputRef"
      class="base-upload__hidden"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileChange"
    />

    <!-- 触发区：div + role + 键盘事件 -->
    <div
      v-if="canUpload"
      class="base-upload__trigger"
      :class="`base-upload__trigger--${listType}`"
      role="button"
      tabindex="0"
      :aria-disabled="disabled"
      @click="handleTriggerClick"
      @keydown.enter="handleTriggerClick"
      @keydown.space.prevent="handleTriggerClick"
    >
      <span class="base-upload__plus">+</span>
      <span v-if="listType === 'text'" class="base-upload__trigger-text">点击上传</span>
    </div>

    <!-- 文件列表 -->
    <slot v-if="showFileList" :files="fileList">
      <div v-for="file in fileList" :key="file.uid" class="base-upload__item">
        <!-- 图片预览 -->
        <div
          v-if="listType !== 'text' && file.url"
          class="base-upload__thumb"
          :style="{ backgroundImage: `url(${file.url})` }"
          role="button"
          tabindex="0"
          @click="handlePreview(file)"
          @keydown.enter="handlePreview(file)"
        >
          <!-- 上传中遮罩 -->
          <div v-if="file.status === 'uploading'" class="base-upload__progress">
            {{ file.percent }}%
          </div>
          <!-- 失败标记 -->
          <div v-else-if="file.status === 'error'" class="base-upload__error">上传失败</div>
          <!-- 删除按钮 -->
          <span
            class="base-upload__remove"
            role="button"
            tabindex="0"
            :aria-label="`删除 ${file.name}`"
            @click.stop="handleRemove(file)"
            @keydown.enter.stop="handleRemove(file)"
          >×</span>
        </div>

        <!-- 纯文本列表 -->
        <div v-else class="base-upload__text-item">
          <span class="base-upload__name">{{ file.name }}</span>
          <span
            class="base-upload__remove"
            role="button"
            tabindex="0"
            @click="handleRemove(file)"
            @keydown.enter="handleRemove(file)"
          >×</span>
        </div>
      </div>
    </slot>
  </div>
</template>
```

### 2. 核心逻辑

```typescript
import { ref, computed } from 'vue'
import { upload } from '@/api/upload'   // frontend-request-skill 的 upload 封装

const props = withDefaults(defineProps<BaseUploadProps>(), {
  modelValue: () => [],
  accept: 'image/*',
  maxCount: 5,
  maxSize: 5,
  multiple: true,
  listType: 'picture-card',
  disabled: false,
  autoUpload: true,
  showFileList: true,
  name: 'file',
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  change: [files: UploadFile[]]
  success: [payload: { file: UploadFile; response: unknown }]
  error: [payload: { file: UploadFile; error: unknown }]
  exceed: [files: UploadFile[]]
  preview: [file: UploadFile]
}>()

const fileInputRef = ref<HTMLInputElement>()
const fileList = ref<UploadFile[]>([])
let uid = 0

const canUpload = computed(() => {
  return !props.disabled && fileList.value.length < props.maxCount
})

function handleTriggerClick() {
  if (props.disabled) return
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (!files.length) return

  // 超出数量限制
  const remain = props.maxCount - fileList.value.length
  if (files.length > remain) {
    emit('exceed', files.slice(remain))
    files.splice(remain)
  }

  // 构建文件对象
  const items = files.map((raw) => ({
    uid: ++uid,
    name: raw.name,
    raw,
    status: 'ready' as UploadStatus,
    percent: 0,
  }))
  fileList.value.push(...items)
  emit('change', fileList.value)

  if (props.autoUpload) {
    items.forEach((item) => uploadFile(item))
  }

  // 清空 input，允许重复选择同一文件
  input.value = ''
}

async function uploadFile(file: UploadFile) {
  if (file.status === 'uploading') return
  file.status = 'uploading'
  file.percent = 0

  try {
    const res = await upload<string>({
      url: props.action,
      file: file.raw!,
      name: props.name,
      onProgress: (p) => { file.percent = p },
    })
    file.status = 'success'
    file.url = res
    file.percent = 100
    emit('success', { file, response: res })
    syncModelValue()
  } catch (err) {
    file.status = 'error'
    emit('error', { file, error: err })
  }
}

function handleRemove(file: UploadFile) {
  const idx = fileList.value.findIndex((f) => f.uid === file.uid)
  if (idx > -1) fileList.value.splice(idx, 1)
  syncModelValue()
  emit('change', fileList.value)
}

function handlePreview(file: UploadFile) {
  if (file.url) emit('preview', file)
}

function syncModelValue() {
  const urls = fileList.value
    .filter((f) => f.status === 'success' && f.url)
    .map((f) => f.url!)
  emit('update:modelValue', urls)
}

/** 手动触发上传（autoUpload = false 时使用） */
function submit() {
  fileList.value.forEach((f) => {
    if (f.status === 'ready') uploadFile(f)
  })
}

defineExpose({ submit })
```

### 3. 样式

```vue
<style scoped>
.base-upload {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* 隐藏的原生 file 控件 */
.base-upload__hidden {
  display: none;
}

.base-upload__trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.base-upload__trigger:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.base-upload__trigger--text {
  flex-direction: row;
  width: auto;
  height: auto;
  padding: var(--space-2) var(--space-3);
  border-style: solid;
}

.base-upload__plus {
  font-size: var(--font-xl);
  line-height: 1;
}

.base-upload__item {
  position: relative;
  width: 96px;
  height: 96px;
}

.base-upload__thumb {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-md);
  background-size: cover;
  background-position: center;
  cursor: pointer;
}

.base-upload__remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-danger);
  color: #fff;
  text-align: center;
  line-height: 20px;
  cursor: pointer;
  font-size: var(--font-sm);
}

.base-upload__progress {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: var(--radius-md);
}

.base-upload__error {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2px 0;
  background: var(--color-danger);
  color: #fff;
  text-align: center;
  font-size: var(--font-xs);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.base-upload__text-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-secondary);
}

.base-upload--disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
```

### 4. 与 frontend-request-skill 上传封装对齐

```typescript
// src/api/upload.ts（frontend-request-skill 提供）
import { request, type UploadOptions } from './request'

/**
 * 文件上传。直接返回业务 data（URL），不包 ApiResponse 信封。
 * 通用前端底层用 FormData + fetch；uniapp 用 uni.uploadFile（见 uniapp-spec.md）。
 */
export async function upload<T = string>(options: UploadOptions): Promise<T> {
  const { url, file, name = 'file', formData, header, timeout, onProgress } = options

  const fd = new FormData()
  fd.append(name, file as File)
  if (formData) {
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v as string | Blob))
  }

  // 上传不走 request 的防抖去重
  const res = await request<T>({
    url,
    method: 'POST',
    data: fd,
    header,
    timeout,
    skipDebounce: true,
  })

  return res.data
}
```

> 上传接口契约：`POST {action}`，响应信封 `{ code, message, data }`，`data` 为文件 URL。后端脚手架（fastapi-init-skill 等）均遵循此约定。

### 5. 容器原则

```vue
<!-- 正确：独立使用（被 base-card 包裹） -->
<base-card title="上传附件">
  <base-upload v-model="fileUrls" action="/upload/file" :max-count="3" />
</base-card>

<!-- 正确：作为契约字段（由 base-form-render 自动渲染） -->
<base-card title="新增商品">
  <base-form-render v-model="form" :schema="goodsSchema" />
</base-card>

<!-- 错误：游离的 base-upload -->
<base-upload v-model="fileUrls" action="/upload/file" />
```

## 变体参考

- 图片墙（picture-card）→ `listType: 'picture-card'`（默认，适合商品主图）
- 单张头像 → `maxCount: 1` + `listType: 'picture'`
- 附件列表 → `listType: 'text'`（适合 pdf/文档）
- 手动上传 → `autoUpload: false` + 调 `submit()`
- 拖拽上传 → 触发区绑定 dragover/drop 事件，复用 `handleFileChange` 的构建逻辑
