<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
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

// 加载状态
const loading = ref(false)
const loadingLevel = ref(-1) // 哪个层级正在加载

// 过滤选项（搜索用）
const filteredOptions = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  const result: CascaderOption[] = []

  function filter(options: CascaderOption[], path: CascaderOption[] = []) {
    for (const opt of options) {
      const currentPath = [...path, opt]
      if (opt.label.toLowerCase().includes(query)) {
        result.push(opt)
      }
      if (opt.children) {
        filter(opt.children, currentPath)
      }
    }
  }

  filter(props.options)
  return result
})

// 显示文本
const displayText = computed(() => {
  if (selectedPath.value.length === 0) return ''
  if (props.multiple) {
    return selectedPath.value.map(p => p.label). join(props.separator)
  }
  if (props.showAllLevels) {
    return selectedPath.value.map(p => p.label).join(props.separator)
  }
  return selectedPath.value[selectedPath.value.length - 1]?.label || ''
})

// 是否有值
const hasValue = computed(() => selectedPath.value.length > 0)

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

// 选中处理
async function handleSelect(option: CascaderOption, level: number) {
  if (option.disabled) return

  // 更新路径
  selectedPath.value = selectedPath.value.slice(0, level)
  selectedPath.value.push(option)

  const hasChildren = option.children && option.children.length > 0

  // 多选逻辑
  if (props.multiple) {
    // 父子不关联：直接切换选中状态
    if (props.checkStrictly) {
      emitValue()
    }
    // 有子节点且不是叶子节点，继续展开
    if (hasChildren) {
      activeMenus.value = activeMenus.value.slice(0, level + 1)
      activeMenus.value.push(option.children)
    }
    return
  }

  // 单选逻辑
  if (hasChildren && !props.checkStrictly) {
    // 有子节点，展开下一级
    activeMenus.value = activeMenus.value.slice(0, level + 1)
    activeMenus.value.push(option.children)
    // 触发 expandChange 事件
    emit('expandChange', {
      value: option.value,
      option,
      resolved: true
    })
  } else {
    // 叶子节点或父子不关联，选中完成
    emitValue()
    close()
  }
}

// 懒加载子节点
async function loadChildren(option: CascaderOption, level: number) {
  loading.value = true
  loadingLevel.value = level

  // 模拟异步加载
  await new Promise(resolve => setTimeout(resolve, 500))

  // 实际项目中这里应该 emit 事件让父组件加载数据
  // emit('expand', { value: option.value, done: (children) => { option.children = children } })

  loading.value = false
  loadingLevel.value = -1

  // 添加子节点到菜单
  if (option.children && option.children.length > 0) {
    activeMenus.value = activeMenus.value.slice(0, level + 1)
    activeMenus.value.push(option.children)
  }
}

// 发射值
function emitValue() {
  const value = props.multiple
    ? selectedPath.value
        .filter(p => !p.children || p.children.length === 0 || props.checkStrictly)
        .map(p => String(p.value))
    : selectedPath.value.map(p => String(p.value)).join(props.separator)

  emit('update:modelValue', props.multiple ? value : value)
  emit('change', {
    value: props.multiple ? value : value,
    selectedOptions: selectedPath.value
  })
}

// 清除
function handleClear(e: Event) {
  e.stopPropagation()
  selectedPath.value = []
  activeMenus.value = [props.options]
  emit('update:modelValue', props.multiple ? [] : '')
  emit('clear')
}

// 点击外部关闭
function handleClickOutside(e: Event) {
  if (triggerRef.value && !triggerRef.value.contains(e.target as Node)) {
    close()
  }
}

// 移除多选标签
function removeTag(option: CascaderOption, level: number) {
  const idx = selectedPath.value.findIndex(p => p.value === option.value)
  if (idx > -1) {
    selectedPath.value.splice(idx, 1)
    emitValue()
  }
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
          v-for="(tag, idx) in selectedPath"
          :key="idx"
          class="base-cascader__tag"
        >
          {{ tag.label }}
          <span class="base-cascader__tag-remove" @click.stop="removeTag(tag, idx)">×</span>
        </span>
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
            v-for="opt in filteredOptions"
            :key="String(opt.value)"
            class="base-cascader__search-item"
            @click="handleSelect(opt, 0)"
          >
            <span class="base-cascader__search-label">{{ opt.label }}</span>
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
            @mouseenter="option.children && option.children.length > 0 && loadChildren(option, level)"
          >
            <!-- 加载中 -->
            <span v-if="loadingLevel === level" class="base-cascader__loading">...</span>
            <span v-else class="base-cascader__item-label">{{ option.label }}</span>
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
