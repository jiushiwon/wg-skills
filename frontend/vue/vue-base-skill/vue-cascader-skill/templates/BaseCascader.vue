<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { CascaderProps, CascaderEmits, CascaderOption } from '../types/cascader'

const props = withDefaults(defineProps<CascaderProps>(), {
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  clearable: true,
  filterable: false,
  multiple: false,
  checkStrictly: false,
  showAllLevels: true,
  collapseTags: false,
  separator: '/',
  size: 'md',
})

const emit = defineEmits<CascaderEmits>()

// 展开状态
const isOpen = ref(false)
const triggerRef = ref<HTMLDivElement>()

// 搜索
const searchQuery = ref('')

// 菜单数据 - 每级菜单独立存储
const activeMenus = ref<CascaderOption[][]>([props.options])

// 选中路径
const selectedPath = ref<CascaderOption[]>([])

// 模型值与浏览路径分开，展开菜单不会改变已提交的选择。
const optionPaths = computed(() => {
  const paths: CascaderOption[][] = []
  function walk(options: CascaderOption[], ancestors: CascaderOption[] = []) {
    for (const option of options) {
      const path = [...ancestors, option]
      paths.push(path)
      if (option.children) walk(option.children, path)
    }
  }
  walk(props.options)
  return paths
})

const pathValue = (path: CascaderOption[]) => path.map(option => String(option.value)).join(props.separator)
const lastOption = (path: CascaderOption[]) => path[path.length - 1]
const singlePath = computed(() => optionPaths.value.find(path => pathValue(path) === props.modelValue) ?? [])
const selectedTags = computed(() => {
  if (!Array.isArray(props.modelValue)) return []
  const values = new Set(props.modelValue)
  const tags = new Map<string, CascaderOption>()
  for (const path of optionPaths.value) {
    const option = lastOption(path)
    const value = String(option.value)
    if (values.has(value) && (props.checkStrictly || !option.children?.length)) tags.set(value, option)
  }
  return [...tags.values()]
})
const filteredOptions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []
  return optionPaths.value.filter(path =>
    !path.some(option => option.disabled) &&
    (props.checkStrictly || !lastOption(path).children?.length) &&
    path.some(option => option.label.toLowerCase().includes(query)),
  )
})
const displayText = computed(() => props.showAllLevels
  ? singlePath.value.map(option => option.label).join(props.separator)
  : lastOption(singlePath.value)?.label ?? '')
const hasValue = computed(() => props.multiple ? selectedTags.value.length > 0 : singlePath.value.length > 0)

watch(() => props.options, options => {
  activeMenus.value = [options]
  selectedPath.value = []
})

// 切换展开
function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    open()
  } else {
    close()
  }
}

function open() {
  isOpen.value = true
  searchQuery.value = ''
  // 重置菜单为第一级
  activeMenus.value = [props.options]
  selectedPath.value = []
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
}

function handleSelect(option: CascaderOption, level: number) {
  if (option.disabled || props.disabled) return
  const path = [...selectedPath.value.slice(0, level), option]
  selectedPath.value = path
  activeMenus.value = activeMenus.value.slice(0, level + 1)
  if (option.children?.length) {
    activeMenus.value.push(option.children)
    emit('expandChange', { value: option.value, option, resolved: true })
    if (!props.checkStrictly) return
  }
  commitSelection(path)
}

function commitSelection(path: CascaderOption[]) {
  if (props.disabled) return
  const option = lastOption(path)
  if (props.multiple) {
    const value = String(option.value)
    const tags = selectedTags.value
    const nextTags = tags.some(tag => String(tag.value) === value)
      ? tags.filter(tag => String(tag.value) !== value)
      : [...tags, option]
    emitSelection(nextTags.map(tag => String(tag.value)), nextTags)
    return
  }
  emitSelection(pathValue(path), path)
  close()
}

function emitSelection(value: string | string[], options: CascaderOption[]) {
  emit('update:modelValue', value)
  emit('change', { value, selectedOptions: options })
}

function handleClear(e: Event) {
  e.stopPropagation()
  if (props.disabled) return
  selectedPath.value = []
  activeMenus.value = [props.options]
  emitSelection(props.multiple ? [] : '', [])
  emit('clear')
}

function handleClickOutside(e: Event) {
  if (triggerRef.value && !triggerRef.value.contains(e.target as Node)) close()
}

function removeTag(option: CascaderOption) {
  if (props.disabled) return
  const tags = selectedTags.value.filter(tag => String(tag.value) !== String(option.value))
  emitSelection(tags.map(tag => String(tag.value)), tags)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="triggerRef"
    class="base-cascader"
    :class="{
      'is-open': isOpen,
      'is-disabled': disabled,
      'is-multiple': multiple,
    }"
  >
    <!-- 触发器 -->
    <div class="base-cascader__trigger" @click="toggle">
      <!-- 单选显示 -->
      <span v-if="!multiple" class="base-cascader__value" :class="{ 'is-placeholder': !hasValue }">
        {{ hasValue ? displayText : placeholder }}
      </span>

      <!-- 多选显示 Tags -->
      <div v-else class="base-cascader__tags">
        <span
          v-for="tag in (collapseTags ? selectedTags.slice(0, 1) : selectedTags)"
          :key="String(tag.value)"
          class="base-cascader__tag"
        >
          {{ tag.label }}
          <span class="base-cascader__tag-remove" @click.stop="removeTag(tag)">×</span>
        </span>
        <span v-if="collapseTags && selectedTags.length > 1">+{{ selectedTags.length - 1 }}</span>
        <span v-if="!hasValue" class="base-cascader__placeholder">{{ placeholder }}</span>
      </div>

      <!-- 箭头 -->
      <span class="base-cascader__arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>

      <!-- 清除按钮 -->
      <span
        v-if="clearable && hasValue && !disabled"
        class="base-cascader__clear"
        @click="handleClear"
      >×</span>
    </div>

    <!-- 下拉面板 -->
    <div v-if="isOpen" class="base-cascader__dropdown">
      <!-- 搜索框 -->
      <div v-if="filterable" class="base-cascader__search">
        <input
          v-model="searchQuery"
          type="text"
          class="base-cascader__search-input"
          placeholder="搜索..."
        >
        <!-- 搜索结果 -->
        <div v-if="searchQuery && filteredOptions.length > 0" class="base-cascader__search-list">
          <div
            v-for="path in filteredOptions"
            :key="pathValue(path)"
            class="base-cascader__search-item"
            @click="commitSelection(path)"
          >
            <span class="base-cascader__search-label">{{ path.map(option => option.label).join(separator) }}</span>
          </div>
        </div>
        <div v-else-if="searchQuery" class="base-cascader__search-empty">
          无匹配结果
        </div>
      </div>

      <!-- 级联菜单 - 横向排列 -->
      <div class="base-cascader__menus">
        <div
          v-for="(menu, level) in activeMenus"
          :key="level"
          class="base-cascader__menu"
        >
          <div
            v-for="option in menu"
            :key="String(option.value)"
            class="base-cascader__item"
            :class="{
              'is-selected': selectedPath[level]?.value === option.value,
              'is-disabled': option.disabled,
              'has-children': option.children && option.children.length > 0,
            }"
            @click="handleSelect(option, level)"
          >
            <span class="base-cascader__item-label">{{ option.label }}</span>
            <span v-if="option.children && option.children.length > 0" class="base-cascader__item-arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-cascader {
  position: relative;
  width: 100%;
  display: inline-block;
}

.base-cascader__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--height-input-md, 40px);
  padding: 0 var(--space-3, 12px);
  border: 1px solid var(--color-border, #e4e7ed);
  border-radius: var(--radius-md, 8px);
  background: var(--color-surface, #fff);
  cursor: pointer;
  transition: all var(--transition-base, 0.2s);
  gap: var(--space-2, 8px);
}

.base-cascader:hover .base-cascader__trigger {
  border-color: var(--color-primary, #409eff);
}

.base-cascader.is-open .base-cascader__trigger {
  border-color: var(--color-primary, #409eff);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.base-cascader.is-disabled .base-cascader__trigger {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-cascader__value {
  flex: 1;
  font-size: var(--font-base, 14px);
  color: var(--color-text, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-cascader__value.is-placeholder {
  color: var(--color-text-placeholder, #c0c4cc);
}

.base-cascader__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1, 4px);
  flex: 1;
}

.base-cascader__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);
  padding: 2px var(--space-2, 8px);
  background: var(--color-primary-light-9, #ecf5ff);
  color: var(--color-primary, #409eff);
  border-radius: var(--radius-sm, 4px);
  font-size: var(--font-xs, 12px);
}

.base-cascader__tag-remove {
  cursor: pointer;
  opacity: 0.6;
  font-size: 14px;
  line-height: 1;
}

.base-cascader__tag-remove:hover {
  opacity: 1;
}

.base-cascader__placeholder {
  color: var(--color-text-placeholder, #c0c4cc);
  font-size: var(--font-base, 14px);
}

.base-cascader__arrow {
  width: var(--icon-sm, 16px);
  height: var(--icon-sm, 16px);
  color: var(--color-text-tertiary, #909399);
  transition: transform var(--transition-base, 0.2s);
  flex-shrink: 0;
}

.base-cascader.is-open .base-cascader__arrow {
  transform: rotate(180deg);
}

.base-cascader__clear {
  position: absolute;
  right: var(--space-6, 24px);
  width: var(--icon-sm, 16px);
  height: var(--icon-sm, 16px);
  line-height: 14px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-tertiary, #909399);
  cursor: pointer;
  z-index: 1;
}

.base-cascader__clear:hover {
  color: var(--color-text, #303133);
}

/* 下拉面板 */
.base-cascader__dropdown {
  position: absolute;
  top: calc(100% + var(--space-1, 4px));
  left: 0;
  z-index: 100;
  min-width: 100%;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e4e7ed);
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.12));
  overflow: hidden;
}

.base-cascader__search {
  padding: var(--space-2, 8px);
  border-bottom: 1px solid var(--color-border, #e4e7ed);
}

.base-cascader__search-input {
  width: 100%;
  height: var(--height-input-sm, 32px);
  padding: 0 var(--space-3, 12px);
  border: 1px solid var(--color-border, #e4e7ed);
  border-radius: var(--radius-sm, 4px);
  font-size: var(--font-base, 14px);
  outline: none;
}

.base-cascader__search-input:focus {
  border-color: var(--color-primary, #409eff);
}

.base-cascader__search-list,
.base-cascader__search-empty {
  max-height: 200px;
  overflow-y: auto;
}

.base-cascader__search-item {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  cursor: pointer;
}

.base-cascader__search-item:hover {
  background: var(--color-primary-light-9, #ecf5ff);
}

.base-cascader__search-empty {
  padding: var(--space-4, 16px);
  text-align: center;
  color: var(--color-text-placeholder, #c0c4cc);
}

/* 级联菜单容器 - 关键：横向排列 */
.base-cascader__menus {
  display: flex;
  max-height: 240px;
  overflow-x: auto;
}

.base-cascader__menu {
  min-width: 160px;
  max-width: 200px;
  padding: var(--space-1, 4px) 0;
  border-right: 1px solid var(--color-border, #e4e7ed);
  overflow-y: auto;
}

.base-cascader__menu:last-child {
  border-right: none;
}

.base-cascader__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--height-table-row-sm, 34px);
  padding: 0 var(--space-3, 12px);
  font-size: var(--font-base, 14px);
  color: var(--color-text, #303133);
  cursor: pointer;
  transition: background var(--transition-fast, 0.15s);
}

.base-cascader__item:hover {
  background: var(--color-primary-light-9, #ecf5ff);
}

.base-cascader__item.is-selected {
  background: var(--color-primary-light-9, #ecf5ff);
  color: var(--color-primary, #409eff);
  font-weight: var(--weight-medium, 500);
}

.base-cascader__item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-cascader__item-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-cascader__item-arrow {
  color: var(--color-text-tertiary, #909399);
  font-size: 16px;
}

.base-cascader__loading {
  color: var(--color-primary, #409eff);
  animation: loading 1s infinite;
}

@keyframes loading {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
</style>
