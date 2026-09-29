import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getMenus, type MenuNode } from '@/api/auth';

export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<MenuNode[]>([]);
  const loaded = ref(false);

  async function loadMenus(): Promise<void> {
    if (loaded.value) return;
    menus.value = await getMenus();
    loaded.value = true;
  }

  function reset(): void {
    menus.value = [];
    loaded.value = false;
  }

  return { menus, loaded, loadMenus, reset };
});
