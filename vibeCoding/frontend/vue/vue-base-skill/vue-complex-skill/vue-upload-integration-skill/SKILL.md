---
name: vue-upload-integration-skill
description: Vue 上传全链路集成技能（综合级别）。整合 vue-upload-skill（上传组件）+ vue-form-skill（表单）+ frontend-request-skill（请求层）+ 后端契约（Go/Java/FastAPI），实现"表单 + 上传 + 后端对接"即插即用。触发词："上传集成"、"上传表单"、"商品发布"、"文件管理"、"头像设置"。
trigger: |
  做一个商品发布页（含图片上传）
  做一个头像设置页
  做一个文件管理页面
  做一个批量导入功能
  上传集成 | 上传表单 | 上传对接后端
  图片上传 + 表单 | 文件上传 + 表单
---

# vue-upload-integration-skill

> **综合级别**：不是单个组件，而是**上传 + 表单 + 后端契约**的全链路集成。
>
> 引用 vue-upload-skill + vue-form-skill + frontend-request-skill + vue-card-skill + vue-button-skill + vue-tag-skill，实现即插即用。

## 定位

| 维度 | 说明 |
|------|------|
| 本技能做什么 | 将上传组件嵌入表单/页面，对齐后端契约，给出完整业务代码 |
| 本技能不做什么 | 不重新定义上传组件（→ vue-upload-skill）、不重新定义表单（→ vue-form-skill） |

## 引用组件

| 技能 | 组件 / API | 用途 |
|------|-----------|------|
| [vue-upload-skill](../vue-upload-skill/) | `base-upload mode="file"` | 通用文件上传 |
| | `base-upload mode="image"` | 图片上传（预览/裁剪/压缩） |
| | `base-upload mode="list"` | 文件列表展示 |
| [vue-form-skill](../vue-form-skill/) | base-form / base-form-item | 表单容器 + 表单项 |
| [vue-card-skill](../vue-card-skill/) | base-card | 根容器 |
| [vue-button-skill](../vue-button-skill/) | base-button | 操作按钮 |
| [vue-tag-skill](../vue-tag-skill/) | base-tag | 状态标签 |
| [frontend-request-skill](../../../frontend-request-skill/) | upload() | 上传请求封装 |

## 场景矩阵

| # | 场景 | 组件组合 | 后端路由 |
|---|------|----------|----------|
| 1 | 头像设置页 | base-card + base-upload(mode="image" avatar) + base-button | `POST /api/upload/image` |
| 2 | 商品发布页 | base-card + base-form + base-upload(mode="image" crop+compress) + base-button | `POST /api/upload/image` |
| 3 | 文件管理器 | base-card + base-upload(mode="file" drag+text) + base-upload(mode="list") + base-tag | `POST /api/upload/file` |
| 4 | 批量导入页 | base-card + base-upload(autoUpload:false) + base-button | `POST /api/upload/file` |

## 场景 1：头像设置页

```vue
<template>
  <base-card title="个人设置">
    <div class="avatar-setting">
      <div class="avatar-setting__label">头像</div>
      <div class="avatar-setting__content">
        <base-upload
          v-model="avatar"
          action="/api/upload/image"
          mode="image"
          avatar
          :compress="true"
          :compress-max-width="256"
          :compress-max-height="256"
          @success="handleAvatarSuccess"
          @error="handleAvatarError"
        />
        <div class="avatar-setting__tip">支持 JPG、PNG，建议 256×256，自动压缩</div>
      </div>
    </div>

    <div class="avatar-setting">
      <div class="avatar-setting__label">昵称</div>
      <div class="avatar-setting__content">
        <base-input v-model="nickname" placeholder="请输入昵称" />
      </div>
    </div>

    <div class="avatar-setting__actions">
      <base-button @click="handleCancel">取消</base-button>
      <base-button type="primary" :loading="saving" @click="handleSave">保存</base-button>
    </div>
  </base-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { upload } from '@/api/upload'

const avatar = ref<string[]>([])
const nickname = ref('')
const saving = ref(false)

function handleAvatarSuccess(payload: { file: any; response: any }) {
  // 头像上传成功，自动同步到 v-model
}

function handleAvatarError(payload: { file: any; error: any }) {
  // 提示上传失败
}

async function handleSave() {
  saving.value = true
  try {
    // 调用用户信息更新接口
    await request({ url: '/user/profile', method: 'PUT', data: {
      avatar: avatar.value[0],
      nickname: nickname.value,
    }})
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  // 重置
}
</script>

<style scoped>
.avatar-setting {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
}
.avatar-setting__label {
  width: 80px;
  font-size: var(--font-base);
  color: var(--color-text);
  padding-top: var(--space-2);
  flex-shrink: 0;
}
.avatar-setting__content {
  flex: 1;
}
.avatar-setting__tip {
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--space-2);
}
.avatar-setting__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-5);
}
</style>
```

## 场景 2：商品发布页（表单 + 多图上传 + 裁剪 + 压缩）

```vue
<template>
  <base-card title="发布商品">
    <base-form :model="form" :rules="rules" label-width="80px">
      <base-form-item label="商品名称" prop="name" required>
        <base-input v-model="form.name" placeholder="请输入商品名称" />
      </base-form-item>

      <base-form-item label="商品分类" prop="category" required>
        <base-select v-model="form.category" :options="categoryOptions" placeholder="请选择分类" />
      </base-form-item>

      <base-form-item label="价格" prop="price" required>
        <base-input v-model="form.price" placeholder="请输入价格" type="text" />
      </base-form-item>

      <base-form-item label="商品图片" prop="images" required>
        <base-upload
          v-model="form.images"
          action="/api/upload/image"
          mode="image"
          :max-count="9"
          crop
          :crop-ratio="1"
          compress
          :compress-quality="0.85"
          tip="支持 JPG、PNG，建议正方形，自动压缩，最多 9 张"
          @success="handleImageSuccess"
          @compress="handleCompress"
        />
      </base-form-item>

      <base-form-item label="商品描述" prop="description">
        <base-input v-model="form.description" type="textarea" placeholder="请输入商品描述" />
      </base-form-item>

      <base-form-item label="商品附件" prop="attachments">
        <base-upload
          v-model="form.attachments"
          action="/api/upload/file"
          mode="file"
          list-type="text"
          accept=".pdf,.doc,.docx,.xlsx"
          :max-count="3"
          :max-size="20"
          tip="支持 PDF、Word、Excel，单文件不超过 20MB"
        />
      </base-form-item>

      <base-form-item>
        <base-button @click="handleCancel">取消</base-button>
        <base-button type="primary" :loading="submitting" @click="handleSubmit">发布商品</base-button>
      </base-form-item>
    </base-form>
  </base-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { post } from '@/api/request'

const form = reactive({
  name: '',
  category: '',
  price: '',
  images: [] as string[],
  description: '',
  attachments: [] as string[],
})

const rules = {
  name: [{ required: true, message: '请输入商品名称' }],
  category: [{ required: true, message: '请选择分类' }],
  price: [{ required: true, message: '请输入价格' }],
  images: [{ required: true, message: '请上传至少一张商品图片' }],
}

const categoryOptions = [
  { label: '电子产品', value: 'electronics' },
  { label: '服装鞋帽', value: 'clothing' },
  { label: '食品饮料', value: 'food' },
]

const submitting = ref(false)

function handleImageSuccess(payload: { file: any; response: any }) {
  // 图片上传成功
}

function handleCompress(payload: { original: File; compressed: File; ratio: number }) {
  // 压缩完成，ratio 为压缩百分比
  console.log(`压缩节省 ${payload.ratio}% 空间`)
}

async function handleSubmit() {
  submitting.value = true
  try {
    await post('/products', {
      ...form,
      price: Number(form.price),
    })
    // 提示成功，跳转
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  // 返回列表页
}
</script>
```

## 场景 3：文件管理器（拖拽 + 列表 + 排序）

```vue
<template>
  <base-card title="文件管理">
    <template #header-right>
      <base-tag type="info">{{ fileList.length }} 个文件</base-tag>
    </template>

    <base-upload
      v-model="fileUrls"
      action="/api/upload/file"
      mode="file"
      list-type="text"
      drag
      :max-count="20"
      :max-size="100"
      tip="支持任意文件格式，单文件不超过 100MB，最多 20 个"
      @success="handleSuccess"
      @remove="handleRemove"
    />

    <!-- 已上传文件列表（可拖拽排序） -->
    <div v-if="sortedFiles.length" class="file-manager__section">
      <div class="file-manager__section-title">已上传文件</div>
      <base-upload
        mode="list"
        :files="sortedFiles"
        list-type="text"
        :sortable="true"
        @sort-change="handleSort"
        @remove="handleRemoveFromList"
      />
    </div>
  </base-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UploadFile } from '@/types/upload'

const fileUrls = ref<string[]>([])
const fileList = ref<UploadFile[]>([])

const sortedFiles = computed(() =>
  fileList.value.filter((f) => f.status === 'success'),
)

function handleSuccess(payload: { file: UploadFile; response: unknown }) {
  fileList.value.push(payload.file)
}

function handleRemove(file: UploadFile) {
  fileList.value = fileList.value.filter((f) => f.uid !== file.uid)
}

function handleRemoveFromList(file: UploadFile) {
  fileList.value = fileList.value.filter((f) => f.uid !== file.uid)
}

function handleSort(sorted: UploadFile[]) {
  fileList.value = sorted
}
</script>

<style scoped>
.file-manager__section {
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
.file-manager__section-title {
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}
</style>
```

## 场景 4：批量导入（手动上传 + 进度追踪）

```vue
<template>
  <base-card title="批量导入用户">
    <div class="import-guide">
      <div class="import-guide__title">导入说明</div>
      <div class="import-guide__steps">
        <div class="import-guide__step">
          <base-tag variant="solid">1</base-tag>
          <span>下载模板文件</span>
          <base-button size="sm" variant="outline" @click="downloadTemplate">下载模板</base-button>
        </div>
        <div class="import-guide__step">
          <base-tag variant="solid">2</base-tag>
          <span>填写数据并上传</span>
        </div>
        <div class="import-guide__step">
          <base-tag variant="solid">3</base-tag>
          <span>确认导入结果</span>
        </div>
      </div>
    </div>

    <base-upload
      ref="uploadRef"
      v-model="fileUrls"
      action="/api/upload/file"
      mode="file"
      list-type="text"
      accept=".csv,.xlsx,.xls"
      :max-count="1"
      :max-size="10"
      :auto-upload="false"
      tip="支持 CSV、Excel，单文件不超过 10MB"
    />

    <div class="import-actions">
      <base-button @click="handleCancel">取消</base-button>
      <base-button type="primary" :loading="importing" :disabled="!fileUrls.length" @click="handleImport">
        开始导入
      </base-button>
    </div>

    <!-- 导入结果 -->
    <div v-if="importResult" class="import-result">
      <base-tag :type="importResult.success ? 'success' : 'danger'" variant="solid">
        {{ importResult.success ? '导入成功' : '导入失败' }}
      </base-tag>
      <span v-if="importResult.success">
        成功导入 {{ importResult.count }} 条数据
      </span>
      <span v-else>{{ importResult.message }}</span>
    </div>
  </base-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { post } from '@/api/request'

const uploadRef = ref()
const fileUrls = ref<string[]>([])
const importing = ref(false)
const importResult = ref<{ success: boolean; count?: number; message?: string } | null>(null)

function downloadTemplate() {
  window.open('/templates/user-import-template.xlsx', '_blank')
}

async function handleImport() {
  if (!fileUrls.value.length) return

  importing.value = true
  importResult.value = null

  try {
    const res = await post<{ count: number }>('/users/import', {
      fileUrl: fileUrls.value[0],
    })
    importResult.value = { success: true, count: res.data.count }
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err
      ? (err as { message: string }).message
      : '导入失败'
    importResult.value = { success: false, message }
  } finally {
    importing.value = false
  }
}

function handleCancel() {
  uploadRef.value?.clearFiles()
  importResult.value = null
}
</script>

<style scoped>
.import-guide {
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}
.import-guide__title {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-3);
}
.import-guide__steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.import-guide__step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}
.import-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-5);
}
.import-result {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-sm);
}
</style>
```

## 上传 API 模块

在 `vue-generate-skill` 生成的骨架项目中，按如下方式创建上传 API：

```typescript
// src/api/upload.ts
import { request, type UploadOptions } from './request'

export interface UploadResult {
  url: string
  name: string
  size: number
}

/** 通用文件上传 */
export async function uploadFile(file: File, extra?: Record<string, any>): Promise<UploadResult> {
  return upload<UploadResult>({
    url: '/upload/file',
    file,
    name: 'file',
    formData: extra,
  })
}

/** 图片上传 */
export async function uploadImage(file: File, extra?: Record<string, any>): Promise<UploadResult> {
  return upload<UploadResult>({
    url: '/upload/image',
    file,
    name: 'file',
    formData: extra,
  })
}

/** 核心上传函数（来自 frontend-request-skill） */
export async function upload<T = string>(options: UploadOptions): Promise<T> {
  const { url, file, name = 'file', formData, header, timeout, onProgress } = options
  const fd = new FormData()
  fd.append(name, file as File)
  if (formData) {
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v as string | Blob))
  }
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

## 后端契约对齐

| 后端框架 | 上传接口文档 |
|----------|-------------|
| FastAPI (Python) | [vue-upload-skill/references/backend-contract.md](../vue-upload-skill/references/backend-contract.md#fastapi-python) |
| Spring Boot (Java) | [vue-upload-skill/references/backend-contract.md](../vue-upload-skill/references/backend-contract.md#spring-boot-java) |
| Go Gin | [vue-upload-skill/references/backend-contract.md](../vue-upload-skill/references/backend-contract.md#go-gin) |

**统一响应**：`{ code: 0, message: 'success', data: { url, name, size } }`

## 综合交互 Demo

`demo-components/html/00-showcase.html` 是可独立运行的综合演示（Vue 3 CDN），集成以下技能：

| 技能 | 对应样式/组件 | Demo 中的呈现 |
|------|-------------|-------------|
| vue-upload-skill | base-upload | `.upload-pic__*` / `.upload-file__*` / `.upload-drag__*` 等 BEM 类名 |
| vue-card-skill | base-card | `.card` / `.card-title` / `.card-desc` 容器 |
| vue-button-skill | base-button | `.btn` / `.btn-primary` / `.btn-sm` 操作按钮 |
| vue-tag-skill | base-tag | `.tag` / `.tag--info` / `.tag--success` 状态标签 |
| vue-theme-skill | design-tokens | `:root` 下所有 `--color-*` / `--font-*` / `--radius-*` 变量 |
| frontend-request-skill | upload() | demo 中用 `simulateUpload()` 模拟，真实项目替换为 `upload()` |

## 即插即用验证清单

- [ ] base-upload (mode="image") 的 v-model 可直接作为表单字段
- [ ] upload() 调用与 frontend-request-skill 的 UploadOptions 一致
- [ ] 响应信封与后端 init-skill 内置契约一致
- [ ] 所有 Token 来自 vue-theme-skill，零硬编码
- [ ] 所有按钮引用 base-button，标签引用 base-tag
- [ ] 所有内容区域嵌入 base-card
- [ ] 错误码与 ERROR_CODE_MAP 对齐

## 触发词

- "上传集成"
- "上传表单"
- "商品发布"
- "文件管理"
- "头像设置"
- "批量导入"
- "图片上传 + 表单"
- "文件上传 + 后端"
