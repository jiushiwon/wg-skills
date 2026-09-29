import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getMenus, type MenuNode } from '@/api/auth';

const MENUS_CACHE_KEY = 'vue_admin_menus_cache';
const MENUS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 分钟

interface CachedMenus {
  menus: MenuNode[];
  ts: number;
}

/** ponytail: 刷新页面后菜单不丢失的设计
 *
 * 1. token 持久化（utils/auth.ts）让刷新后能调 /api/auth/me
 * 2. 菜单数据也持久化（localStorage）—— 避免每次刷新都发 /api/auth/menus 请求
 * 3. 但 5 分钟过期强制刷新一次 —— 后端菜单变更能及时生效
 * 4. logout 必须清缓存（user.ts 的 logout 已调 reset() → reset 会清缓存）
 */
function loadCached(): CachedMenus | null {
  try {
    const raw = localStorage.getItem(MENUS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedMenus;
    if (!parsed.ts || Date.now() - parsed.ts > MENUS_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCached(menus: MenuNode[]): void {
  try {
    const payload: CachedMenus = { menus, ts: Date.now() };
    localStorage.setItem(MENUS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage 满或禁用 —— 静默
  }
}

function clearCache(): void {
  try {
    localStorage.removeItem(MENUS_CACHE_KEY);
  } catch {
    // ignore
  }
}

export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<MenuNode[]>([]);
  const loaded = ref(false);

  /**
   * 加载当前用户菜单。
   * - 第一次从后端拉
   * - 之后优先用 localStorage 缓存（5 分钟内）
   * - 过期或显式 force=true 强制重新拉
   */
  async function loadMenus(force = false): Promise<void> {
    if (loaded.value && !force) return;

    if (!force) {
      const cached = loadCached();
      if (cached) {
        menus.value = cached.menus;
        loaded.value = true;
        return;
      }
    }

    menus.value = await getMenus();
    loaded.value = true;
    saveCached(menus.value);
  }

  function reset(): void {
    menus.value = [];
    loaded.value = false;
    clearCache();
  }

  return { menus, loaded, loadMenus, reset };
});