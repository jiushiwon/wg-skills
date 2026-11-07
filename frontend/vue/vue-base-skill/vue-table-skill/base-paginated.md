# base-paginated 分页组件

> 通用分页组件，支持多种模式：基础、简洁、按钮、下拉、迷你、滚动。
> **必须嵌入 base-card** 使用。
> **零 HTML5 标签**：禁止使用 `<button>` `<input>` `<select>`，全部用 `<div>` `<span>` + CSS3 实现。
> **强依赖**：`base-button`（vue-button-skill）+ `base-card`（vue-card-skill）。

## 为什么需要 base-paginated？

实际开发中分页痛点：
- ❌ 只有一种分页样式，无法适配不同场景
- ❌ 移动端分页体验差
- ❌ 分页样式不统一，每次都从零写

**base-paginated 把所有分页场景收敛成一个组件**：
- ✅ 5 种分页模式（classic / button / dropdown / simple / scroll）
- ✅ 自定义下拉选择器（无 `<select>`）
- ✅ 自定义数字输入框（无 `<input>`）
- ✅ 自定义按钮（复用 `<base-button>`）
- ✅ 主题自动继承

---

## 形态速览（5 种模式）

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| `classic` | 经典样式（数字按钮 + 上下页） | 桌面端默认 |
| `button` | 现代按钮组（首末页 + 上下页） | 卡片风格 |
| `dropdown` | 下拉页码（页数多时） | 数据量大 |
| `simple` | 简洁模式（只显示上下页） | 移动端 |
| `scroll` | 滚动加载（无页码） | 无限滚动 |

---

## 效果展示

### 1. 基础分页（经典样式）

```vue
<base-paginated
  :current="1"
  :page-size="10"
  :total="100"
  @page-change="onPageChange"
/>
```

### 2. 简洁模式（移动端友好）

```vue
<base-paginated
  :current="1"
  :page-size="10"
  :total="100"
  simple
  @page-change="onPageChange"
/>
```

### 3. 按钮模式（现代风格）

```vue
<base-paginated
  :current="1"
  :page-size="10"
  :total="100"
  mode="button"
  @page-change="onPageChange"
/>
```

### 4. 下拉模式（页数多时）

```vue
<base-paginated
  :current="1"
  :page-size="10"
  :total="1000"
  mode="dropdown"
  @page-change="onPageChange"
/>
```

### 5. 迷你分页

```vue
<base-paginated
  :current="1"
  :page-size="10"
  :total="100"
  size="sm"
  @page-change="onPageChange"
/>
```

### 6. 完整分页（带总数 + 每页切换 + 跳转）

```vue
<base-paginated
  :current="1"
  :page-size="10"
  :total="100"
  show-total
  show-size-changer
  show-quick-jumper
  @page-change="onPageChange"
  @size-change="onSizeChange"
/>
```

### 7. 分页位置

```vue
<base-paginated :current="1" :page-size="10" :total="100" position="left" />
<base-paginated :current="1" :page-size="10" :total="100" position="center" />
<base-paginated :current="1" :page-size="10" :total="100" position="right" />
```

### 8. 滚动模式（无限加载）

```vue
<base-paginated
  :current="current"
  :page-size="20"
  :total="total"
  mode="scroll"
  @page-change="loadMore"
/>
```

### 9. 主题变体

```vue
<base-paginated :current="1" :page-size="10" :total="100" variant="primary" />
<base-paginated :current="1" :page-size="10" :total="100" variant="success" />
<base-paginated :current="1" :page-size="10" :total="100" variant="warning" />
```

### 10. 形状

```vue
<base-paginated :current="1" :page-size="10" :total="100" shape="round" />
<base-paginated :current="1" :page-size="10" :total="100" shape="square" />
<base-paginated :current="1" :page-size="10" :total="100" shape="circle" />
```

---

## 使用示例（必须在 base-card 内）

```vue
<template>
  <base-card title="用户管理">
    <base-table :data="users" :columns="columns" />

    <base-paginated
      :current="pagination.current"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      show-total
      show-size-changer
      show-quick-jumper
      position="right"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </base-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 100,
})

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleSizeChange(size: number) {
  pagination.value.pageSize = size
  pagination.value.current = 1
}
</script>
```

---

## 容器原则

> **分页组件必须嵌入 `<base-card>`。**

```vue
<!-- ✅ 正确 -->
<base-card title="用户列表">
  <base-table :data="users" :columns="columns" />
  <base-paginated :current="1" :page-size="10" :total="100" />
</base-card>

<!-- ❌ 错误 -->
<base-paginated :current="1" :page-size="10" :total="100" />
```

---

## 红线

- ❌ 禁止裸用 `<base-paginated>`（必须 `<base-card>` 包裹）
- ❌ 禁止裸色值 / 裸 px（必须 `var(--*)`）
- ❌ 禁止使用 `<button>` `<input>` `<select>` 等 HTML5 标签（必须 `<div>` `<span>` + CSS3）
- ❌ 禁止自写按钮样式（必须用 `<base-button>`）
- ❌ 禁止混入 Element Plus / 任何第三方分页组件

---

## Props

```typescript
interface BasePaginatedProps {
  // 核心
  current: number                                                           // 当前页
  pageSize: number                                                          // 每页条数
  total: number                                                             // 总条数

  // 模式
  mode?: 'classic' | 'button' | 'dropdown' | 'simple' | 'scroll'           // 分页模式
  shape?: 'round' | 'square' | 'circle'                                     // 按钮形状
  theme?: 'primary' | 'success' | 'warning' | 'danger' | 'info'              // 主题色

  // 显示配置
  showTotal?: boolean                                                       // 显示总数
  showSizeChanger?: boolean                                                 // 显示每页大小切换
  showQuickJumper?: boolean                                                 // 显示快速跳转
  pageSizes?: number[]                                                      // 可选每页大小，默认 [10, 20, 50, 100]
  totalText?: string                                                        // 总数模板
  jumperBeforeText?: string                                                 // 跳转前文字
  jumperAfterText?: string                                                  // 跳转后文字

  // 样式
  size?: 'sm' | 'md' | 'lg'                                                // 尺寸
  position?: 'left' | 'center' | 'right'                                    // 对齐方式
  bordered?: boolean                                                        // 带边框
  background?: boolean                                                      // 带背景

  // 状态
  disabled?: boolean                                                        // 禁用
  hideOnSinglePage?: boolean                                                // 单页时隐藏

  // 滚动模式
  scrollThreshold?: number                                                  // 滚动加载距离底部阈值，默认 0
  scrollLoadingText?: string                                                // 加载文案
  scrollFinishedText?: string                                               // 加载完成文案
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `current` | `number` | **必填** | 当前页 |
| `pageSize` | `number` | **必填** | 每页条数 |
| `total` | `number` | **必填** | 总条数 |
| `mode` | `'classic' \| 'button' \| 'dropdown' \| 'simple' \| 'scroll'` | `'classic'` | 分页模式 |
| `shape` | `'round' \| 'square' \| 'circle'` | `'round'` | 按钮形状 |
| `theme` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'` | 主题色 |
| `showTotal` | `boolean` | `false` | 显示总数 |
| `showSizeChanger` | `boolean` | `false` | 显示每页大小切换 |
| `showQuickJumper` | `boolean` | `false` | 显示快速跳转 |
| `pageSizes` | `number[]` | `[10, 20, 50, 100]` | 可选每页大小 |
| `totalText` | `string` | `'共 {total} 条'` | 总数模板 |
| `jumperBeforeText` | `string` | `'跳至'` | 跳转前文字 |
| `jumperAfterText` | `string` | `'页'` | 跳转后文字 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `position` | `'left' \| 'center' \| 'right'` | `'right'` | 对齐方式 |
| `bordered` | `boolean` | `false` | 带边框 |
| `background` | `boolean` | `false` | 带背景 |
| `disabled` | `boolean` | `false` | 禁用 |
| `hideOnSinglePage` | `boolean` | `false` | 单页时隐藏 |
| `scrollThreshold` | `number` | `0` | 滚动加载距离 |
| `scrollLoadingText` | `string` | `'加载中...'` | 加载文案 |
| `scrollFinishedText` | `string` | `'没有更多了'` | 加载完成文案 |

---

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `pageChange` | `(page: number) => void` | 页码变化 |
| `sizeChange` | `(size: number) => void` | 每页大小变化 |
| `scrollReachBottom` | `() => void` | 滚动模式触底 |

---

## Slots

| 插槽 | 参数 | 说明 |
|------|------|------|
| `total` | `{ total: number, range: [number, number] }` | 自定义总数 |
| `prev` | - | 自定义上一页按钮 |
| `next` | - | 自定义下一页按钮 |

---

## 强依赖

| 依赖 | 来自 | 用途 |
|------|------|------|
| `<base-button>` | vue-button-skill | 所有分页按钮 |
| `<base-card>` | vue-card-skill | 分页容器 |

---

## 分页模式详解

### 1. 经典模式（classic）

传统分页样式，适合桌面端。

```vue
<base-paginated
  :current="1"
  :page-size="10"
  :total="100"
  mode="classic"
/>
```

### 2. 按钮模式（button）

现代风格，适合卡片布局。

```vue
<base-paginated
  :current="1"
  :page-size="10"
  :total="100"
  mode="button"
/>
```

### 3. 下拉模式（dropdown）

页数多时使用，节省空间。

```vue
<base-paginated
  :current="1"
  :page-size="10"
  :total="1000"
  mode="dropdown"
/>
```

### 4. 简洁模式（simple）

移动端友好，只显示上一页/下一页。

```vue
<base-paginated
  :current="1"
  :page-size="10"
  :total="100"
  simple
/>
```

### 5. 滚动模式（scroll）

无限滚动，自动加载下一页。

```vue
<base-paginated
  :current="current"
  :page-size="20"
  :total="total"
  mode="scroll"
  @page-change="loadMore"
  @scrollReachBottom="onReachBottom"
/>
```

---

## 自定义下拉选择器（无 select）

每页大小切换、页码切换均使用 `<div>` + CSS3 模拟下拉：

```css
.base-paginated__size-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  cursor: pointer;
}
.base-paginated__size-select-arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  transition: transform 0.2s;
}
.base-paginated__size-select-panel {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--space-1) 0;
  z-index: 10;
}
```

---

## 实现要点

```vue
<template>
  <div
    v-if="!hideOnSinglePage || totalPages > 1"
    :class="[
      'base-paginated',
      `base-paginated--size-${size}`,
      `base-paginated--mode-${mode}`,
      `base-paginated--position-${position}`,
      `base-paginated--shape-${shape}`,
      `base-paginated--theme-${theme}`,
      { 'base-paginated--bordered': bordered },
      { 'base-paginated--background': background },
      { 'base-paginated--disabled': disabled },
    ]"
  >
    <!-- 总数 -->
    <span v-if="showTotal" class="base-paginated__total">
      <slot name="total" :total="total" :range="[rangeStart, rangeEnd]">
        共 <strong>{{ total }}</strong> 条
      </slot>
    </span>

    <!-- 每页大小切换（无 select） -->
    <div v-if="showSizeChanger" class="base-paginated__size-changer">
      <div
        :class="[
          'base-paginated__size-select',
          `base-paginated__size-select--${size}`,
        ]"
        tabindex="0"
        @click="toggleSizeSelect"
        @blur="closeSizeSelect"
      >
        <span class="base-paginated__size-select-label">{{ pageSize }} 条/页</span>
        <span
          :class="[
            'base-paginated__size-select-arrow',
            { 'base-paginated__size-select-arrow--open': sizeSelectOpen },
          ]"
        />

        <div v-if="sizeSelectOpen" class="base-paginated__size-select-panel">
          <div
            v-for="sizeOpt in pageSizes"
            :key="sizeOpt"
            :class="[
              'base-paginated__size-select-option',
              { 'base-paginated__size-select-option--active': pageSize === sizeOpt },
            ]"
            @mousedown.prevent="handleSizeChange(sizeOpt)"
          >
            {{ sizeOpt }} 条/页
          </div>
        </div>
      </div>
    </div>

    <!-- 经典模式 -->
    <div v-if="mode === 'classic'" class="base-paginated__buttons">
      <base-button
        variant="ghost"
        :size="size"
        :disabled="current <= 1 || disabled"
        @click="handlePageChange(current - 1)"
      >
        <slot name="prev">‹</slot>
      </base-button>

      <template v-if="!simple">
        <base-button
          v-for="page in displayPages"
          :key="page.key"
          :variant="page.value === current ? 'solid' : 'ghost'"
          :size="size"
          :type="page.value === current ? theme : 'default'"
          :disabled="page.disabled || disabled"
          @click="!page.disabled && handlePageChange(page.value)"
        >
          {{ page.label }}
        </base-button>
      </template>

      <span v-else class="base-paginated__simple">
        <strong>{{ current }}</strong>
        <span class="base-paginated__simple-sep">/</span>
        <span>{{ totalPages }}</span>
      </span>

      <base-button
        variant="ghost"
        :size="size"
        :disabled="current >= totalPages || disabled"
        @click="handlePageChange(current + 1)"
      >
        <slot name="next">›</slot>
      </base-button>
    </div>

    <!-- 按钮模式 -->
    <div v-if="mode === 'button'" class="base-paginated__button-group">
      <base-button
        variant="ghost"
        :size="size"
        :disabled="current <= 1 || disabled"
        @click="handlePageChange(1)"
      >
        «
      </base-button>
      <base-button
        variant="ghost"
        :size="size"
        :disabled="current <= 1 || disabled"
        @click="handlePageChange(current - 1)"
      >
        ‹
      </base-button>

      <div class="base-paginated__page-info">
        <span class="base-paginated__current">{{ current }}</span>
        <span class="base-paginated__separator">/</span>
        <span class="base-paginated__total-pages">{{ totalPages }}</span>
      </div>

      <base-button
        variant="ghost"
        :size="size"
        :disabled="current >= totalPages || disabled"
        @click="handlePageChange(current + 1)"
      >
        ›
      </base-button>
      <base-button
        variant="ghost"
        :size="size"
        :disabled="current >= totalPages || disabled"
        @click="handlePageChange(totalPages)"
      >
        »
      </base-button>
    </div>

    <!-- 下拉模式（无 select） -->
    <div v-if="mode === 'dropdown'" class="base-paginated__dropdown">
      <base-button
        variant="ghost"
        :size="size"
        :disabled="current <= 1 || disabled"
        @click="handlePageChange(current - 1)"
      >
        ‹
      </base-button>

      <div
        class="base-paginated__page-dropdown"
        tabindex="0"
        @click="togglePageDropdown"
        @blur="closePageDropdown"
      >
        <span class="base-paginated__page-dropdown-label">
          第 <strong>{{ current }}</strong> 页 / 共 {{ totalPages }} 页
        </span>
        <span
          :class="[
            'base-paginated__page-dropdown-arrow',
            { 'base-paginated__page-dropdown-arrow--open': pageDropdownOpen },
          ]"
        />

        <div v-if="pageDropdownOpen" class="base-paginated__page-dropdown-panel">
          <div
            v-for="page in totalPages"
            :key="page"
            :class="[
              'base-paginated__page-dropdown-option',
              { 'base-paginated__page-dropdown-option--active': current === page },
            ]"
            @mousedown.prevent="handlePageChange(page)"
          >
            第 {{ page }} 页
          </div>
        </div>
      </div>

      <base-button
        variant="ghost"
        :size="size"
        :disabled="current >= totalPages || disabled"
        @click="handlePageChange(current + 1)"
      >
        ›
      </base-button>
    </div>

    <!-- 简单模式 -->
    <div v-if="mode === 'simple'" class="base-paginated__simple-mode">
      <base-button
        variant="ghost"
        :size="size"
        :disabled="current <= 1 || disabled"
        @click="handlePageChange(current - 1)"
      >
        ‹
      </base-button>
      <div class="base-paginated__simple-info">
        <div
          class="base-paginated__simple-input"
          contenteditable="true"
          @blur="handleSimpleInputBlur"
          @keydown.enter.prevent="($event.target as HTMLElement).blur()"
        >{{ current }}</div>
        <span class="base-paginated__simple-sep">/</span>
        <span>{{ totalPages }}</span>
      </div>
      <base-button
        variant="ghost"
        :size="size"
        :disabled="current >= totalPages || disabled"
        @click="handlePageChange(current + 1)"
      >
        ›
      </base-button>
    </div>

    <!-- 滚动模式 -->
    <div v-if="mode === 'scroll'" class="base-paginated__scroll">
      <div class="base-paginated__scroll-content">
        <slot />
      </div>
      <div class="base-paginated__scroll-status">
        <span v-if="loadingMore" class="base-paginated__scroll-spinner" />
        <span v-if="finished" class="base-paginated__scroll-finished">{{ scrollFinishedText }}</span>
        <span v-else-if="loadingMore" class="base-paginated__scroll-loading">{{ scrollLoadingText }}</span>
      </div>
    </div>

    <!-- 快速跳转（无 input） -->
    <div v-if="showQuickJumper && !simple && mode !== 'scroll'" class="base-paginated__jumper">
      <span>{{ jumperBeforeText }}</span>
      <div
        class="base-paginated__jumper-input"
        contenteditable="true"
        @blur="handleJump"
        @keydown.enter.prevent="($event.target as HTMLElement).blur()"
      >{{ current }}</div>
      <span>{{ jumperAfterText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import BaseButton from '../vue-button-skill/BaseButton.vue'

const props = withDefaults(defineProps<BasePaginatedProps>(), {
  mode: 'classic',
  shape: 'round',
  theme: 'primary',
  showTotal: false,
  showSizeChanger: false,
  showQuickJumper: false,
  pageSizes: () => [10, 20, 50, 100],
  totalText: '共 {total} 条',
  jumperBeforeText: '跳至',
  jumperAfterText: '页',
  size: 'md',
  position: 'right',
  bordered: false,
  background: false,
  disabled: false,
  hideOnSinglePage: false,
  scrollThreshold: 0,
  scrollLoadingText: '加载中...',
  scrollFinishedText: '没有更多了',
})

const emit = defineEmits<{
  pageChange: [page: number]
  sizeChange: [size: number]
  scrollReachBottom: []
}>()

// 滚动模式状态
const loadingMore = ref(false)
const finished = computed(() => props.current * props.pageSize >= props.total)

// 下拉状态
const sizeSelectOpen = ref(false)
const pageDropdownOpen = ref(false)

function toggleSizeSelect() {
  sizeSelectOpen.value = !sizeSelectOpen.value
  pageDropdownOpen.value = false
}
function closeSizeSelect() {
  setTimeout(() => (sizeSelectOpen.value = false), 150)
}
function togglePageDropdown() {
  pageDropdownOpen.value = !pageDropdownOpen.value
  sizeSelectOpen.value = false
}
function closePageDropdown() {
  setTimeout(() => (pageDropdownOpen.value = false), 150)
}

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const rangeStart = computed(() => (props.total === 0 ? 0 : (props.current - 1) * props.pageSize + 1))
const rangeEnd = computed(() => Math.min(props.current * props.pageSize, props.total))

interface PageItem {
  key: string
  label: string
  value: number
  disabled: boolean
}

const displayPages = computed<PageItem[]>(() => {
  const pages: PageItem[] = []
  const total = totalPages.value
  const current = props.current
  const delta = 2

  // 第一页
  if (total > 0) {
    pages.push({
      key: 'p1',
      label: '1',
      value: 1,
      disabled: false,
    })
  }

  // 前省略号
  if (current - delta > 2) {
    pages.push({
      key: 'prev-ellipsis',
      label: '...',
      value: -1,
      disabled: true,
    })
  }

  // 中间页
  const start = Math.max(2, current - delta)
  const end = Math.min(total - 1, current + delta)
  for (let i = start; i <= end; i++) {
    pages.push({
      key: `p${i}`,
      label: String(i),
      value: i,
      disabled: false,
    })
  }

  // 后省略号
  if (current + delta < total - 1) {
    pages.push({
      key: 'next-ellipsis',
      label: '...',
      value: -1,
      disabled: true,
    })
  }

  // 最后一页
  if (total > 1) {
    pages.push({
      key: `p${total}`,
      label: String(total),
      value: total,
      disabled: false,
    })
  }

  return pages
})

function handlePageChange(page: number) {
  if (page < 1 || page > totalPages.value || page === props.current || props.disabled) return
  emit('pageChange', page)
}

function handleSizeChange(size: number) {
  sizeSelectOpen.value = false
  if (size === props.pageSize) return
  emit('sizeChange', size)
  emit('pageChange', 1)
}

function handleJump(event: Event) {
  const target = event.target as HTMLElement
  const page = Number(target.textContent || 0)
  if (page >= 1 && page <= totalPages.value) {
    handlePageChange(page)
  } else {
    target.textContent = String(props.current)
  }
}

function handleSimpleInputBlur(event: Event) {
  const target = event.target as HTMLElement
  const page = Number(target.textContent || 0)
  if (page >= 1 && page <= totalPages.value) {
    handlePageChange(page)
  } else {
    target.textContent = String(props.current)
  }
}

// 滚动模式
function onScroll() {
  if (props.mode !== 'scroll' || loadingMore.value || props.disabled) return
  if (finished.value) return

  const scrollEl = document.documentElement
  const remaining = scrollEl.scrollHeight - scrollEl.scrollTop - window.innerHeight
  if (remaining <= props.scrollThreshold) {
    loadingMore.value = true
    emit('scrollReachBottom')
  }
}

watch(
  () => props.current,
  () => {
    loadingMore.value = false
  },
)

onMounted(() => {
  if (props.mode === 'scroll') {
    window.addEventListener('scroll', onScroll)
  }
})

onBeforeUnmount(() => {
  if (props.mode === 'scroll') {
    window.removeEventListener('scroll', onScroll)
  }
})
</script>

<style scoped>
.base-paginated {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  font-size: var(--font-sm);
  flex-wrap: wrap;
}

/* 位置 */
.base-paginated--position-left { justify-content: flex-start; }
.base-paginated--position-center { justify-content: center; }
.base-paginated--position-right { justify-content: flex-end; }

/* 边框 */
.base-paginated--bordered {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
}

.base-paginated--bordered.base-paginated--shape-round { border-radius: var(--radius-lg); }
.base-paginated--bordered.base-paginated--shape-square { border-radius: var(--radius-md); }
.base-paginated--bordered.base-paginated--shape-circle { border-radius: var(--radius-full); }

/* 背景 */
.base-paginated--background {
  background: var(--color-bg-secondary);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}

/* 禁用 */
.base-paginated--disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* 总数 */
.base-paginated__total {
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
}

.base-paginated__total strong {
  color: var(--color-text-primary);
  font-weight: var(--weight-semibold);
  margin: 0 var(--space-1);
}

/* 每页大小切换（无 select） */
.base-paginated__size-changer {
  display: inline-flex;
  align-items: center;
}

.base-paginated__size-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-width: 110px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.base-paginated__size-select--sm { height: 28px; font-size: var(--font-xs); }
.base-paginated__size-select--md { height: 32px; font-size: var(--font-sm); }
.base-paginated__size-select--lg { height: 36px; font-size: var(--font-base); }

.base-paginated__size-select:hover {
  border-color: var(--color-primary);
}

.base-paginated__size-select:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.base-paginated--shape-round .base-paginated__size-select { border-radius: var(--radius-md); }
.base-paginated--shape-square .base-paginated__size-select { border-radius: 0; }
.base-paginated--shape-circle .base-paginated__size-select { border-radius: var(--radius-full); }

.base-paginated__size-select-label {
  flex: 1;
}

.base-paginated__size-select-arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  transition: transform 0.2s;
  opacity: 0.6;
}

.base-paginated__size-select-arrow--open {
  transform: rotate(180deg);
}

.base-paginated__size-select-panel {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--space-1) 0;
  z-index: 10;
}

.base-paginated__size-select-option {
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: var(--font-sm);
}

.base-paginated__size-select-option:hover {
  background: var(--color-bg-hover);
}

.base-paginated__size-select-option--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}

/* 经典模式 */
.base-paginated__buttons {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

/* 简洁模式 */
.base-paginated__simple {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0 var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
}

.base-paginated__simple strong {
  color: var(--color-text-primary);
  font-weight: var(--weight-semibold);
}

.base-paginated__simple-sep {
  color: var(--color-text-muted);
  margin: 0 var(--space-1);
}

/* 按钮模式 */
.base-paginated__button-group {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-bg-secondary);
  padding: var(--space-1);
}

.base-paginated--shape-round .base-paginated__button-group { border-radius: var(--radius-md); }
.base-paginated--shape-square .base-paginated__button-group { border-radius: 0; }
.base-paginated--shape-circle .base-paginated__button-group { border-radius: var(--radius-full); }

.base-paginated__page-info {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0 var(--space-3);
  font-size: var(--font-sm);
}

.base-paginated__current {
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  font-size: var(--font-base);
}

.base-paginated__separator {
  color: var(--color-text-muted);
}

.base-paginated__total-pages {
  color: var(--color-text-secondary);
}

/* 下拉模式（无 select） */
.base-paginated__dropdown {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.base-paginated__page-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-width: 140px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-primary);
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.base-paginated__page-dropdown:hover,
.base-paginated__page-dropdown:focus-visible {
  border-color: var(--color-primary);
}

.base-paginated--shape-round .base-paginated__page-dropdown { border-radius: var(--radius-md); }
.base-paginated--shape-square .base-paginated__page-dropdown { border-radius: 0; }
.base-paginated--shape-circle .base-paginated__page-dropdown { border-radius: var(--radius-full); }

.base-paginated__page-dropdown-label {
  flex: 1;
}

.base-paginated__page-dropdown-label strong {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  margin: 0 2px;
}

.base-paginated__page-dropdown-arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  transition: transform 0.2s;
  opacity: 0.6;
}

.base-paginated__page-dropdown-arrow--open {
  transform: rotate(180deg);
}

.base-paginated__page-dropdown-panel {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--space-1) 0;
  z-index: 10;
}

.base-paginated__page-dropdown-option {
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: var(--font-sm);
}

.base-paginated__page-dropdown-option:hover {
  background: var(--color-bg-hover);
}

.base-paginated__page-dropdown-option--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}

/* 简单模式（无 input） */
.base-paginated__simple-mode {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.base-paginated__simple-info {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.base-paginated__simple-input {
  min-width: 32px;
  height: 24px;
  padding: 0 var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  text-align: center;
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
  cursor: text;
  outline: none;
  transition: border-color 0.2s;
}

.base-paginated__simple-input:hover,
.base-paginated__simple-input:focus {
  border-color: var(--color-primary);
}

/* 滚动模式 */
.base-paginated__scroll {
  width: 100%;
}

.base-paginated__scroll-content {
  width: 100%;
}

.base-paginated__scroll-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.base-paginated__scroll-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-primary-light);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: base-paginated-rotate 0.8s linear infinite;
}

.base-paginated__scroll-loading {
  color: var(--color-text-secondary);
}

.base-paginated__scroll-finished {
  color: var(--color-text-muted);
}

@keyframes base-paginated-rotate {
  to { transform: rotate(360deg); }
}

/* 快速跳转（无 input） */
.base-paginated__jumper {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
}

.base-paginated__jumper-input {
  min-width: 50px;
  height: 28px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  text-align: center;
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
  cursor: text;
  outline: none;
  transition: all 0.2s;
}

.base-paginated__jumper-input:hover,
.base-paginated__jumper-input:focus {
  border-color: var(--color-primary);
}

/* 主题色变体 */
.base-paginated--theme-success .base-paginated__current,
.base-paginated--theme-success .base-paginated__simple-input { color: var(--color-success); }

.base-paginated--theme-warning .base-paginated__current,
.base-paginated--theme-warning .base-paginated__simple-input { color: var(--color-warning); }

.base-paginated--theme-danger .base-paginated__current,
.base-paginated--theme-danger .base-paginated__simple-input { color: var(--color-danger); }

.base-paginated--theme-info .base-paginated__current,
.base-paginated--theme-info .base-paginated__simple-input { color: var(--color-info); }
```

---

## 依赖说明

| 组件 | 来源 | 触发时机 |
|------|------|----------|
| `<base-button>` | vue-button-skill | 所有分页按钮 |
| `<base-card>` | vue-card-skill | 分页容器 |

---

## 相关技能

- [vue-base-skill](../SKILL.md) — 父技能
- [vue-button-skill](../vue-button-skill/) — base-button
- [vue-card-skill](../vue-card-skill/) — base-card
- [vue-theme-skill](../../vue-theme-skill/) — Token
- [vue-table-skill](./) — base-table 内嵌分页