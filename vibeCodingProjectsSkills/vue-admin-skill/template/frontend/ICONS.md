# 图标系统

> 本模板的图标方案**只有一套**：**图标名（kebab-case）→ `BaseIcon` → frontend-icon-skill 模板**。
> DB 字段、路由 meta、页面里出现的都是「图标名」，图形由 `BaseIcon` 渲染。

## 一、唯一口径

| 环节 | 约定 |
|------|------|
| DB `wg_sys_menu.icon` | 存**图标名**（kebab-case），如 `users` / `settings` / `layout-dashboard` |
| 路由 `meta.icon` | 同上（`src/router/index.ts`） |
| 后端 `GET /api/auth/menus` 返回的 `icon` | 同上，前端 `<BaseIcon :name="menu.icon" />` 直接消费 |
| 组件 | `src/components/icons/BaseIcon.vue`（名称 → frontend-icon-skill 模板） |
| 图形来源 | [frontend-icon-skill](../../../../frontend/frontend-icon-skill/SKILL.md) 的 SVG 模板（15 个内置） |

**禁止**：

- 禁止在 DB 或接口里存 Unicode 图形字符（历史数据里的这类值会走兜底渲染，读起来是错的）；
- 禁止在页面里另外维护一套 SVG 字典或引入第三方图标库；
- 禁止在业务页里直接输出 `icon` 字符串。

## 二、图标名清单

`BaseIcon` 内置的别名表（`ICON_TEMPLATE_MAP`）覆盖下列图标名，右边是实际使用的
frontend-icon-skill 模板：

| 图标名（推荐写进 DB） | 映射模板 | 用途 |
|----------------------|----------|------|
| `layout-dashboard` | dashboard | 仪表盘 / 首页 / Logo |
| `users` | user | 用户管理 |
| `shield-check` | role | 角色 / 权限 |
| `settings` | menu | 系统设置 / 菜单管理 |
| `building-2` | building | 组织架构 |
| `briefcase` | box | 岗位管理 |
| `blocks` | box | 租户 / 模块 / 商品 |
| `link-2` | tree | 接入应用 / 关联关系 |
| `package` | box | 商品 |
| `bar-chart-3` | chart | 统计 / 报表 |
| `plus` | add | 新增 |
| `pencil` | edit | 编辑 |
| `trash-2` | delete | 删除 |
| `alert-triangle` | warning | 警告 |
| `circle-check` | success | 成功 |

模板名本身也可直接作为图标名使用（`dashboard` / `user` / `role` / `menu` / `tree` /
`building` / `box` / `chart` / `add` / `edit` / `delete` / `search` / `success` /
`warning` / `chevron-down`），新旧数据都能渲染。

**未知名字的兜底**：未登记的名字不会渲染成空白，也不会把原始字符串显示出来 ——
`BaseIcon` 会兜底成 `menu` 模板，并在控制台 warn 一次（提示去登记别名）。

## 三、怎么用

```vue
<script setup lang="ts">
import BaseIcon from '@/components/icons/BaseIcon.vue'
</script>

<template>
  <BaseIcon name="users" :size="18" />
  <BaseIcon name="layout-dashboard" :size="20" color="#6366f1" />
  <!-- 菜单图标：直接消费后端返回的图标名 -->
  <BaseIcon :name="menu.icon || 'menu'" :size="18" />
</template>
```

侧边栏（`AdminSidebar.vue` → `AdminMenuItem.vue`）与 KPI 卡片（`views/dashboard`）都已走这套口径。

## 四、新增一个图标

图标不在内置模板库里时，两步：

1. **加模板**：在 `vibeCoding/frontend/frontend-icon-skill/icon-templates/<分类>/<name>.svg.template`
   新建模板（占位符 `{{size}}` / `{{color}}` / `{{strokeWidth}}`），并在该技能的
   `src/registry.ts` 的 `TEMPLATE_REGISTRY` 注册；跑一次 `test/generate.test.ts` 验证。
   > 若该图标不在 lucide / iconify 等开源库，按 frontend-icon-skill 的说明 fallback 抓取。
2. **登记别名**：在本模板 `src/components/icons/BaseIcon.vue` 的 `ICON_TEMPLATE_MAP` 里加一行
   `'<图标名>': '<模板名>'`，然后把这个图标名写进 DB 菜单 / 路由 meta。

DB 侧不需要任何改动（仍是同一个 `icon` 字段）。

## 五、不做

- **不引入第三方图标库**（lucide-vue-next / @iconify/vue）：与 vue-admin-skill 零第三方依赖原则冲突
- **不在业务页写内联 SVG**：SVG 统一由 frontend-icon-skill 模板库管理
- **不维护多套图标系统**：`BaseIcon` 是唯一入口，`BaseIcon` 背后的图形来源只有 frontend-icon-skill
