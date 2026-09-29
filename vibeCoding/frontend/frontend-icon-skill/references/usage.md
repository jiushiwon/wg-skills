# 使用示例

## 1. 单个生成

```typescript
import { generateIcon, generateIconToFile } from 'frontend-icon-skill'

// 仅获取 SVG 字符串（运行时使用）
const svg = generateIcon('dashboard', { size: 24, color: '#4f46e5', strokeWidth: 2 })
console.log(svg)
// <svg ... width="24" height="24" stroke="#4f46e5" ...>...</svg>

// 输出到文件（构建时使用）
await generateIconToFile('user', { size: 24 }, './static/icons')
// → ./static/icons/user.svg
```

## 2. 批量生成（管理后台常用 6 件套）

```typescript
import { generateIconSet } from 'frontend-icon-skill'

await generateIconSet(
  ['dashboard', 'user', 'role', 'menu', 'tree', 'building'],
  { size: 24, color: 'currentColor', strokeWidth: 2 },
  './static/icons'
)
// → ['./static/icons/dashboard.svg', './static/icons/user.svg', ...]
```

## 3. 配合 BaseIcon 组件（Vue 3）

**直接复用技能内置标准组件**（无需手写）—— 支持 kebab-case 别名映射、兜底渲染、单次告警：

```typescript
import BaseIcon from 'frontend-icon-skill/components/BaseIcon.vue'
```

使用：

```vue
<BaseIcon name="layout-dashboard" :size="18" />
<BaseIcon name="users" :size="20" color="#4f46e5" />
```

## 4. 列出所有可用模板

```typescript
import { listTemplates } from 'frontend-icon-skill'

console.log(listTemplates())
// ['dashboard', 'user', 'role', 'menu', 'settings', 'tree', 'building', 'box', 'chart',
//  'edit', 'delete', 'add', 'search', 'logout', 'success', 'warning', 'chevron-down', 'chevron-left']
```

## 5. 导出 PNG 图标（Node only，需 sharp）

```typescript
import { generatePngIcon, generatePngSet } from 'frontend-icon-skill/png'

await generatePngIcon('dashboard', { size: 48, color: '#4f46e5' }, './static/icons/png')
await generatePngSet(['user', 'role', 'settings'], { size: 72 }, './static/icons/png')
```

⚠️ 该子路径引入 node:child_process，仅限 Node 环境（favicon / uniapp tabBar / 小程序图标生成）。

## 6. 图片处理 jobs（自 image-forge-skill 合并）

```bash
cd <frontend-icon-skill 目录> && npm install
echo '{"outDir":"./dist","jobs":[{"type":"image","input":"a.jpg","format":"webp","resize":{"width":800,"fit":"cover"}}]}' | node image-forge.cjs -
```

详见 [operation-schema.md](operation-schema.md)。

## 7. 不在模板库怎么办？

调用 `icon-image-catch-skill` 抓取后，将 SVG 落地到 `frontend-icon-skill/icon-templates/` 作为新模板，再在 `registry.ts` 注册。

详见 `examples/vue-admin-usage.md`。
