// ponytail: Vite/esbuild 对 .svg.template 双扩展没有 loader，import.meta.glob + ?raw 都失效（测试覆盖）。
// 解决：直接把 15 个模板内联到 JS 字面量（~5KB），零构建依赖、零 IO、零 file: 物理副本陷阱。
// 这是 ponytail 接受的最小修复：与其写一个 Vite 插件处理未知扩展，不如内联一次性。

const RAW_TEMPLATES: Record<string, string> = {
  // menu
  'menu/chart.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="20" x2="4" y2="10"/><line x1="10" y1="20" x2="10" y2="4"/><line x1="16" y1="20" x2="16" y2="14"/><line x1="20" y1="20" x2="20" y2="8"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  'menu/menu.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="7" cy="6" r="1"/><circle cx="7" cy="12" r="1"/><circle cx="7" cy="18" r="1"/></svg>`,
  'menu/user.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  'menu/role.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="16" r="2"/><path d="M12 14V8"/><circle cx="12" cy="6" r="2"/><path d="M5 10a7 7 0 0 1 14 0"/><path d="M3 18l1.5-4"/><path d="M21 18l-1.5-4"/></svg>`,
  'menu/tree.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><circle cx="5" cy="14" r="2"/><circle cx="19" cy="14" r="2"/><circle cx="12" cy="20" r="2"/><path d="M12 6L6 12"/><path d="M12 6l6 6"/><path d="M7 16l3 2"/><path d="M17 16l-3 2"/></svg>`,
  'menu/building.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><line x1="9" y1="7" x2="9" y2="7.01"/><line x1="15" y1="7" x2="15" y2="7.01"/><line x1="9" y1="11" x2="9" y2="11.01"/><line x1="15" y1="11" x2="15" y2="11.01"/><line x1="9" y1="15" x2="9" y2="15.01"/><line x1="15" y1="15" x2="15" y2="15.01"/><path d="M10 21v-4h4v4"/></svg>`,
  'menu/box.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  'menu/settings.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  'menu/dashboard.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
  // action
  'action/edit.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  'action/logout.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  'action/delete.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  'action/add.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  'action/search.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  // status
  'status/success.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11.5 14.5 16 9.5"/></svg>`,
  'status/warning.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  // arrow
  'arrow/chevron-down.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  'arrow/chevron-left.svg.template': `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
}

export const TEMPLATE_REGISTRY: Record<string, string> = {
  // menu
  dashboard: 'menu/dashboard.svg.template',
  user: 'menu/user.svg.template',
  role: 'menu/role.svg.template',
  menu: 'menu/menu.svg.template',
  tree: 'menu/tree.svg.template',
  building: 'menu/building.svg.template',
  box: 'menu/box.svg.template',
  chart: 'menu/chart.svg.template',
  settings: 'menu/settings.svg.template',
  // action
  edit: 'action/edit.svg.template',
  delete: 'action/delete.svg.template',
  add: 'action/add.svg.template',
  search: 'action/search.svg.template',
  logout: 'action/logout.svg.template',
  // status
  success: 'status/success.svg.template',
  warning: 'status/warning.svg.template',
  // arrow
  'chevron-down': 'arrow/chevron-down.svg.template',
  'chevron-left': 'arrow/chevron-left.svg.template',
}

export function loadTemplate(name: string): string {
  const rel = TEMPLATE_REGISTRY[name]
  if (!rel) {
    throw new Error(`[frontend-icon-skill] icon "${name}" not in registry. Available: ${Object.keys(TEMPLATE_REGISTRY).join(', ')}`)
  }
  const tmpl = RAW_TEMPLATES[rel]
  if (!tmpl) {
    throw new Error(`[frontend-icon-skill] template "${rel}" not inlined.`)
  }
  return tmpl
}

export function listTemplates(): string[] {
  return Object.keys(TEMPLATE_REGISTRY)
}

/**
 * kebab-case 别名 → 模板名（与 vue 项目 DB / 路由 meta 的 icon 取值一一对应）。
 * 统一收口在此，BaseIcon.vue 与 png.ts 都从这里取，避免两处各自维护别名表。
 */
export const TEMPLATE_ALIASES: Record<string, string> = {
  // 菜单 / 路由图标（与 DB wg_sys_menu.icon 取值一一对应）
  'layout-dashboard': 'dashboard',
  users: 'user',
  'shield-check': 'role',
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
}

/** 解析图标名 → 模板名：优先别名表，其次原样若是模板名则透传，否则 null */
export function resolveTemplateName(name: string): string | null {
  if (name in TEMPLATE_ALIASES) return TEMPLATE_ALIASES[name]
  if (name in TEMPLATE_REGISTRY) return name
  return null
}