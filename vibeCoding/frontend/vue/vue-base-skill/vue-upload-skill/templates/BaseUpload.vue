<script setup lang="ts">
import { ref, computed, watch } from 'vue'

type UploadMode = 'file' | 'image' | 'list'
type UploadStatus = 'ready' | 'uploading' | 'success' | 'error'
type ListType = 'text' | 'picture' | 'picture-card'

interface UploadFile {
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

const props = withDefaults(defineProps<{
  modelValue?: string[]
  action?: string
  mode?: UploadMode
  maxCount?: number
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  readonly?: boolean
  accept?: string
  listType?: ListType
  drag?: boolean
  autoUpload?: boolean
  name?: string
  headers?: Record<string, string>
  data?: Record<string, unknown>
  tip?: string
  crop?: boolean
  cropRatio?: number
  compress?: boolean
  preview?: boolean
  avatar?: boolean
  files?: UploadFile[]
  sortable?: boolean
}>(), {
  modelValue: () => [],
  mode: 'file',
  maxCount: 5,
  maxSize: 10,
  multiple: true,
  disabled: false,
  readonly: false,
  accept: '*/*',
  listType: 'picture-card',
  drag: false,
  autoUpload: true,
  name: 'file',
  headers: () => ({}),
  data: () => ({}),
  tip: '',
  crop: false,
  cropRatio: 1,
  compress: false,
  preview: true,
  avatar: false,
  files: () => [],
  sortable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'change': [value: UploadFile[]]
  'success': [payload: { file: UploadFile; response: unknown }]
  'error': [payload: { file: UploadFile; error: Error }]
}>()

const fileList = ref<UploadFile[]>([])
const uploading = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const isImageMode = computed(() => props.mode === 'image')
const isListMode = computed(() => props.mode === 'list')

const canUpload = computed(() => {
  if (props.disabled || props.readonly) return false
  if (props.maxCount && fileList.value.length >= props.maxCount) return false
  return true
})

watch(() => props.modelValue, (val) => {
  if (val && val.length > 0) {
    fileList.value = val.map((url, index) => ({
      uid: Date.now() + index,
      name: url.split('/').pop() || 'file',
      url,
      status: 'success',
      percent: 100,
    }))
  }
}, { immediate: true })

function generateUid(): number {
  return Date.now() + Math.random() * 1000
}

function handleClick() {
  if (!canUpload.value) return
  inputRef.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  Array.from(files).forEach(file => {
    if (props.maxSize && file.size > props.maxSize * 1024 * 1024) {
      console.warn(`文件 ${file.name} 超过大小限制 ${props.maxSize}MB`)
      return
    }

    const uploadFile: UploadFile = {
      uid: generateUid(),
      name: file.name,
      size: file.size,
      type: file.type,
      raw: file,
      status: 'ready',
      percent: 0,
    }

    fileList.value.push(uploadFile)

    if (props.autoUpload) {
      uploadFile(uploadFile)
    }
  })

  target.value = ''
}

async function uploadFile(file: UploadFile) {
  if (!props.action) return

  file.status = 'uploading'
  uploading.value = true

  try {
    const formData = new FormData()
    formData.append(props.name, file.raw as File)
    Object.entries(props.data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    const xhr = new XMLHttpRequest()
    xhr.open('POST', props.action)

    Object.entries(props.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        file.percent = Math.round((e.loaded / e.total) * 100)
      }
    }

    xhr.onload = () => {
      uploading.value = false
      if (xhr.status >= 200 && xhr.status < 300) {
        file.status = 'success'
        const response = JSON.parse(xhr.responseText)
        file.response = response
        file.url = response.url || response.data?.url
        emit('success', { file, response })
      } else {
        file.status = 'error'
        emit('error', { file, error: new Error(xhr.statusText) })
      }
      emitModelValue()
    }

    xhr.onerror = () => {
      uploading.value = false
      file.status = 'error'
      emit('error', { file, error: new Error('上传失败') })
    }

    xhr.send(formData)
  } catch (e) {
    uploading.value = false
    file.status = 'error'
  }
}

function handleRemove(file: UploadFile) {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
    emitModelValue()
  }
}

function handlePreview(file: UploadFile) {
  if (props.preview && file.url) {
    window.open(file.url)
  }
}

function emitModelValue() {
  const urls = fileList.value
    .filter(f => f.status === 'success' && f.url)
    .map(f => f.url as string)
  emit('update:modelValue', urls)
  emit('change', fileList.value)
}

function getFileIcon(type: string): string {
  if (!type) return 'FILE'
  if (type.includes('pdf')) return 'PDF'
  if (type.includes('word') || type.includes('document')) return 'DOC'
  if (type.includes('excel') || type.includes('sheet')) return 'XLS'
  if (type.includes('powerpoint') || type.includes('presentation')) return 'PPT'
  if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return 'ZIP'
  return 'FILE'
}

function formatSize(size?: number): string {
  if (!size) return ''
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'K'
  return (size / (1024 * 1024)).toFixed(1) + 'M'
}
</script>

<template>
  <div class="base-upload" :class="{ 'is-disabled': disabled, 'is-readonly': readonly, 'is-avatar': avatar }">
    <!-- 隐藏的文件输入 -->
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple && !avatar"
      class="base-upload__input"
      @change="handleFileChange"
    >

    <!-- 拖拽上传区域 -->
    <div
      v-if="drag && !isListMode"
      class="base-upload__drag"
      :class="{ 'is-dragover': false, 'is-disabled': !canUpload }"
      @click="handleClick"
      @dragover.prevent="(e: DragEvent) => (e.dataTransfer!.dropEffect = 'copy')"
      @drop.prevent
    >
      <div class="base-upload__drag-icon">+</div>
      <div class="base-upload__drag-text">将文件拖到此处上传</div>
    </div>

    <!-- 按钮上传 -->
    <div v-else-if="!isListMode && !avatar" class="base-upload__button" @click="handleClick">
      <slot>
        <div class="base-upload__trigger" :class="`base-upload__trigger--${listType}`">
          <span v-if="listType === 'text'">选择文件</span>
          <span v-else>+</span>
        </div>
      </slot>
      <div v-if="tip" class="base-upload__tip">{{ tip }}</div>
    </div>

    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="base-upload__list" :class="`base-upload__list--${listType}`">
      <div
        v-for="file in fileList"
        :key="file.uid"
        class="base-upload__item"
        :class="[`base-upload__item--${file.status}`, `base-upload__item--${isImageMode ? 'image' : 'file'}`]"
      >
        <!-- 图片模式 -->
        <template v-if="isImageMode">
          <div class="base-upload__item-preview" @click="handlePreview(file)">
            <img v-if="file.url" :src="file.thumbUrl || file.url" :alt="file.name">
            <div v-else-if="file.status === 'uploading'" class="base-upload__item-loading">
              <span>{{ file.percent }}%</span>
            </div>
          </div>
          <div v-if="!readonly" class="base-upload__item-remove" @click.stop="handleRemove(file)">×</div>
        </template>

        <!-- 文件模式 -->
        <template v-else>
          <div class="base-upload__item-icon">{{ getFileIcon(file.type) }}</div>
          <div class="base-upload__item-info">
            <div class="base-upload__item-name">{{ file.name }}</div>
            <div class="base-upload__item-size">{{ formatSize(file.size) }}</div>
          </div>
          <div v-if="file.status === 'uploading'" class="base-upload__item-progress">
            <div class="base-upload__item-progress-bar" :style="{ width: file.percent + '%' }"></div>
          </div>
          <div v-if="!readonly" class="base-upload__item-remove" @click.stop="handleRemove(file)">×</div>
        </template>
      </div>
    </div>

    <!-- 头像模式 -->
    <div v-if="avatar" class="base-upload__avatar" @click="handleClick">
      <img v-if="fileList[0]?.url" :src="fileList[0].url" alt="avatar">
      <div v-else class="base-upload__avatar-placeholder">+</div>
    </div>
  </div>
</template>

<style scoped>
.base-upload {
  width: 100%;
}

.base-upload__input {
  display: none;
}

.base-upload__drag {
  border: 2px dashed var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 12px);
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.base-upload__drag:hover {
  border-color: var(--color-primary, #409eff);
}

.base-upload__drag.is-dragover {
  border-color: var(--color-primary, #409eff);
  background: var(--color-primary-light-9, #ecf5ff);
}

.base-upload__drag.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-upload__drag-icon {
  font-size: 32px;
  color: var(--color-text-placeholder, #c0c4cc);
}

.base-upload__drag-text {
  margin-top: 8px;
  color: var(--color-text-secondary, #909399);
  font-size: var(--font-size-base, 14px);
}

.base-upload__button {
  display: inline-block;
}

.base-upload__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 12px);
  cursor: pointer;
  transition: all 0.2s;
}

.base-upload__trigger:hover {
  border-color: var(--color-primary, #409eff);
}

.base-upload__trigger--picture-card {
  width: 100px;
  height: 100px;
  font-size: 28px;
  color: var(--color-text-placeholder, #c0c4cc);
}

.base-upload__trigger--text {
  padding: 10px 20px;
  color: var(--color-primary, #409eff);
  font-size: var(--font-size-base, 14px);
}

.base-upload__tip {
  margin-top: 8px;
  color: var(--color-text-placeholder, #c0c4cc);
  font-size: var(--font-size-xs, 12px);
}

.base-upload__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.base-upload__item {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md, 12px);
}

.base-upload__item--file {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-bg-secondary, #f5f7fa);
  border: 1px solid var(--color-border, #e4e7ed);
  min-width: 200px;
}

.base-upload__item--image {
  width: 100px;
  height: 100px;
}

.base-upload__item-preview {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.base-upload__item-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.base-upload__item-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary, #f5f7fa);
  font-size: 12px;
  color: var(--color-primary, #409eff);
}

.base-upload__item-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  line-height: 18px;
  text-align: center;
  background: var(--color-danger, #f56c6c);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.base-upload__item:hover .base-upload__item-remove {
  opacity: 1;
}

.base-upload__item-icon {
  padding: 4px 8px;
  background: var(--color-primary-light-9, #ecf5ff);
  color: var(--color-primary, #409eff);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  margin-right: 8px;
}

.base-upload__item-info {
  flex: 1;
  min-width: 0;
}

.base-upload__item-name {
  font-size: var(--font-size-base, 14px);
  color: var(--color-text-primary, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-upload__item-size {
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-placeholder, #c0c4cc);
}

.base-upload__item-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-border, #e4e7ed);
}

.base-upload__item-progress-bar {
  height: 100%;
  background: var(--color-primary, #409eff);
  transition: width 0.2s;
}

.base-upload__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed var(--color-border, #dcdfe6);
}

.base-upload__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.base-upload__avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--color-text-placeholder, #c0c4cc);
}
</style>
