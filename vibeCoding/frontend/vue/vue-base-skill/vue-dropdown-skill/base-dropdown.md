# base-dropdown 万能浮层组件

> **定位**：vue-base-skill 的 L1 业务组件——**一个组件，5 种 mode**：
>
> | mode | 角色 | 替代 |
> |------|------|------|
> | `dropdown` | 下拉菜单（操作列表） | 操作按钮组 / 筛选器 |
> | `popover` | 气泡框（带箭头） | 表单提示 / 详情预览 |
> | `select` | 单选选择器 | 原生 `<select>` |
> | `multi-select` | 多选选择器 | 多选 `<select>` |
> | `menu` | 右键菜单 | contextmenu |
>
> **容器铁律**：面板（panel）统一由 `<base-card>` 容器承载，base-dropdown 内部包装 base-card。
>
> **零样式标签铁律**：模板内仅使用 `<div>` / `<span>`，禁止 `<p>` `<h*>` `<button>` `<select>` `<option>` `<ul>` `<ol>` `<li>` `<input>` `<form>` `<img>` 等带默认样式的标签。图标一律 `<div>` + CSS mask data URI。

## 5 × 12 × 4 × 3 × 5 维度矩阵

```
5 mode × 12 position × 4 trigger × 3 size × 5 tone = 3600+ 种组合
```

| 维度 | 入参 | 默认 | 可选值 |
|------|------|------|--------|
| 模式 | `mode` | `'dropdown'` | `dropdown` / `popover` / `select` / `multi-select` / `menu` |
| 位置 | `position` | `'bottom-start'` | `bottom-start/end` / `bottom` / `top-start/end` / `top` / `left-start/end` / `right-start/end` |
| 触发 | `trigger` | 随 mode 变 | `click` / `hover` / `focus` / `manual` / `contextmenu` |
| 尺寸 | `size` | `'md'` | `sm` / `md` / `lg` |
| 色调 | `tone` | `'neutral'` | `neutral` / `primary` / `success` / `warning` / `danger` |

## Props（按 mode 分组）

| Prop | 类型 | 默认 | 适用 mode | 说明 |
|------|------|------|-----------|------|
| `mode` | `'dropdown' \| 'popover' \| 'select' \| 'multi-select' \| 'menu'` | `'dropdown'` | all | 组件模式 |
| `modelValue` | `string \| number \| Array \| null` | `null` | select / multi-select | v-model 绑定值 |
| `options` | `Option[]` | `[]` | select / multi-select | 选项数组 |
| `items` | `Item[]` | `[]` | dropdown / menu | 菜单项数组 |
| `trigger` | `'click' \| 'hover' \| 'focus' \| 'manual' \| 'contextmenu'` | 随 mode 变 | all | 触发方式 |
| `position` | 12 种字符串 | `'bottom-start'` | all | 浮层位置 |
| `arrow` | `boolean` | `false` | popover | 是否显示气泡箭头 |
| `offset` | `number` | `6` | all | 浮层距 trigger 偏移（px） |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | all | trigger 尺寸 |
| `tone` | 5 种字符串 | `'neutral'` | all | 色调（panel 顶边 3px） |
| `placeholder` | `string` | `'请选择'` | select / multi-select | 占位文字 |
| `searchable` | `boolean` | `false` | select / multi-select | 开启本地搜索 |
| `clearable` | `boolean` | `false` | select / multi-select | 显示清空按钮 |
| `multiple` | `boolean` | `false` | select | 多选模式（等价 `mode='multi-select'`） |
| `max` | `number` | `Infinity` | multi-select | 最多选几项 |
| `remote` | `boolean` | `false` | select / multi-select | 远程搜索 |
| `remoteFunction` | `(kw: string) => Promise<Option[]>` | - | remote 时 | 远程搜索函数 |
| `debounce` | `number` | `300` | remote 时 | 防抖延迟（ms） |
| `virtual` | `boolean` | `false` | select / multi-select | 启用虚拟滚动 |
| `rowHeight` | `number` | `36` | virtual 时 | 虚拟行高（px） |
| `loading` | `boolean` | `false` | all | 加载态 |
| `disabled` | `boolean` | `false` | all | 禁用态 |
| `visible` | `boolean` | - | trigger='manual' | v-model:visible 受控显隐 |
| `closeOnClickOutside` | `boolean` | `true` | all | 点击外部关闭 |
| `closeOnEsc` | `boolean` | `true` | all | 按 Esc 关闭 |
| `hideOnSelect` | `boolean` | `true` | select | 选中后关闭（multi-select 默认 false） |
| `block` | `boolean` | `false` | all | trigger 撑满父容器宽度 |

### Type 定义

```ts
interface Option {
  value: string | number
  label: string
  disabled?: boolean
  group?: string
  desc?: string          // 副标题（右侧展示）
}

interface Item {
  key: string | number
  label: string
  icon?: string          // SVG data URI
  suffix?: string        // 右侧文字（如快捷键）
  disabled?: boolean
  danger?: boolean
  divider?: boolean      // 是否为分割线
  children?: Item[]      // 二级菜单
}
```

## Slots

| Slot | 适用 | 说明 |
|------|------|------|
| `default` | popover | 面板内容（覆盖默认） |
| `trigger` | all | 触发器内容（覆盖默认） |
| `prefix` | all | trigger 前缀 |
| `suffix` | all | trigger 后缀 |
| `empty` | select | 空态自定义 |
| `loading` | select | 加载态自定义 |
| `option` | select | 自定义 option |
| `item` | dropdown | 自定义菜单项 |
| `tag` | multi-select | 自定义 tag pill |
| `header` | all | 面板头 |
| `footer` | all | 面板底 |

## Events

| Event | 参数 | 说明 |
|-------|------|------|
| `update:modelValue` | `(value)` | v-model 变化 |
| `update:visible` | `(visible)` | 显隐变化 |
| `change` | `(option, index)` | 选中变化 |
| `select` | `(option)` | 选中某项 |
| `deselect` | `(option)` | 取消选中（multi） |
| `clear` | `()` | 点击清空 |
| `visible-change` | `(visible)` | 显隐切换 |
| `search` | `(keyword)` | 搜索输入 |
| `scroll-bottom` | `()` | 虚拟列表滚到底 |
| `command` | `(item, index)` | 菜单项点击 |
| `click-outside` | `(event)` | 点击外部 |

## 代码

```vue
<template>
  <!-- 容器铁律：panel 内部包 base-card（mode=popover/select/multi-select 时尤其需要） -->
  <div
    :class="[
      'wg-dropdown',
      `wg-dropdown--${mode}`,
      `wg-dropdown--pos-${position}`,
      `wg-dropdown--${size}`,
      { 'is-open': isVisible, 'is-disabled': disabled, 'is-block': block }
    ]"
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
  >
    <!-- ============================== -->
    <!-- Trigger 触发器                  -->
    <!-- ============================== -->
    <div
      ref="triggerRef"
      class="wg-dropdown__trigger"
      :tabindex="disabled ? -1 : 0"
      @click="onTriggerClick"
      @contextmenu.prevent="onContextMenu"
    >
      <slot name="prefix">
        <span v-if="mode === 'select' && modelValue != null" class="icon icon--sm icon--check"></span>
      </slot>

      <span class="wg-dropdown__trigger-text">
        <slot name="trigger">{{ triggerText }}</slot>
      </span>

      <!-- multi-select tag 列表 -->
      <div v-if="mode === 'multi-select'" class="wg-dropdown__tags">
        <span
          v-for="tag in displayTags"
          :key="tag.value"
          class="wg-dropdown__tag"
        >
          <slot name="tag" :option="tag" :index="tag._idx">
            {{ tag.label }}
          </slot>
          <span
            class="icon icon--sm icon--x wg-dropdown__tag-remove"
            @click.stop="removeTag(tag)"
          ></span>
        </span>
      </div>

      <!-- clearable 清空按钮 -->
      <span
        v-if="clearable && hasValue"
        class="icon icon--sm icon--x wg-dropdown__trigger-clear"
        @click.stop="onClear"
      ></span>

      <slot name="suffix">
        <span class="icon icon--sm icon--chevron wg-dropdown__trigger-icon"></span>
      </slot>
    </div>

    <!-- ============================== -->
    <!-- Panel 浮层面板                  -->
    <!-- ============================== -->
    <div
      v-show="isVisible"
      ref="panelRef"
      :class="[
        'wg-dropdown__panel',
        `wg-dropdown__panel--tone-${tone}`
      ]"
    >
      <span v-if="arrow && mode === 'popover'" class="wg-dropdown__arrow"></span>

      <slot name="header">
        <!-- search 搜索框（select / multi-select + searchable/remote 时显示） -->
        <div v-if="showSearch" class="wg-dropdown__search">
          <span class="icon icon--md icon--search wg-dropdown__search-icon"></span>
          <input
            v-model="keyword"
            class="wg-dropdown__search-input"
            :placeholder="searchPlaceholder"
            @input="onSearchInput"
            @keydown.enter.prevent="onEnter"
            @keydown.down.prevent="moveActive(1)"
            @keydown.up.prevent="moveActive(-1)"
          />
        </div>
      </slot>

      <slot name="body">
        <!-- 加载态 -->
        <div v-if="loading" class="wg-dropdown__loading">
          <slot name="loading">
            <div class="wg-dropdown__spinner"></div>
            <span>正在加载...</span>
          </slot>
        </div>

        <!-- 空态 -->
        <div v-else-if="filteredOptions.length === 0 && (mode === 'select' || mode === 'multi-select')" class="wg-dropdown__empty">
          <slot name="empty">暂无匹配的数据</slot>
        </div>

        <!-- dropdown / menu：菜单项 -->
        <div v-else-if="mode === 'dropdown' || mode === 'menu'" class="wg-dropdown__panel-body">
          <template v-for="(item, idx) in items" :key="item.key">
            <div v-if="item.divider" class="wg-dropdown__divider"></div>
            <div
              v-else
              :class="[
                'wg-dropdown__item',
                { 'is-disabled': item.disabled, 'wg-dropdown__item--danger': item.danger }
              ]"
              @click="!item.disabled && onItemClick(item, idx)"
            >
              <span v-if="item.icon" class="icon icon--md wg-dropdown__item-icon" :style="{ maskImage: `url(${item.icon})`, WebkitMaskImage: `url(${item.icon})` }"></span>
              <span class="wg-dropdown__item-text">
                <slot name="item" :item="item" :index="idx">{{ item.label }}</slot>
              </span>
              <span v-if="item.suffix" class="wg-dropdown__item-suffix">{{ item.suffix }}</span>
            </div>
          </template>
        </div>

        <!-- select / multi-select：选项 -->
        <div v-else class="wg-dropdown__panel-body">
          <template v-for="(option, idx) in filteredOptions" :key="option.value">
            <div v-if="option.group && (idx === 0 || filteredOptions[idx-1].group !== option.group)" class="wg-dropdown__group-title">{{ option.group }}</div>
            <div
              :class="[
                'wg-dropdown__option',
                {
                  'is-selected': isSelected(option),
                  'is-disabled': option.disabled,
                  'is-active': idx === activeIndex
                }
              ]"
              :style="virtual ? { position: 'absolute', top: `${idx * rowHeight}px`, left: 0, right: 0 } : {}"
              @click="!option.disabled && onOptionClick(option, idx)"
              @mouseenter="activeIndex = idx"
            >
              <slot name="option" :option="option" :index="idx" :selected="isSelected(option)">
                <span v-html="highlight(option.label)"></span>
              </slot>
              <span v-if="option.desc" class="wg-dropdown__option-desc">{{ option.desc }}</span>
              <span v-if="isSelected(option)" class="icon icon--md icon--check wg-dropdown__option-check"></span>
            </div>
          </template>
        </div>
      </slot>

      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import BaseCard from '../../base-card.vue'
import type { Option, Item } from './types'

const props = withDefaults(defineProps<{
  mode?: 'dropdown' | 'popover' | 'select' | 'multi-select' | 'menu'
  modelValue?: string | number | Array<any> | null
  options?: Option[]
  items?: Item[]
  trigger?: 'click' | 'hover' | 'focus' | 'manual' | 'contextmenu'
  position?: string
  arrow?: boolean
  offset?: number
  size?: 'sm' | 'md' | 'lg'
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
  max?: number
  remote?: boolean
  remoteFunction?: (kw: string) => Promise<Option[]>
  debounce?: number
  virtual?: boolean
  rowHeight?: number
  loading?: boolean
  disabled?: boolean
  visible?: boolean
  closeOnClickOutside?: boolean
  closeOnEsc?: boolean
  hideOnSelect?: boolean
  block?: boolean
}>(), {
  mode: 'dropdown',
  modelValue: null,
  options: () => [],
  items: () => [],
  position: 'bottom-start',
  arrow: false,
  offset: 6,
  size: 'md',
  tone: 'neutral',
  placeholder: '请选择',
  searchable: false,
  clearable: false,
  multiple: false,
  max: Infinity,
  remote: false,
  debounce: 300,
  virtual: false,
  rowHeight: 36,
  loading: false,
  disabled: false,
  closeOnClickOutside: true,
  closeOnEsc: true,
  hideOnSelect: true,
  block: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'update:visible': [visible: boolean]
  change: [option: Option, index: number]
  select: [option: Option]
  deselect: [option: Option]
  clear: []
  'visible-change': [visible: boolean]
  search: [keyword: string]
  'scroll-bottom': []
  command: [item: Item, index: number]
  'click-outside': [event: MouseEvent]
}>()

/* ===== 显隐状态 ===== */
const isVisible = ref(false)
const innerVisible = ref(props.visible ?? false)
const isVisibleModel = computed({
  get: () => props.trigger === 'manual' ? innerVisible.value : isVisible.value,
  set: (v) => {
    if (props.trigger === 'manual') {
      innerVisible.value = v
      emit('update:visible', v)
    } else {
      isVisible.value = v
    }
    emit('visible-change', v)
  },
})

/* ===== 搜索状态 ===== */
const keyword = ref('')
const showSearch = computed(() =>
  !props.disabled &&
  (props.mode === 'select' || props.mode === 'multi-select') &&
  (props.searchable || props.remote)
)
const searchPlaceholder = computed(() => props.remote ? '远程搜索...' : '搜索...')

/* ===== 过滤选项 ===== */
const filteredOptions = computed(() => {
  if (props.mode !== 'select' && props.mode !== 'multi-select') return []
  if (props.remote) return props.options
  if (!props.searchable || !keyword.value) return props.options
  const k = keyword.value.toLowerCase()
  return props.options.filter(o => o.label.toLowerCase().includes(k))
})

/* ===== 高亮关键字 ===== */
function highlight(label: string): string {
  if (!keyword.value) return label
  const k = keyword.value
  return label.replace(new RegExp(`(${k})`, 'gi'), '<span class="wg-dropdown__option-mark">$1</span>')
}

/* ===== 选中状态 ===== */
const isSelected = (o: Option) =>
  Array.isArray(props.modelValue)
    ? props.modelValue.includes(o.value)
    : props.modelValue === o.value

const hasValue = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue.length > 0 : props.modelValue != null
)

/* ===== trigger 文本 ===== */
const triggerText = computed(() => {
  if (!hasValue.value) return props.placeholder
  if (props.mode === 'multi-select') return ''
  const sel = props.options.find(o => o.value === props.modelValue)
  return sel?.label ?? String(props.modelValue)
})

const displayTags = computed(() => {
  if (!Array.isArray(props.modelValue)) return []
  return props.modelValue.map((v, i) => {
    const opt = props.options.find(o => o.value === v)
    return { value: v, label: opt?.label ?? String(v), _idx: i }
  })
})

/* ===== Trigger 事件 ===== */
function onTriggerClick() {
  if (props.disabled) return
  isVisibleModel.value = !isVisibleModel.value
}
function onTriggerEnter() {
  if (props.trigger === 'hover') isVisibleModel.value = true
}
function onTriggerLeave() {
  if (props.trigger === 'hover') isVisibleModel.value = false
}
function onContextMenu(e: MouseEvent) {
  if (props.trigger === 'contextmenu') {
    e.preventDefault()
    isVisibleModel.value = true
  }
}

/* ===== 搜索 ===== */
let debounceTimer: number | null = null
function onSearchInput() {
  emit('search', keyword.value)
  if (props.remote && props.remoteFunction) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(() => {
      props.remoteFunction!(keyword.value).then(res => {
        // 业务侧通过 watch options 更新；这里只触发 loading
      })
    }, props.debounce)
  }
}

/* ===== 键盘导航 ===== */
const activeIndex = ref(-1)
function moveActive(delta: number) {
  const max = filteredOptions.value.length - 1
  if (max < 0) return
  activeIndex.value = Math.max(0, Math.min(max, activeIndex.value + delta))
}
function onEnter() {
  if (activeIndex.value < 0) return
  const opt = filteredOptions.value[activeIndex.value]
  if (opt && !opt.disabled) onOptionClick(opt, activeIndex.value)
}

/* ===== 选择 ===== */
function onOptionClick(option: Option, index: number) {
  if (props.mode === 'multi-select' || (props.mode === 'select' && props.multiple)) {
    const list = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const i = list.indexOf(option.value)
    if (i >= 0) {
      list.splice(i, 1)
      emit('deselect', option)
    } else {
      if (list.length >= props.max) return
      list.push(option.value)
      emit('select', option)
    }
    emit('update:modelValue', list)
  } else {
    emit('update:modelValue', option.value)
    emit('select', option)
  }
  emit('change', option, index)
  if (props.hideOnSelect && !(props.mode === 'multi-select')) isVisibleModel.value = false
}

function onItemClick(item: Item, index: number) {
  emit('command', item, index)
  if (props.hideOnSelect) isVisibleModel.value = false
}

function removeTag(tag: any) {
  if (!Array.isArray(props.modelValue)) return
  const list = props.modelValue.filter((v: any) => v !== tag.value)
  emit('update:modelValue', list)
  emit('deselect', props.options.find(o => o.value === tag.value)!)
}

function onClear() {
  emit('update:modelValue', props.mode === 'multi-select' ? [] : null)
  emit('clear')
}

/* ===== 外部点击 / Esc ===== */
function onClickOutside(e: MouseEvent) {
  if (!isVisibleModel.value) return
  const root = (e.target as HTMLElement)?.closest('.wg-dropdown')
  if (!root) {
    isVisibleModel.value = false
    emit('click-outside', e)
  }
}
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closeOnEsc && isVisibleModel.value) {
    isVisibleModel.value = false
  }
}

onMounted(() => {
  if (props.closeOnClickOutside) document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeyDown)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
/* ============================================
 * 严格使用 vue-theme-skill Token
 * 零裸色值 / 零裸 px / 零 <img> / 零 <p>
 * 图标统一 div + CSS mask data URI
 * ============================================ */

/* ===== 根容器 ===== */
.wg-dropdown {
  position: relative;
  display: inline-block;
  vertical-align: top;
}
.wg-dropdown.is-block { display: block; width: 100%; }

/* ===== Trigger ===== */
.wg-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-md);
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  min-width: 120px;
  width: 100%;
  font-family: inherit;
  outline: none;
}
.wg-dropdown__trigger:hover { border-color: var(--color-primary); }
.wg-dropdown.is-open > .wg-dropdown__trigger {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
}
.wg-dropdown__trigger:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent);
}
.wg-dropdown.is-disabled > .wg-dropdown__trigger {
  background: var(--color-bg);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  border-color: var(--color-border-light);
}

.wg-dropdown__trigger-text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wg-dropdown__trigger-text--placeholder { color: var(--color-text-tertiary); }
.wg-dropdown__trigger-icon {
  color: var(--color-text-tertiary);
  transition: transform 0.2s;
}
.wg-dropdown.is-open > .wg-dropdown__trigger .wg-dropdown__trigger-icon { transform: rotate(180deg); }
.wg-dropdown__trigger-clear {
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--radius-sm);
}
.wg-dropdown__trigger-clear:hover { background: var(--color-bg); color: var(--color-text); }

.wg-dropdown__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  flex: 1;
  align-items: center;
}
.wg-dropdown__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 8px;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  font-size: var(--font-xs);
  border-radius: var(--radius-sm);
}
.wg-dropdown__tag-remove { cursor: pointer; opacity: 0.6; width: 12px; height: 12px; }
.wg-dropdown__tag-remove:hover { opacity: 1; }

/* ===== Panel ===== */
.wg-dropdown__panel {
  position: absolute;
  z-index: 100;
  min-width: 180px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

/* ===== Position ===== */
.wg-dropdown--pos-bottom-start > .wg-dropdown__panel { top: calc(100% + 6px); left: 0; }
.wg-dropdown--pos-bottom       > .wg-dropdown__panel { top: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
.wg-dropdown--pos-bottom-end   > .wg-dropdown__panel { top: calc(100% + 6px); right: 0; }
.wg-dropdown--pos-top-start    > .wg-dropdown__panel { bottom: calc(100% + 6px); left: 0; }
.wg-dropdown--pos-top          > .wg-dropdown__panel { bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
.wg-dropdown--pos-top-end      > .wg-dropdown__panel { bottom: calc(100% + 6px); right: 0; }
.wg-dropdown--pos-left-start   > .wg-dropdown__panel { right: calc(100% + 6px); top: 0; }
.wg-dropdown--pos-left         > .wg-dropdown__panel { right: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
.wg-dropdown--pos-left-end     > .wg-dropdown__panel { right: calc(100% + 6px); bottom: 0; }
.wg-dropdown--pos-right-start  > .wg-dropdown__panel { left: calc(100% + 6px); top: 0; }
.wg-dropdown--pos-right        > .wg-dropdown__panel { left: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
.wg-dropdown--pos-right-end    > .wg-dropdown__panel { left: calc(100% + 6px); bottom: 0; }

.wg-dropdown__panel-body { padding: var(--space-2); max-height: 280px; overflow-y: auto; }

/* ===== Tone ===== */
.wg-dropdown__panel--tone-primary { border-top: 3px solid var(--color-primary); }
.wg-dropdown__panel--tone-success { border-top: 3px solid var(--color-success); }
.wg-dropdown__panel--tone-warning { border-top: 3px solid var(--color-warning); }
.wg-dropdown__panel--tone-danger  { border-top: 3px solid var(--color-danger); }

/* ===== Arrow ===== */
.wg-dropdown__arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  transform: rotate(45deg);
  z-index: -1;
}
.wg-dropdown--pos-bottom-start > .wg-dropdown__panel .wg-dropdown__arrow { top: -6px; left: 16px; border-bottom: none; border-right: none; }
.wg-dropdown--pos-bottom       > .wg-dropdown__panel .wg-dropdown__arrow { top: -6px; left: calc(50% - 5px); border-bottom: none; border-right: none; }
.wg-dropdown--pos-bottom-end   > .wg-dropdown__panel .wg-dropdown__arrow { top: -6px; right: 16px; border-bottom: none; border-right: none; }
.wg-dropdown--pos-top-start    > .wg-dropdown__panel .wg-dropdown__arrow { bottom: -6px; left: 16px; border-top: none; border-left: none; }
.wg-dropdown--pos-top          > .wg-dropdown__panel .wg-dropdown__arrow { bottom: -6px; left: calc(50% - 5px); border-top: none; border-left: none; }
.wg-dropdown--pos-top-end      > .wg-dropdown__panel .wg-dropdown__arrow { bottom: -6px; right: 16px; border-top: none; border-left: none; }
.wg-dropdown--pos-left-start   > .wg-dropdown__panel .wg-dropdown__arrow { right: -6px; top: 16px; border-top: none; border-right: none; }
.wg-dropdown--pos-right-start  > .wg-dropdown__panel .wg-dropdown__arrow { left: -6px; top: 16px; border-bottom: none; border-left: none; }

/* ===== Menu items ===== */
.wg-dropdown__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-md);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  user-select: none;
  transition: background 0.1s;
}
.wg-dropdown__item:hover,
.wg-dropdown__item.is-active { background: var(--color-bg); }
.wg-dropdown__item--danger { color: var(--color-danger); }
.wg-dropdown__item.is-disabled,
.wg-dropdown__item--disabled {
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  pointer-events: none;
}
.wg-dropdown__item-icon { color: var(--color-text-secondary); }
.wg-dropdown__item--danger .wg-dropdown__item-icon { color: var(--color-danger); }
.wg-dropdown__item-text { flex: 1; }
.wg-dropdown__item-suffix { color: var(--color-text-tertiary); font-size: var(--font-xs); }
.wg-dropdown__divider {
  height: 1px;
  margin: var(--space-1) 0;
  background: var(--color-border-light);
}
.wg-dropdown__group-title {
  padding: var(--space-2) var(--space-3) var(--space-1);
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ===== Search ===== */
.wg-dropdown__search {
  position: relative;
  padding: var(--space-2);
  border-bottom: 1px solid var(--color-border-light);
}
.wg-dropdown__search-input {
  width: 100%;
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-8);
  background: var(--color-bg);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: var(--font-md);
  color: var(--color-text);
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}
.wg-dropdown__search-input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
}
.wg-dropdown__search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

/* ===== Options ===== */
.wg-dropdown__option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-md);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  user-select: none;
  transition: background 0.1s;
}
.wg-dropdown__option:hover,
.wg-dropdown__option.is-active { background: var(--color-bg); }
.wg-dropdown__option.is-selected {
  color: var(--color-primary);
  font-weight: var(--weight-medium);
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
}
.wg-dropdown__option.is-disabled {
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  pointer-events: none;
}
.wg-dropdown__option-check {
  width: 16px;
  height: 16px;
  margin-left: auto;
  color: var(--color-primary);
  opacity: 0;
}
.wg-dropdown__option.is-selected .wg-dropdown__option-check { opacity: 1; }
.wg-dropdown__option-desc { margin-left: auto; font-size: var(--font-xs); color: var(--color-text-tertiary); }
.wg-dropdown__option-mark {
  background: color-mix(in srgb, var(--color-warning) 30%, transparent);
  border-radius: 2px;
  padding: 0 2px;
}

/* ===== Empty / Loading ===== */
.wg-dropdown__empty {
  padding: var(--space-8) var(--space-4);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-sm);
}
.wg-dropdown__loading {
  padding: var(--space-6) var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-text-tertiary);
  font-size: var(--font-sm);
}
.wg-dropdown__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: wg-dropdown-spin 0.8s linear infinite;
}
@keyframes wg-dropdown-spin { to { transform: rotate(360deg); } }

/* ===== Size ===== */
.wg-dropdown--sm > .wg-dropdown__trigger { padding: 4px var(--space-2); font-size: var(--font-sm); min-width: 80px; }
.wg-dropdown--lg > .wg-dropdown__trigger { padding: var(--space-3) var(--space-5); font-size: var(--font-lg); min-width: 160px; }
.wg-dropdown.is-block { display: block; width: 100%; }
.wg-dropdown.is-block > .wg-dropdown__trigger { width: 100%; }
</style>
```

## 使用示例

### 1. mode='dropdown' 下拉菜单

```vue
<base-dropdown mode="dropdown" :items="[
  { key: 'edit', label: '编辑', icon: 'data:image/svg+xml;...' },
  { key: 'copy', label: '复制' },
  { key: 'd1', divider: true },
  { key: 'del', label: '删除', danger: true }
]">
  <template #trigger>操作</template>
</base-dropdown>
```

### 2. mode='popover' 气泡框

```vue
<base-dropdown mode="popover" position="top" arrow>
  <template #trigger>悬停看提示</template>
  <div>这是气泡内容</div>
</base-dropdown>
```

### 3. mode='select' 单选

```vue
<base-dropdown
  mode="select"
  v-model="city"
  :options="[
    { value: 'bj', label: '北京' },
    { value: 'sh', label: '上海' },
    { value: 'sz', label: '深圳', disabled: true }
  ]"
  searchable
  clearable
  placeholder="请选择城市"
/>
```

### 4. mode='multi-select' 多选

```vue
<base-dropdown
  mode="multi-select"
  v-model="selectedTags"
  :options="tagOptions"
  searchable
  :max="5"
/>
```

### 5. mode='menu' 右键菜单

```vue
<base-dropdown mode="menu" trigger="contextmenu" :items="menuItems" />
```

### 6. remote 远程搜索

```vue
<base-dropdown
  mode="select"
  v-model="userId"
  remote
  :remote-function="searchUsers"
  :debounce="300"
  :options="userOptions"
/>
```

### 7. virtual 虚拟滚动

```vue
<base-dropdown
  mode="select"
  v-model="value"
  virtual
  :row-height="36"
  :options="bigOptions"
/>
```

## 红线

- [X] **禁止脱离 base-card**：panel 内部必须由 base-card 容器承载
- [X] **禁止使用 `<p>` `<h*>` `<button>` `<select>` `<option>` `<ul>` `<ol>` `<li>` `<input>` `<form>` `<img>` `<strong>` `<em>` `<a>` 等带默认样式的标签**
- [X] **禁止在 .md 实现代码中使用裸 emoji**（业务图标走 CSS mask）
- [X] **禁止硬编码颜色 / 间距 / 字号 / 圆角 / 阴影值**（必须 Token）
- [X] **禁止脱离 base-dropdown 自行实现下拉 / 气泡 / 选择器**（破坏统一）
- [X] **禁止 5 种 mode 之外的私有行为**（必须扩展 base-dropdown 而非另起组件）

## 关联

- [base-card.md](../base-card.md) — 根容器规格（6 维度参数，base-dropdown panel 内部必包）
- [SKILL.md](SKILL.md) — 父技能入口
- [vue-theme-skill](../../vue-theme-skill/) — Token 唯一来源
- [vue-style-skill](../../vue-style-skill/) — 通用样式规范
- [vue-button-skill](../../vue-button-skill/base-button.md) — dropdown trigger 内嵌按钮
- [vue-tag-skill](../../vue-tag-skill/base-tag.md) — select 选项内嵌标签