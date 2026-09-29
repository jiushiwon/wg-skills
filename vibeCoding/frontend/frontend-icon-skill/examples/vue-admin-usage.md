# vue-admin-skill 集成 frontend-icon-skill

vue-admin-skill 不再内置 SVG 字典，全部通过 [frontend-icon-skill](../../frontend/frontend-icon-skill/) 渲染。

## 1. package.json 加软链接

```json
{
  "dependencies": {
    "frontend-icon-skill": "file:../../../../vibeCoding/frontend/frontend-icon-skill",
    ...
  }
}
```

## 2. 生成默认 7 个 icon 到 static/icons/

```bash
cd "D:/projects/vibecoding-portal/skills/vibeCoding/frontend/frontend-icon-skill"
node --experimental-strip-types -e "
import('./src/index.ts').then(async ({generateIconSet}) => {
  await generateIconSet(
    ['dashboard', 'user', 'role', 'menu', 'tree', 'building', 'box'],
    { size: 24, color: 'currentColor', strokeWidth: 2 },
    'D:/projects/vibecoding-portal/skills/vibeCodingProjectsSkills/vue-admin-skill/template/frontend/static/icons'
  )
  console.log('✅ 7 个默认 icon 生成完成')
})
"
```

输出目录：

```
vue-admin-skill/template/frontend/static/icons/
├── dashboard.svg
├── user.svg
├── role.svg
├── menu.svg
├── tree.svg
├── building.svg
└── box.svg
```

## 3. 写 static/icons/index.ts（统一导出）

```typescript
// template/frontend/static/icons/index.ts
export { default as DashboardIcon } from './dashboard.svg?raw'
export { default as UserIcon } from './user.svg?raw'
export { default as RoleIcon } from './role.svg?raw'
export { default as MenuIcon } from './menu.svg?raw'
export { default as TreeIcon } from './tree.svg?raw'
export { default as BuildingIcon } from './building.svg?raw'
export { default as BoxIcon } from './box.svg?raw'
```

## 4. BaseIcon 用技能内置标准组件

frontend-icon-skill 已内置标准 `components/BaseIcon.vue`（支持 kebab-case 别名、兜底渲染），
业务项目直接用，不再手写。

```vue
<!-- 任意业务页面 / 组件 -->
<script setup lang="ts">
import BaseIcon from 'frontend-icon-skill/components/BaseIcon.vue'
</script>

<template>
  <BaseIcon name="user" :size="18" />
</template>
```

如需在 `@/components/icons/BaseIcon.vue` 留一层本地转发（便于全局注册），一行即可：

```typescript
export { default } from 'frontend-icon-skill/components/BaseIcon.vue'
```

## 5. 在业务页面使用

```vue
<template>
  <base-card title="用户管理">
    <template #header-right>
      <BaseIcon name="user" :size="18" />
    </template>
    <base-table :data="users" :columns="columns" />
  </base-card>
</template>

<script setup lang="ts">
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useUsers } from './useUsers'
const { users, columns } = useUsers()
</script>
```

## 6. 数据库 menu.icon 字段映射

后端 `menu` 表的 `icon` 字段存的是 **icon name**（如 `'dashboard'`），不是 SVG path。

前端 `<BaseIcon :name="menu.icon" />` 会自动渲染对应 SVG。

## 7. 扩展新图标

若模板库没有需要的 icon：

1. 调用 [icon-image-catch-skill](../../frontend/icon-image-catch-skill/) 抓取
2. 把 SVG 落入 `frontend-icon-skill/icon-templates/<category>/<name>.svg.template`
3. 在 `frontend-icon-skill/src/registry.ts` 注册
4. 跑 `node --experimental-strip-types test/generate.test.ts` 验证
5. 重新 `generateIconSet()` 生成到 `static/icons/`
