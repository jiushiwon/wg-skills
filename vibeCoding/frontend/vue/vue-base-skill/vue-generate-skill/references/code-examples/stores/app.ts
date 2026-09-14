// src/stores/modules/app.ts
// 全局 app 状态（侧边栏折叠、主题、面包屑）

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'system';

export const useAppStore = defineStore('app', () => {
  // ========== State ==========
  const sidebarCollapsed = ref<boolean>(false);
  const themeMode = ref<ThemeMode>('light');
  const breadcrumb = ref<string[]>([]);
  const loading = ref<boolean>(false);

  // ========== Getters ==========
  const isDark = computed<boolean>(() => themeMode.value === 'dark');

  // ========== Actions ==========
  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setThemeMode(mode: ThemeMode): void {
    themeMode.value = mode;
  }

  function setBreadcrumb(items: string[]): void {
    breadcrumb.value = items;
  }

  function setLoading(value: boolean): void {
    loading.value = value;
  }

  // ========== Reset ==========
  function $reset(): void {
    sidebarCollapsed.value = false;
    themeMode.value = 'light';
    breadcrumb.value = [];
    loading.value = false;
  }

  return {
    // State
    sidebarCollapsed,
    themeMode,
    breadcrumb,
    loading,
    // Getters
    isDark,
    // Actions
    toggleSidebar,
    setThemeMode,
    setBreadcrumb,
    setLoading,
    $reset,
  };
});