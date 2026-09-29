<!--
  AdminMenuItem — 递归菜单项（vue-admin-skill 本地版，渲染 SVG 图标）

  为什么不用 vue-layout-skill 的 MenuItem？
  vue-layout-skill 的 MenuItem.vue 用 <span>{{ item.icon }}</span> 直接输出 icon 字符串，
  无法渲染 SVG 组件。本组件把菜单图标统一交给 <BaseIcon :name="item.icon" />，
  icon 字段存图标名（kebab-case），未知名字由 BaseIcon 兜底，不会渲染成空白。

  不破坏 vue-layout-skill 子技能：本文件独立存在于 vue-admin-skill 本地。
-->
<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from './icons/BaseIcon.vue'

export interface AdminMenuItemData {
  id: number | string
  name: string
  path?: string
  /** 图标名（kebab-case），由 BaseIcon 映射到图形 */
  icon?: string
  children?: AdminMenuItemData[]
  disabled?: boolean
  badge?: number | string
}

interface Props {
  item: AdminMenuItemData
  activeKey: string
  openKeys: string[]
  collapsed: boolean
  level: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [item: AdminMenuItemData]
}>()

const isOpen = computed(() => props.openKeys.includes(String(props.item.id)))
const isActive = computed(() => props.activeKey === String(props.item.id))
const hasChildren = computed(() => !!(props.item.children?.length))
const isCollapsedTop = computed(() => props.collapsed && props.level === 0)
</script>

<template>
  <div
    class="mi"
    :class="{
      'is-active': isActive,
      'is-open': isOpen,
      'is-disabled': item.disabled,
      'is-collapsed-top': isCollapsedTop,
    }"
  >
    <div
      class="mi__label"
      :style="{ paddingLeft: isCollapsedTop ? '0' : (16 + level * 16) + 'px' }"
      :title="isCollapsedTop ? item.name : ''"
      @click="emit('click', item)"
    >
      <span v-if="item.icon" class="mi__icon">
        <BaseIcon :name="item.icon" :size="18" />
      </span>
      <span v-show="!isCollapsedTop" class="mi__text">{{ item.name }}</span>
      <span v-if="item.badge != null && !isCollapsedTop" class="mi__badge">{{ item.badge }}</span>
      <BaseIcon
        v-if="hasChildren && !isCollapsedTop"
        name="chevron-down"
        :size="14"
        class="mi__arrow"
        :class="{ 'is-open': isOpen }"
      />
    </div>

    <div v-if="hasChildren && isOpen && !isCollapsedTop" class="mi__children">
      <AdminMenuItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :active-key="activeKey"
        :open-keys="openKeys"
        :collapsed="collapsed"
        :level="level + 1"
        @click="(c) => emit('click', c)"
      />
    </div>
  </div>
</template>

<style scoped>
.mi { font-size: 14px; color: var(--color-text); }
.mi__label {
  display: flex; align-items: center; gap: var(--space-2);
  height: 40px; cursor: pointer; transition: background 0.15s;
  user-select: none;
}
.mi__label:hover { background: var(--color-background); }
.mi.is-active > .mi__label {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}
.mi__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; flex-shrink: 0;
}
.mi__icon :deep(svg) { display: block; }
.mi__text { flex: 1; }
.mi__badge {
  font-size: 12px; padding: 0 6px; border-radius: 10px;
  background: var(--color-danger); color: #fff;
}
.mi__arrow { flex-shrink: 0; opacity: 0.6; transition: transform 0.2s; }
.mi__arrow.is-open { transform: rotate(180deg); }
.mi__children { padding-left: 0; }
.mi.is-collapsed-top { text-align: center; }
</style>
