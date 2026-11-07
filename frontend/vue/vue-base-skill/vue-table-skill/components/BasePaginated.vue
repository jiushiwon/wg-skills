<template>
  <div v-if="totalPages > 0" class="base-paginated" :class="[`base-paginated--${size}`, `base-paginated--${position}`]" role="navigation" aria-label="分页">
    <span v-if="showTotal" class="base-paginated__total">
      共 <strong>{{ total }}</strong> 条
    </span>

    <!-- 每页大小切换（无 select） -->
    <div v-if="showSizeChanger" class="base-paginated__size-changer">
      <div
        class="base-paginated__size-select"
        tabindex="0"
        @click="sizeSelectOpen = !sizeSelectOpen"
        @blur="onSizeBlur"
      >
        <span class="base-paginated__size-select-label">{{ pageSize }} 条/页</span>
        <span class="base-paginated__size-select-arrow" :class="{ 'is-open': sizeSelectOpen }" />
        <div v-if="sizeSelectOpen" class="base-paginated__size-select-panel">
          <div
            v-for="opt in pageSizes"
            :key="opt"
            class="base-paginated__size-select-option"
            :class="{ 'is-active': pageSize === opt }"
            @mousedown.prevent="selectSize(opt)"
          >
            {{ opt }} 条/页
          </div>
        </div>
      </div>
    </div>

    <!-- 控件组 -->
    <div class="base-paginated__controls">
      <div
        class="base-paginated__btn"
        :class="{ 'is-disabled': page <= 1 }"
        role="button"
        tabindex="0"
        aria-label="上一页"
        @click="go(page - 1)"
        @keydown.enter.prevent="go(page - 1)"
        @keydown.space.prevent="go(page - 1)"
      >
        ‹
      </div>

      <div
        v-for="(item, idx) in displayPages"
        :key="`${item.value}-${idx}`"
        class="base-paginated__btn"
        :class="{ 'is-active': item.value === page, 'is-disabled': item.disabled }"
        role="button"
        :aria-current="item.value === page ? 'page' : undefined"
        tabindex="0"
        @click="!item.disabled && go(item.value)"
        @keydown.enter.prevent="!item.disabled && go(item.value)"
        @keydown.space.prevent="!item.disabled && go(item.value)"
      >
        {{ item.label }}
      </div>

      <div
        class="base-paginated__btn"
        :class="{ 'is-disabled': page >= totalPages }"
        role="button"
        tabindex="0"
        aria-label="下一页"
        @click="go(page + 1)"
        @keydown.enter.prevent="go(page + 1)"
        @keydown.space.prevent="go(page + 1)"
      >
        ›
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// ponytail: 仅实现经典模式 + 每页大小切换。dropdown / simple / scroll 模式作为 props 预留但未实现。
export interface BasePaginatedProps {
  total: number
  page: number
  pageSize: number
  pageSizes?: number[]
  showSizeChanger?: boolean
  showTotal?: boolean
  size?: 'sm' | 'md' | 'lg'
  position?: 'left' | 'center' | 'right'
  disabled?: boolean
  hideOnSinglePage?: boolean
  mode?: 'classic' | 'simple'
}

const props = withDefaults(defineProps<BasePaginatedProps>(), {
  pageSizes: () => [10, 20, 50, 100],
  showSizeChanger: false,
  showTotal: false,
  size: 'md',
  position: 'right',
  disabled: false,
  hideOnSinglePage: false,
  mode: 'classic',
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [size: number]
  change: [page: number, pageSize: number]
}>()

const sizeSelectOpen = ref(false)

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

interface PageItem {
  label: string
  value: number
  disabled: boolean
}

const displayPages = computed<PageItem[]>(() => {
  const total = totalPages.value
  const cur = props.page
  const delta = 2
  const items: PageItem[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push({ label: String(i), value: i, disabled: false })
    return items
  }

  items.push({ label: '1', value: 1, disabled: false })
  if (cur - delta > 2) items.push({ label: '...', value: -1, disabled: true })
  for (let i = Math.max(2, cur - delta); i <= Math.min(total - 1, cur + delta); i++) {
    items.push({ label: String(i), value: i, disabled: false })
  }
  if (cur + delta < total - 1) items.push({ label: '...', value: -1, disabled: true })
  items.push({ label: String(total), value: total, disabled: false })
  return items
})

function go(target: number): void {
  if (props.disabled) return
  if (target < 1 || target > totalPages.value || target === props.page) return
  emit('update:page', target)
  emit('change', target, props.pageSize)
}

function selectSize(size: number): void {
  sizeSelectOpen.value = false
  if (size === props.pageSize) return
  emit('update:pageSize', size)
  emit('update:page', 1)
  emit('change', 1, size)
}

function onSizeBlur(): void {
  // ponytail: 用 setTimeout 让 mousedown.prevent 先触发
  setTimeout(() => (sizeSelectOpen.value = false), 150)
}
</script>

<style scoped>
.base-paginated {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-3, 12px) 0;
  font-size: var(--font-size-sm, 14px);
  flex-wrap: wrap;
}

.base-paginated--left { justify-content: flex-start; }
.base-paginated--center { justify-content: center; }
.base-paginated--right { justify-content: flex-end; }

.base-paginated__total {
  color: var(--color-text-secondary, #606266);
}
.base-paginated__total strong {
  color: var(--color-text, #303133);
  font-weight: 600;
  margin: 0 var(--space-1, 4px);
}

.base-paginated__size-changer {
  display: inline-flex;
}

.base-paginated__size-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  min-width: 100px;
  padding: 0 var(--space-3, 12px);
  height: var(--height-button-md, 32px);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 4px);
  background: var(--color-surface, #fff);
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: border-color var(--transition-fast, 0.15s);
}

.base-paginated__size-select:hover,
.base-paginated__size-select:focus-visible {
  border-color: var(--color-primary, #409eff);
}

.base-paginated__size-select-arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  margin-left: var(--space-2, 8px);
  transition: transform var(--transition-fast, 0.15s);
  opacity: 0.6;
}

.base-paginated__size-select-arrow.is-open {
  transform: rotate(180deg);
}

.base-paginated__size-select-panel {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #ebeef5);
  border-radius: var(--radius-md, 4px);
  box-shadow: var(--shadow-lg, 0 4px 12px rgba(0,0,0,0.12));
  padding: var(--space-1, 4px) 0;
  z-index: 10;
}

.base-paginated__size-select-option {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  cursor: pointer;
  transition: background-color var(--transition-fast, 0.15s);
}

.base-paginated__size-select-option:hover {
  background: var(--color-background, #f5f7fa);
}

.base-paginated__size-select-option.is-active {
  background: var(--color-primary-light, #ecf5ff);
  color: var(--color-primary, #409eff);
  font-weight: 600;
}

.base-paginated__controls {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);
}

.base-paginated__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--height-button-md, 32px);
  height: var(--height-button-md, 32px);
  padding: 0 var(--space-2, 8px);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 4px);
  background: var(--color-surface, #fff);
  color: var(--color-text, #303133);
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-fast, 0.15s);
  font-size: var(--font-size-sm, 14px);
}

.base-paginated__btn:hover:not(.is-disabled):not(.is-active) {
  border-color: var(--color-primary, #409eff);
  color: var(--color-primary, #409eff);
}

.base-paginated__btn.is-active {
  background: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
  color: #fff;
  cursor: default;
}

.base-paginated__btn.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.base-paginated__btn:focus-visible {
  outline: 2px solid var(--color-primary, #409eff);
  outline-offset: 2px;
}

.base-paginated--sm .base-paginated__btn,
.base-paginated--sm .base-paginated__size-select {
  height: var(--height-button-sm, 28px);
  font-size: var(--font-size-xs, 12px);
}
.base-paginated--lg .base-paginated__btn,
.base-paginated--lg .base-paginated__size-select {
  height: var(--height-button-lg, 36px);
  font-size: var(--font-size-base, 16px);
}
</style>
