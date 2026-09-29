---
name: frontend-icon-skill
description: Vue3 前端 SVG icon 一站式技能。生成 SVG 图标（18 个内置模板）、导出 PNG 图标（sharp）、处理图片（压缩/转格式/裁剪/水印/遮罩/合成），并内置标准 BaseIcon.vue 组件桥接所有需要 icon 的组件技能（menu/button/header 等）。触发词："生成 icon"、"生成 SVG 图标"、"做一套图标"、"生成 png 图标"、"处理图片"、"压缩图片"、"转 webp"、"加水印"、"图片合成"、"frontend-icon-skill"。
---

# frontend-icon-skill — SVG 图标 & PNG 导出 & 图片处理

取代 `image-forge-skill`（已合并），一个技能覆盖三种能力。

## 触发

- 「用 frontend-icon-skill 生成 cog、chart、bell 图标，24px 蓝色，输出到 static/icons」
- 「把 photo.jpg 压缩成 800 宽的 webp」
- 「给 banner 加黑色遮罩和白色标题文字」
- 「把 logo.png 合成到 photo.jpg 右上角」
- 「给登录页生成一套 PNG 图标，绿色 #059669，放 src/static/icons/login」

## 三种能力

### 1. SVG 图标生成（浏览器可用，零依赖）

| API | 说明 |
|-----|------|
| `generateIcon(name, options)` | → SVG 字符串 |
| `generateIconToFile(name, options, outDir)` | → 文件 |
| `generateIconSet(names[], options, dir)` | → 批量 |
| `listTemplates()` | → 全部模板名 |

```typescript
import { generateIconSet } from 'frontend-icon-skill'
await generateIconSet(['dashboard', 'user', 'role'], { size: 24, color: 'currentColor' }, './static/icons')
```

### 2. PNG 图标导出（Node only，需 sharp）

```typescript
import { generatePngIcon, generatePngSet } from 'frontend-icon-skill/png'
await generatePngSet(['user', 'role'], { size: 72, color: '#059669' }, './static/icons/png')
```

⚠️ `frontend-icon-skill/png` 子路径引入 node:child_process，**只允许在 Node 侧 import**，
浏览器组件必须从主入口 `frontend-icon-skill` 取 SVG API。

### 3. 图片处理 jobs（sharp 脚本）

```bash
cd <skill 目录> && npm install        # 首次
echo '<JSON>' | node image-forge.cjs -
```

- `jobs[].type: image`：压缩/转格式（jpeg/webp/png）/改尺寸（cover/contain/fill/inside/outside）/裁剪/base64/水印
- `jobs[].type: composite`：画布 + 多图层合成（image/color/text 图层）

字段详解见 [references/operation-schema.md](references/operation-schema.md)。

## Vue 组件桥接（标准 BaseIcon）

**本技能内置标准 BaseIcon.vue**，所有需要 icon 的组件技能统一从这里消费：

```typescript
import BaseIcon from 'frontend-icon-skill/components/BaseIcon.vue'
```

```vue
<BaseIcon name="layout-dashboard" :size="18" />
```

- 业务数据 icon 字段统一存 **kebab-case 图标名**（`layout-dashboard` / `users` / `settings`），不存 emoji
- BaseIcon 自动映射到模板渲染 SVG；未知名 `console.warn` + 兜底 `menu` 模板
- **vue-layout-skill**：AppSidebar / AppHeader / MenuItem 已桥接（Logo、折叠、菜单、用户下拉全部走 BaseIcon，零 emoji）
- **vue-button-skill**：BaseButton 的 `icon` prop 生效，icon + 文字并排，loading 时隐藏

## 模板库

18 个 SVG 模板（详见 [references/template-list.md](references/template-list.md)）：

- menu: 9 (dashboard/user/role/menu/settings/tree/building/box/chart)
- action: 5 (edit/delete/add/search/logout)
- status: 2 (success/warning)
- arrow: 2 (chevron-down/chevron-left)

## 与 icon-image-catch-skill 关系

- 模板有 → 直接生成
- 模板无 → 调用 icon-image-catch-skill 抓取，落地为新模板

## 执行边界

以下场景**超出本技能范围**，应拒绝并建议换工具：
- AI 图片放大（需超分模型）
- SVG 描迹（需矢量工具）
- 复杂艺术滤镜（需设计工具）
- 远程图片直接处理（需先下载，可用 icon-image-catch-skill）

## 不做

- 不引入第三方图标库（@iconify/vue / lucide-vue-next）
- 不做 Tailwind 等依赖

## 使用示例

详见 [references/usage.md](references/usage.md)、[examples/vue-admin-usage.md](examples/vue-admin-usage.md)。