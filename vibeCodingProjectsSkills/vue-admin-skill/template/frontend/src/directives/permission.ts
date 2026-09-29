/**
 * v-permission 指令 —— 权限不足时移除 DOM 元素
 *
 * 权限码必须是三段式 `模块:资源:动作`，与后端 `AuthPerms` 和
 * DB `wg_sys_menu.permission` 逐字一致：
 *
 *   <base-button v-permission="'system:user:create'">新增</base-button>
 *   <base-button v-permission="['system:user:edit', 'system:user:delete']">操作</base-button>
 *
 * 判定语义见 `store/user.ts` 的 hasPermission（超管 `super_admin` 短路放行，其余全等匹配）。
 */
import type { App } from 'vue';
import { useUserStore } from '@/store/user';

export function setupPermissionDirective(app: App): void {
  app.directive('permission', {
    mounted(el: HTMLElement, binding: { value: string | string[] }) {
      const userStore = useUserStore();
      const required = Array.isArray(binding.value) ? binding.value : [binding.value];
      const ok = required.some((p) => userStore.hasPermission(p));
      if (!ok) {
        el.parentNode?.removeChild(el);
      }
    }
  });
}
