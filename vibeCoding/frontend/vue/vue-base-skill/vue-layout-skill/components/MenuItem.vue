<script setup lang="ts">
/**
 * MenuItem — 递归菜单项
 * 支持多级嵌套、图标、角标、折叠态 tooltip
 */
import { computed } from 'vue';
import type { MenuItem as MenuItemData } from './types';

interface Props {
  item: MenuItemData;
  activeKey: string;
  openKeys: string[];
  collapsed: boolean;
  level: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [item: MenuItemData];
}>();

const isOpen = computed(() => props.openKeys.includes(props.item.key));
const isActive = computed(() => props.activeKey === props.item.key);
const hasChildren = computed(() => !!(props.item.children?.length));
const isCollapsedTop = computed(() => props.collapsed && props.level === 0);
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
    <!-- 菜单项本体 -->
    <div
      class="mi__label"
      :style="{ paddingLeft: isCollapsedTop ? '0' : (16 + level * 16) + 'px' }"
      :title="isCollapsedTop ? item.label : ''"
      @click="emit('click', item)"
    >
      <span v-if="item.icon" class="mi__icon">{{ item.icon }}</span>
      <span v-show="!isCollapsedTop" class="mi__text">{{ item.label }}</span>
      <span v-if="item.badge != null && !isCollapsedTop" class="mi__badge">{{ item.badge }}</span>
      <span v-if="hasChildren && !isCollapsedTop" class="mi__arrow" :class="{ 'is-open': isOpen }">▾</span>
    </div>

    <!-- 子菜单（递归） -->
    <transition name="mi-collapse">
      <div v-if="hasChildren && isOpen && !isCollapsedTop" class="mi__children">
        <MenuItem
          v-for="child in item.children"
          :key="child.key"
          :item="child"
          :active-key="activeKey"
          :open-keys="openKeys"
          :collapsed="collapsed"
          :level="level + 1"
          @click="(item) => emit('click', item)"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.mi-collapse-enter-active,
.mi-collapse-leave-active {
  transition: all 0.2s ease-out;
  overflow: hidden;
}
.mi-collapse-enter-from,
.mi-collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.mi-collapse-enter-to,
.mi-collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
