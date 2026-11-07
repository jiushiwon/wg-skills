# BaseContextMenu —— 右键菜单

> 菜单项渲染 = `base-list-item`（4 槽位复用），业务只关心 `MenuOption[]` 数据契约。

## 组件层级

```
base-card              ← 容器（L0，宿主）
└─ 业务组件            ← 触发 @contextmenu
   ↳ base-contextmenu  ← 右键弹层（L1，本组件，Teleport 到 body）
      └─ base-list-item← 菜单项渲染（L1，依赖）
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `MenuOption[]` | `[]` | 菜单数据（必填） |
| `x` | `number` | `0` | 弹层 X 坐标 |
| `y` | `number` | `0` | 弹层 Y 坐标 |
| `visible` | `boolean` | `false` | 是否显示（v-model） |
| `width` | `number` | `180` | 菜单宽度 |
| `trigger` | `'contextmenu' \| 'click'` | `'contextmenu'` | 触发方式 |
| `adjustPosition` | `boolean` | `true` | 边缘检测 |
| `variant` | `string` | `'basic'` | 继承 list-item：basic / finder / win / vscode / admin / notion / nav |
| `zIndex` | `number` | `1000` | 层级 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `select` | `(option, command)` | 菜单项点击 |
| `update:visible` | `(visible)` | v-model 显隐 |
| `show` | `()` | 显示时 |
| `hide` | `()` | 隐藏时 |

## 完整组件实现

```vue
<template>
  <Teleport to="body">
    <Transition name="ctx-fade">
      <div
        v-if="visible"
        ref="menuRef"
        class="base-contextmenu"
        :style="{
          left: adjustedX + 'px',
          top: adjustedY + 'px',
          width: width + 'px',
          zIndex: zIndex
        }"
        @contextmenu.prevent
      >
        <template v-for="(option, idx) in visibleOptions" :key="option.id || idx">
          <!-- 分割线 -->
          <div v-if="option.divider" class="base-contextmenu__divider" />

          <!-- 子菜单 -->
          <div
            v-else-if="option.children?.length"
            class="base-contextmenu__submenu"
            @mouseenter="showSubmenu(option, $event)"
            @mouseleave="hideSubmenu"
          >
            <base-list-item
              :item="toListItem(option)"
              :variant="variant"
            >
              <template #meta>
                <span class="base-contextmenu__arrow">▸</span>
              </template>
            </base-list-item>

            <Teleport to="body" :disabled="!submenuVisible">
              <div
                v-if="submenuVisible && submenuParentId === option.id"
                class="base-contextmenu base-contextmenu--nested"
                :style="{ left: submenuX + 'px', top: submenuY + 'px' }"
              >
                <base-list-item
                  v-for="child in option.children"
                  :key="child.id"
                  :item="toListItem(child)"
                  :variant="variant"
                  @select="handleSelect(child, $event)"
                />
              </div>
            </Teleport>
          </div>

          <!-- 普通菜单项 -->
          <base-list-item
            v-else
            :item="toListItem(option)"
            :variant="variant"
            @select="handleSelect(option, $event)"
          />
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import BaseListItem from '@/components/BaseListItem.vue'
import type { ListItem } from '@/components/BaseListItem.vue'
import type { MenuOption } from './types'

const props = withDefaults(defineProps<{
  options: MenuOption[]
  x: number
  y: number
  visible: boolean
  width?: number
  trigger?: 'contextmenu' | 'click'
  adjustPosition?: boolean
  variant?: 'basic' | 'finder' | 'win' | 'vscode' | 'admin' | 'notion' | 'nav'
  zIndex?: number
}>(), {
  width: 180,
  trigger: 'contextmenu',
  adjustPosition: true,
  variant: 'basic',
  zIndex: 1000
})

const emit = defineEmits<{
  (e: 'select', option: MenuOption, command: string | number | undefined): void
  (e: 'update:visible', value: boolean): void
  (e: 'show'): void
  (e: 'hide'): void
}>()

// 条件渲染过滤
const visibleOptions = computed(() =>
  props.options.filter(opt => opt.show !== false)
)

// MenuOption → ListItem 适配
function toListItem(option: MenuOption): ListItem {
  return {
    id: option.id,
    label: option.label || '',
    icon: option.icon,
    shortcut: option.shortcut,
    disabled: option.disabled,
    danger: option.danger,
    divider: option.divider
  }
}

// 边缘检测
const menuRef = ref<HTMLElement | null>(null)
const adjustedX = ref(props.x)
const adjustedY = ref(props.y)

watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick()
    if (props.adjustPosition && menuRef.value) {
      const rect = menuRef.value.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      adjustedX.value = props.x + rect.width > vw ? vw - rect.width - 8 : props.x
      adjustedY.value = props.y + rect.height > vh ? vh - rect.height - 8 : props.y
    } else {
      adjustedX.value = props.x
      adjustedY.value = props.y
    }
    emit('show')
  } else {
    emit('hide')
  }
})

// 子菜单
const submenuVisible = ref(false)
const submenuParentId = ref('')
const submenuX = ref(0)
const submenuY = ref(0)

function showSubmenu(option: MenuOption, event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  submenuX.value = rect.right + 4
  submenuY.value = rect.top
  if (rect.right + props.width > window.innerWidth) {
    submenuX.value = rect.left - props.width - 4
  }
  submenuParentId.value = option.id || ''
  submenuVisible.value = true
}
function hideSubmenu() { submenuVisible.value = false }

// 点击外部关闭
function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('update:visible', false)
  }
}
document.addEventListener('click', handleClickOutside)

// 键盘导航（↑↓ Enter Esc）
function handleKeydown(event: KeyboardEvent) {
  if (!props.visible) return
  if (event.key === 'Escape') emit('update:visible', false)
  // ↑↓ Enter 简化实现省略
}
document.addEventListener('keydown', handleKeydown)

function handleSelect(option: MenuOption, event: MouseEvent) {
  if (option.disabled) return
  emit('select', option, option.command)
  emit('update:visible', false)
}
</script>

<style lang="scss">
.base-contextmenu {
  position: fixed;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  min-width: 120px;
  user-select: none;
  z-index: 1000;

  &__divider {
    height: 1px;
    background: var(--color-border);
    margin: 4px 0;
  }
  &__arrow { color: var(--color-text-muted); font-size: 11px; }
  &__submenu { position: relative; }
}

.ctx-fade-enter-active, .ctx-fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.ctx-fade-enter-from, .ctx-fade-leave-to { opacity: 0; transform: scale(0.96); }
</style>
```

## 反例 vs 正例

```vue
<!-- ❌ 严禁：脱离 base-list-item 重新实现菜单项 -->
<template>
  <div class="my-menu" v-if="visible" :style="{left: x, top: y}">
    <div v-for="item in options" :key="item.id" class="my-item">
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>
```

```vue
<!-- ✅ 正确：菜单项统一收敛到 base-list-item -->
<template>
  <base-card>
    <div @contextmenu="openCtx">右键点击</div>
    <base-contextmenu
      v-model:visible="visible"
      :x="x" :y="y"
      :options="options"
      @select="onCmd"
    />
  </base-card>
</template>
```

## 文件结构

```
vue-contextmenu-skill/
├── SKILL.md
├── README.md
├── base-contextmenu.md             # 本文件
└── demo-components/
    ├── shared/
    │   ├── tokens.css
    │   ├── list-item.css           # 菜单项渲染复用
    │   ├── demo.css
    │   └── contextmenu.css         # 弹层样式
    └── base-contextmenu/
        ├── html/
        │   └── 00-showcase.html    # 8 形态 + 4 联动场景
        └── screenshots/
            └── 00-showcase.png
```