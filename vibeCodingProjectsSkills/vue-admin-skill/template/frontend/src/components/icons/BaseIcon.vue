<!--
  BaseIcon —— 全项目图标唯一入口

  图标方案（唯一口径，详见 frontend/ICONS.md）：
    1) DB `wg_sys_menu.icon` / 路由 `meta.icon` 统一存 **kebab-case 图标名**（lucide 命名风格，
       如 `layout-dashboard` / `users` / `settings`），不存 Unicode 图形字符；
    2) 本组件把图标名映射到 frontend-icon-skill 的 SVG 模板并内联渲染；
    3) 未登记的图标名走兜底模板，绝不渲染成空白，也不会把原始字符串直接显示出来。
-->
<script setup lang="ts">
import { computed } from 'vue'
import { generateIcon, listTemplates } from 'frontend-icon-skill'

const props = withDefaults(defineProps<{
  /** 图标名（kebab-case，如 'layout-dashboard' / 'users' / 'settings'） */
  name: string
  /** 图标尺寸（px） */
  size?: number
  /** 描边色（CSS color） */
  color?: string
  /** 描边粗细 */
  strokeWidth?: number
}>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
})

/**
 * 图标名 → frontend-icon-skill 模板名。
 * 新增图标：先给 frontend-icon-skill 加模板并注册，再在这里登记别名（见 ICONS.md）。
 */
const ICON_TEMPLATE_MAP: Record<string, string> = {
  // 菜单 / 路由图标（与 DB wg_sys_menu.icon 取值一一对应）
  'layout-dashboard': 'dashboard',
  users: 'user',
  'shield-check': 'role',
  settings: 'menu',
  'building-2': 'building',
  briefcase: 'box',
  blocks: 'box',
  'link-2': 'tree',
  package: 'box',
  'bar-chart-3': 'chart',
  plug: 'box',                  // 应用管理（无原生 plug 模板，兜底 box）
  // 动作 / 状态图标
  plus: 'add',
  pencil: 'edit',
  'trash-2': 'delete',
  'alert-triangle': 'warning',
  'circle-check': 'success',
  // 直接使用模板名（同时允许 DB 里就写模板名）
  dashboard: 'dashboard',
  user: 'user',
  role: 'role',
  menu: 'menu',
  tree: 'tree',
  building: 'building',
  box: 'box',
  chart: 'chart',
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  search: 'search',
  success: 'success',
  warning: 'warning',
  'chevron-down': 'chevron-down',
}

/** 未登记图标名的兜底模板（保证有图形，不会空白） */
const FALLBACK_TEMPLATE = 'menu'

const templates = new Set(listTemplates())

/** 同一个未知图标名只告警一次，避免每帧刷屏 */
const warned = new Set<string>()

const svg = computed(() => {
  const mapped = ICON_TEMPLATE_MAP[props.name]
  if (!mapped && !templates.has(props.name) && !warned.has(props.name)) {
    warned.add(props.name)
    console.warn(
      `[BaseIcon] 未登记的图标名 "${props.name}"，已兜底渲染 "${FALLBACK_TEMPLATE}"。` +
        `请在 BaseIcon.vue 的 ICON_TEMPLATE_MAP 登记（见 frontend/ICONS.md）。`,
    )
  }
  const templateName = mapped ?? (templates.has(props.name) ? props.name : FALLBACK_TEMPLATE)
  return generateIcon(templateName, {
    size: props.size,
    color: props.color,
    strokeWidth: props.strokeWidth,
  })
})
</script>

<template>
  <span class="base-icon" v-html="svg" />
</template>

<style scoped>
.base-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  vertical-align: middle;
}
.base-icon :deep(svg) {
  display: block;
}
</style>
