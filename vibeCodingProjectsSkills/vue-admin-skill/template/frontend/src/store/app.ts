import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Breadcrumb {
  label: string;
  path?: string;
}

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false);
  const breadcrumbs = ref<Breadcrumb[]>([]);

  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setBreadcrumbs(items: Breadcrumb[]): void {
    breadcrumbs.value = items;
  }

  return { sidebarCollapsed, breadcrumbs, toggleSidebar, setBreadcrumbs };
});
