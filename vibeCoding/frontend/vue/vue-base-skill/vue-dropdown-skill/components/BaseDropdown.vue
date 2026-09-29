<template>
  <div
    ref="rootRef"
    class="base-dropdown"
    :class="[
      `base-dropdown--${size}`,
      `base-dropdown--pos-${position}`,
      `base-dropdown--tone-${tone}`,
      {
        'is-open': isOpen,
        'is-disabled': disabled,
        'is-block': block,
      },
    ]"
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
  >
    <!-- Trigger -->
    <div
      ref="triggerRef"
      class="base-dropdown__trigger"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-haspopup="'listbox'"
      :tabindex="disabled ? -1 : 0"
      @click="onTriggerClick"
      @keydown.enter.prevent="onTriggerClick"
      @keydown.space.prevent="onTriggerClick"
      @keydown.esc="close"
    >
      <span class="base-dropdown__trigger-text">
        <slot name="trigger">{{ triggerText }}</slot>
      </span>
      <span class="base-dropdown__trigger-icon" aria-hidden="true"></span>
    </div>

    <!-- Panel -->
    <div
      v-show="isOpen"
      ref="panelRef"
      class="base-dropdown__panel"
      role="listbox"
    >
      <div class="base-dropdown__panel-body">
        <!-- dropdown 模式：菜单项 -->
        <template v-if="effectiveMode === 'dropdown'">
          <div v-if="!options || options.length === 0" class="base-dropdown__empty">
            <slot name="empty">暂无菜单项</slot>
          </div>
          <template v-else>
            <div
              v-for="(opt, idx) in options"
              :key="String(opt.value ?? idx)"
              class="base-dropdown__item"
              :class="{
                'is-active': activeIndex === idx,
                'is-disabled': opt.disabled,
                'base-dropdown__item--danger': opt.danger,
              }"
              role="option"
              :aria-selected="isSelected(opt.value)"
              :aria-disabled="opt.disabled"
              @click="!opt.disabled && onSelect(opt, idx)"
              @mouseenter="activeIndex = idx"
            >
              <span class="base-dropdown__item-text">
                <slot name="item" :option="opt" :index="idx">{{ opt.label }}</slot>
              </span>
              <span v-if="opt.suffix" class="base-dropdown__item-suffix">{{ opt.suffix }}</span>
            </div>
          </template>
        </template>

        <!-- 其他 mode 暂未实现（props 预留，文档化但不写实现） -->
        <template v-else>
          <div class="base-dropdown__empty">
            <slot name="empty">
              当前 mode=<span class="base-dropdown__empty-tag">{{ effectiveMode }}</span> 暂未实现，本组件 MVP 仅支持 dropdown 模式。
            </slot>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface DropdownOption {
  label: string
  value?: string | number | null
  disabled?: boolean
  danger?: boolean
  suffix?: string
  divider?: boolean
}

export interface BaseDropdownProps {
  /** 组件模式（MVP 仅实现 dropdown；其他 mode 作为 props 预留） */
  mode?: 'dropdown' | 'popover' | 'select' | 'multi-select' | 'menu'
  /** v-model 绑定值（dropdown 模式可绑定选中项 value，亦可为 null） */
  modelValue?: string | number | null
  /** 选项列表 */
  options?: DropdownOption[]
  /** 占位文字 */
  placeholder?: string
  /** 触发方式（MVP 支持 click / hover） */
  trigger?: 'click' | 'hover' | 'focus' | 'manual' | 'contextmenu'
  /** 浮层位置（12 种） */
  position?: string
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 色调（影响 panel 顶边） */
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  /** 禁用 */
  disabled?: boolean
  /** trigger 撑满父容器 */
  block?: boolean
  /** 点击外部关闭 */
  closeOnClickOutside?: boolean
  /** 按 Esc 关闭 */
  closeOnEsc?: boolean
}

const props = withDefaults(defineProps<BaseDropdownProps>(), {
  mode: 'dropdown',
  modelValue: null,
  options: () => [] as DropdownOption[],
  placeholder: '请选择',
  trigger: 'click',
  position: 'bottom-start',
  size: 'md',
  tone: 'neutral',
  disabled: false,
  block: false,
  closeOnClickOutside: true,
  closeOnEsc: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'update:open': [open: boolean]
  change: [option: DropdownOption, index: number]
  'visible-change': [open: boolean]
  'click-outside': [event: MouseEvent]
}>()

const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const activeIndex = ref(-1)

// MVP 只支持 dropdown 模式；其他 mode 后续扩展
const effectiveMode = computed(() => props.mode)

const triggerText = computed(() => {
  if (props.modelValue == null) return props.placeholder
  const sel = props.options.find((o) => o.value === props.modelValue)
  return sel?.label ?? String(props.modelValue)
})

function isSelected(value: string | number | null | undefined) {
  return props.modelValue === value
}

function setOpen(next: boolean) {
  if (isOpen.value === next) return
  isOpen.value = next
  emit('update:open', next)
  emit('visible-change', next)
}

function toggle() {
  if (props.disabled) return
  setOpen(!isOpen.value)
}

function open() {
  if (props.disabled) return
  setOpen(true)
}

function close() {
  setOpen(false)
}

function onTriggerClick() {
  if (props.disabled) return
  if (props.trigger === 'hover') return
  toggle()
}

function onTriggerEnter() {
  if (props.disabled) return
  if (props.trigger === 'hover') open()
}

function onTriggerLeave() {
  if (props.trigger === 'hover') close()
}

function onSelect(opt: DropdownOption, idx: number) {
  if (opt.disabled) return
  emit('update:modelValue', (opt.value ?? null) as string | number | null)
  emit('change', opt, idx)
  setOpen(false)
}

function onClickOutside(e: MouseEvent) {
  if (!isOpen.value) return
  const root = rootRef.value
  if (root && !root.contains(e.target as Node)) {
    setOpen(false)
    emit('click-outside', e)
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (props.closeOnEsc && e.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  if (props.closeOnClickOutside) {
    document.addEventListener('click', onClickOutside)
  }
  document.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeyDown)
})

watch(
  () => props.disabled,
  (val) => {
    if (val) close()
  },
)
</script>

<style scoped>
.base-dropdown {
  position: relative;
  display: inline-block;
  vertical-align: top;
}

.base-dropdown.is-block {
  display: block;
  width: 100%;
}

/* ===== Trigger ===== */
.base-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2, 8px);
  padding: var(--space-2, 8px) var(--space-4, 16px);
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #d9d9d9);
  border-radius: var(--radius-md, 6px);
  font-size: var(--font-size-base, 14px);
  color: var(--color-text, #333333);
  cursor: pointer;
  user-select: none;
  transition: border-color var(--transition-fast, 0.15s),
    box-shadow var(--transition-fast, 0.15s);
  min-width: 120px;
  width: 100%;
  font-family: inherit;
  outline: none;
}

.base-dropdown.is-block > .base-dropdown__trigger {
  width: 100%;
}

.base-dropdown__trigger:hover {
  border-color: var(--color-primary, #1890ff);
}

.base-dropdown.is-open > .base-dropdown__trigger {
  border-color: var(--color-primary, #1890ff);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--color-primary, #1890ff) 12%, transparent);
}

.base-dropdown__trigger:focus-visible {
  border-color: var(--color-primary, #1890ff);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--color-primary, #1890ff) 18%, transparent);
}

.base-dropdown.is-disabled > .base-dropdown__trigger {
  background: var(--color-bg, #f5f5f5);
  color: var(--color-text-placeholder, #999999);
  cursor: not-allowed;
  border-color: var(--color-border-light, #e8e8e8);
}

.base-dropdown__trigger-text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.base-dropdown__trigger-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-right: 2px solid var(--color-text-placeholder, #999999);
  border-bottom: 2px solid var(--color-text-placeholder, #999999);
  transform: rotate(45deg) translate(-2px, -2px);
  transition: transform var(--transition-base, 0.2s);
}

.base-dropdown.is-open > .base-dropdown__trigger .base-dropdown__trigger-icon {
  transform: rotate(-135deg) translate(-2px, -2px);
}

/* ===== Panel ===== */
.base-dropdown__panel {
  position: absolute;
  z-index: 100;
  min-width: 180px;
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-md, 6px);
  box-shadow: var(--shadow-lg, 0 6px 16px rgba(0, 0, 0, 0.12));
  border: 1px solid var(--color-border-light, #e8e8e8);
  overflow: hidden;
  border-top-width: 3px;
}

/* ===== Position ===== */
.base-dropdown--pos-bottom-start > .base-dropdown__panel {
  top: calc(100% + 6px);
  left: 0;
}
.base-dropdown--pos-bottom > .base-dropdown__panel {
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
}
.base-dropdown--pos-bottom-end > .base-dropdown__panel {
  top: calc(100% + 6px);
  right: 0;
}
.base-dropdown--pos-top-start > .base-dropdown__panel {
  bottom: calc(100% + 6px);
  left: 0;
}
.base-dropdown--pos-top > .base-dropdown__panel {
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
}
.base-dropdown--pos-top-end > .base-dropdown__panel {
  bottom: calc(100% + 6px);
  right: 0;
}
.base-dropdown--pos-left-start > .base-dropdown__panel {
  right: calc(100% + 6px);
  top: 0;
}
.base-dropdown--pos-left > .base-dropdown__panel {
  right: calc(100% + 6px);
  top: 50%;
  transform: translateY(-50%);
}
.base-dropdown--pos-left-end > .base-dropdown__panel {
  right: calc(100% + 6px);
  bottom: 0;
}
.base-dropdown--pos-right-start > .base-dropdown__panel {
  left: calc(100% + 6px);
  top: 0;
}
.base-dropdown--pos-right > .base-dropdown__panel {
  left: calc(100% + 6px);
  top: 50%;
  transform: translateY(-50%);
}
.base-dropdown--pos-right-end > .base-dropdown__panel {
  left: calc(100% + 6px);
  bottom: 0;
}

.base-dropdown__panel-body {
  padding: var(--space-2, 8px);
  max-height: 280px;
  overflow-y: auto;
}

/* ===== Tone ===== */
.base-dropdown--tone-primary > .base-dropdown__panel {
  border-top-color: var(--color-primary, #1890ff);
}
.base-dropdown--tone-success > .base-dropdown__panel {
  border-top-color: var(--color-success, #52c41a);
}
.base-dropdown--tone-warning > .base-dropdown__panel {
  border-top-color: var(--color-warning, #faad14);
}
.base-dropdown--tone-danger > .base-dropdown__panel {
  border-top-color: var(--color-danger, #ff4d4f);
}

/* ===== Items ===== */
.base-dropdown__item {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-2, 8px) var(--space-3, 12px);
  font-size: var(--font-size-base, 14px);
  color: var(--color-text, #333333);
  border-radius: var(--radius-sm, 2px);
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-fast, 0.15s);
}

.base-dropdown__item:hover,
.base-dropdown__item.is-active {
  background: var(--color-bg, #f5f5f5);
}

.base-dropdown__item--danger {
  color: var(--color-danger, #ff4d4f);
}

.base-dropdown__item.is-disabled {
  color: var(--color-text-placeholder, #999999);
  cursor: not-allowed;
  pointer-events: none;
}

.base-dropdown__item-text {
  flex: 1;
}

.base-dropdown__item-suffix {
  color: var(--color-text-placeholder, #999999);
  font-size: var(--font-size-sm, 12px);
}

.base-dropdown__empty {
  padding: var(--space-4, 16px);
  text-align: center;
  color: var(--color-text-placeholder, #999999);
  font-size: var(--font-size-sm, 12px);
}

.base-dropdown__empty-tag {
  font-weight: var(--weight-semibold, 600);
  color: var(--color-primary, #1890ff);
}

/* ===== Size ===== */
.base-dropdown--sm > .base-dropdown__trigger {
  padding: 4px var(--space-2, 8px);
  font-size: var(--font-size-sm, 12px);
  min-width: 80px;
}

.base-dropdown--lg > .base-dropdown__trigger {
  padding: var(--space-3, 12px) var(--space-5, 20px);
  font-size: var(--font-size-lg, 16px);
  min-width: 160px;
}
</style>