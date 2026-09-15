<script setup lang="ts">
/**
 * AppHeader — 顶栏（折叠按钮 + 面包屑 + 用户下拉菜单）
 */
import { ref } from 'vue';
import type { Breadcrumb } from './types';

interface Props {
  height: number;
  collapsed: boolean;
  breadcrumbs: Breadcrumb[];
  username: string;
  avatar?: string;
}

defineProps<Props>();

const emit = defineEmits<{
  'toggle-collapse': [];
  'logout': [];
  'user-click': [];
}>();

const showDropdown = ref(false);

function handleDropdownBlur() {
  // 延迟关闭，让 click 事件先触发
  setTimeout(() => { showDropdown.value = false; }, 150);
}
</script>

<template>
  <header class="app-header" :style="{ height: height + 'px' }">
    <!-- 左侧 -->
    <div class="app-header__left">
      <div class="app-header__trigger" @click="emit('toggle-collapse')">
        <span class="app-header__trigger-icon" :class="{ 'is-collapsed': collapsed }">☰</span>
      </div>

      <div v-if="breadcrumbs.length" class="app-header__crumbs">
        <template v-for="(crumb, i) in breadcrumbs" :key="i">
          <span v-if="i > 0" class="app-header__crumb-sep">/</span>
          <span
            class="app-header__crumb"
            :class="{ 'is-last': i === breadcrumbs.length - 1 }"
          >{{ crumb.label }}</span>
        </template>
      </div>
    </div>

    <!-- 右侧 -->
    <div class="app-header__right" @blur="handleDropdownBlur" tabindex="0">
      <div class="app-header__user" @click="showDropdown = !showDropdown">
        <div v-if="avatar" class="app-header__avatar">
          <img :src="avatar" alt="" />
        </div>
        <div v-else class="app-header__avatar app-header__avatar--placeholder">
          {{ username.charAt(0).toUpperCase() }}
        </div>
        <span class="app-header__username">{{ username }}</span>
        <span class="app-header__chevron" :class="{ 'is-open': showDropdown }">▾</span>
      </div>

      <!-- 下拉菜单 -->
      <transition name="dropdown">
        <div v-if="showDropdown" class="app-header__dropdown">
          <div class="app-header__dropdown-item" @click="emit('user-click')">
            <span class="app-header__dropdown-icon">👤</span>
            个人中心
          </div>
          <div class="app-header__dropdown-item">
            <span class="app-header__dropdown-icon">⚙️</span>
            系统设置
          </div>
          <div class="app-header__dropdown-divider"></div>
          <div class="app-header__dropdown-item app-header__dropdown-item--danger" @click="emit('logout')">
            <span class="app-header__dropdown-icon">🚪</span>
            退出登录
          </div>
        </div>
      </transition>
    </div>
  </header>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.18s ease-out;
  transform-origin: top right;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.9) translateY(-4px);
}
</style>
