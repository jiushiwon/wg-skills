# frontend-icon-skill

Vue3 SVG icon 模板化生成 + SVG→PNG 批量导出 + 图片处理（已合并 image-forge-skill）。

## 三大能力

| 能力 | 说明 | 入口 |
|------|------|------|
| **SVG 模板生成** | 18 个内置模板（menu/action/status/arrow），参数化渲染 SVG 字符串 | `src/index.ts` |
| **PNG 图标导出** | 模板 SVG → sharp 批量渲染 PNG（favicon / tabBar / 小程序） | `frontend-icon-skill/png` |
| **图片处理 jobs** | 压缩/转格式/裁剪/水印/遮罩/多图合成 | `node image-forge.cjs` |

## 快速使用（SVG）

```typescript
import { generateIconToFile } from 'frontend-icon-skill'

// 单个
await generateIconToFile('dashboard', { size: 24, color: '#4f46e5' }, './static/icons')

// 批量
await generateIconSet(['dashboard', 'user', 'role'], { size: 24 }, './static/icons')
```

## 快速使用（PNG 导出）

> ⚠️ 仅 Node 环境可用（依赖 sharp + node:child_process），勿在浏览器里 import。

```typescript
import { generatePngIcon, generatePngSet } from 'frontend-icon-skill/png'

await generatePngIcon('dashboard', { size: 48, color: '#4f46e5' }, './static/icons/png')
await generatePngSet(['user', 'role', 'settings'], { size: 72 }, './static/icons/png')
```

## Vue 组件桥接（BaseIcon）

组件技能（vue-layout-skill / vue-button-skill）统一从本技能取标准组件：

```typescript
import BaseIcon from 'frontend-icon-skill/components/BaseIcon.vue'
```

```vue
<BaseIcon name="layout-dashboard" :size="18" />
<BaseIcon name="users" :size="20" color="#4f46e5" />
```

`name` 传 kebab-case 图标名（如 `layout-dashboard` / `users` / `settings`），组件自动映射到模板渲染。
未登记的图标名会 `console.warn` 并兜底渲染 `menu` 模板，绝不会空白或显示原始字符串。

## 图片处理（jobs 模式）

```bash
echo '{"outDir":"./dist","jobs":[{"type":"image","input":"a.jpg","format":"webp","resize":{"width":800,"fit":"cover"}}]}' | node image-forge.cjs -
```

详细字段见 [references/operation-schema.md](references/operation-schema.md)（自 image-forge-skill 迁入）。

## 详细文档

- [references/template-list.md](references/template-list.md)：模板清单
- [references/usage.md](references/usage.md)：使用示例
- [references/operation-schema.md](references/operation-schema.md)：图片处理 jobs JSON 字段详解
- [examples/vue-admin-usage.md](examples/vue-admin-usage.md)：在 vue-admin-skill 中的集成

## 目录结构

```
frontend-icon-skill/
├── SKILL.md                       # 入口
├── README.md                      # 本文件
├── package.json                   # 导出入口 src/index.ts，sharp 依赖，image-forge bin
├── image-forge.cjs                # sharp 脚本（自 image-forge-skill 原样迁入，CommonJS）
├── components/
│   └── BaseIcon.vue               # 标准图标组件（供所有组件技能桥接）
├── icon-templates/                # 18 个 SVG 模板
│   ├── menu/{dashboard,user,role,menu,settings,tree,building,box,chart}.svg.template
│   ├── action/{edit,delete,add,search,logout}.svg.template
│   ├── status/{success,warning}.svg.template
│   └── arrow/{chevron-down,chevron-left}.svg.template
├── src/
│   ├── index.ts                   # 入口：generateIcon / generateIconToFile / generateIconSet / listTemplates
│   ├── png.ts                     # 子路径：generatePngIcon / generatePngSet（Node only）
│   ├── generator.ts               # 模板渲染引擎
│   ├── fetch.ts                   # fallback 到 icon-image-catch-skill
│   └── registry.ts                # icon 名 → 模板路径映射
├── references/
│   ├── template-list.md           # 模板清单
│   ├── usage.md                   # 使用示例
│   └── operation-schema.md        # 图片处理 jobs 字段详解（自 image-forge-skill 迁入）
├── test/
│   └── generate.test.ts           # 18 模板自测
└── examples/
    └── vue-admin-usage.md         # 在 vue-admin-skill 中的用法
```

## 占位符

模板支持 3 个占位符：

- `{{size}}` — 图标尺寸（默认 24）
- `{{color}}` — 描边色（默认 `currentColor`）
- `{{strokeWidth}}` — 线宽（默认 2）

## 依赖

- **SVG 模板生成**：零 npm 包（纯 Node fs + 字符串）
- **PNG 导出 / jobs**：需要 sharp（`npm install` 后可用，与旧 image-forge-skill 一致）