# vue-base-skill 组件实现统一规范

> 本规范用于把 14 个 vue-* 子技能包从「纯 markdown 文档」补齐为「可 npm 软链接的 .vue 组件库」。
>
> **唯一目标**：让 `import { BaseCard } from 'vue-card-skill'` 在 vue-admin-skill 里能正确解析。

---

## 1. 包结构约定

每个子包必须新增以下文件：

```
vue-{xxx}-skill/
├── SKILL.md                      （已存在，不动）
├── README.md                     （已存在，不动）
├── base-xxx.md                   （已存在，不动，作为实现依据）
├── package.json                  ← 新增
└── components/
    ├── index.ts                  ← 新增（统一导出）
    └── BaseXxx.vue               ← 新增（1-N 个组件）
```

---

## 2. package.json 模板

```json
{
  "name": "vue-{xxx}-skill",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./components/index.ts",
  "exports": {
    ".": "./components/index.ts",
    "./*": "./*"
  },
  "peerDependencies": {
    "vue": "^3.4.0"
  }
}
```

**注意**：
- 必须 `"private": true`（避免误发布到 npm）
- `main` 必须指向 `components/index.ts`
- `peerDependencies` 声明 vue，避免重复打包

---

## 3. components/index.ts 模板

```typescript
import BaseXxx from './BaseXxx.vue'

export { BaseXxx }
export default BaseXxx
```

多组件版本：

```typescript
import BaseForm from './BaseForm.vue'
import BaseFormItem from './BaseFormItem.vue'
import BaseFormRender from './BaseFormRender.vue'

export { BaseForm, BaseFormItem, BaseFormRender }
export default BaseForm
```

---

## 4. .vue 文件命名与组件名约定

| 项 | 约定 |
|----|------|
| 文件名 | PascalCase：`BaseCard.vue` |
| 组件名（`<script setup>`） | PascalCase：`BaseCard` |
| 模板使用 | kebab-case：`<base-card>` |
| 默认导出 | 第一个组件作为 default export |

Vue3 在 `<script setup>` 下组件名自动从文件名 PascalCase 推导，无需 `defineOptions({ name: 'BaseCard' })`。

---

## 5. 组件实现铁律

### 5.1 零 HTML5 原生控件标签

**禁止使用**：
- ❌ `<button>`（用 `<div role="button" tabindex="0">` + `@click` + `@keydown.enter`）
- ❌ `<input>` / `<textarea>`（用 `<div contenteditable>` 或纯展示型 div）
- ❌ `<select>` / `<option>`（用 `<ul role="listbox">` + `<li role="option">`）
- ❌ `<table>` / `<tr>` / `<td`（用 `<div role="table">` + ARIA 角色）
- ❌ `<form>`（用 `<div role="form">`）

**理由**：vue-base-skill 体系强调「所有控件可定制」，原生 HTML 标签会被浏览器默认样式穿透。

### 5.2 零硬编码 CSS 值

**禁止**：
- ❌ `color: #1890ff`（用 `var(--color-primary)`）
- ❌ `padding: 16px`（用 `var(--space-4)`）
- ❌ `border-radius: 6px`（用 `var(--radius-md)`）
- ❌ `font-size: 14px`（用 `var(--font-base)`）
- ❌ `height: 36px`（用 `var(--height-button-md)`）

**允许的 CSS 变量**（来自 vue-theme-skill）：

```css
/* 颜色 */
--color-primary / --color-success / --color-warning / --color-danger / --color-info
--color-surface / --color-background / --color-border
--color-text / --color-text-secondary / --color-text-inverse / --color-text-placeholder

/* 间距 */
--space-1 (4px) / --space-2 (8px) / --space-3 (12px) / --space-4 (16px)
/--space-5 (20px) / --space-6 (24px) / --space-8 (32px)

/* 字号 */
--font-xs / --font-sm / --font-base / --font-lg / --font-xl

/* 圆角 */
--radius-sm (2px) / --radius-md (6px) / --radius-lg (12px) / --radius-full (9999px)

/* 高度 */
--height-button-sm (28px) / --height-button-md (36px) / --height-button-lg (44px)
--height-input-sm / --height-input-md / --height-input-lg

/* 阴影 */
--shadow-sm / --shadow-md / --shadow-lg

/* 过渡 */
--transition-fast (0.15s) / --transition-base (0.2s) / --transition-slow (0.3s)
```

**如果变量不存在**：在组件 CSS 中定义 fallback：`padding: var(--space-4, 16px);`

### 5.3 容器原则

- 所有 base-* 组件在用户使用时，**应被 `<base-card>` 包裹**
- 组件本身不需要 base-card（避免嵌套过深），但布局应假定外层是 base-card

### 5.4 Props / Events / Slots 命名

| 类型 | 约定 |
|------|------|
| 双向绑定 | `modelValue` + `update:modelValue`（Vue3 v-model 默认） |
| 命名 | camelCase（如 `placeholder` / `disabled` / `loading`） |
| 布尔属性 | 直接 boolean（不加 is 前缀） |
| 事件 | 动宾结构：`change` / `clear` / `select` / `submit` |
| Slot | 语义化：`default` / `header` / `footer` / `prefix` / `suffix` |

### 5.5 TypeScript

- `<script setup lang="ts">`
- props 用 `defineProps<{ ... }>()` 泛型
- emits 用 `defineEmits<{ ... }>()` 泛型
- 复杂类型放在 `types/*.ts` 中导出

---

## 6. 实施 checklist

每个包完成后，必须自检：

- [ ] `package.json` 包含 `type: module`、`main: ./components/index.ts`、`peerDependencies.vue`
- [ ] `components/index.ts` 导出所有组件 + 默认导出
- [ ] 所有 .vue 文件用 `<script setup lang="ts">`
- [ ] 所有 CSS 用 `var(--xxx)` 变量，无硬编码颜色/间距/字号
- [ ] 零 HTML5 原生控件标签
- [ ] 组件名 PascalCase，文件名 PascalCase，模板使用 kebab-case
- [ ] 在 vue-admin-skill 的 `views/` 下能用 `import { BaseXxx } from 'vue-{xxx}-skill'` 引用

---

## 7. 不要做的事

- ❌ 不引入新依赖（如 lodash / dayjs 等）—— 14 个包都用纯 Vue3 + CSS 实现
- ❌ 不修改 SKILL.md / README.md / base-xxx.md 文档内容（文档即规范）
- ❌ 不创建 demo-components/ 下的演示文件（演示用现有 HTML 即可）
- ❌ 不在 package.json 加 build 脚本（保持纯组件库，TS 由 vue-admin-skill 的 vite 处理）
- ❌ 不写测试（vue-admin-skill 启动即验证）

---

## 8. 与 vue-admin-skill 的对接

vue-admin-skill/template/frontend/package.json 已有：

```json
"vue-card-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-card-skill",
```

只要 14 个包的 package.json + components/index.ts 写对，软链接就能解析。

之后 vue-admin-skill/views/**/*.vue 中：

```vue
<script setup lang="ts">
import { BaseCard, BaseTable, BaseForm } from '@/components/...'
</script>
```

需要替换为：

```vue
<script setup lang="ts">
import { BaseCard } from 'vue-card-skill'
import { BaseTable } from 'vue-table-skill'
import { BaseForm } from 'vue-form-skill'
</script>
```