# SYMLINKS — 软链接路径说明

本前端模板通过 `package.json` 的 `file:` 协议软链接 14 个 vue-* 依赖技能。**软链接路径只在特定目录结构下有效**，跨项目使用必须做适配。

## 现状

`template/frontend/package.json` 第 17-32 行使用以下 portal 内 4 级相对路径：

```json
"vue-login-skill": "file:../../../../vibeCoding/frontend/vue/vue-base-skill/vue-complex-skill/vue-login-skill",
"vue-layout-skill": "file:../../../../vibeCoding/frontend/vue/vue-base-skill/vue-layout-skill",
// ... 14 个 vue-* 子技能类似
```

**有效条件**：vue-admin-skill 仓库与 `vibeCoding/` 目录平级，且都位于 `vibecoding-portal/skills/` 下。

```
vibecoding-portal/
├── skills/
│   ├── vibecodingProjectsSkills/
│   │   └── vue-admin-skill/         ← 本技能
│   └── vibeCoding/
│       ├── frontend/
│       │   ├── vue/
│       │   │   ├── vue-base-skill/
│       │   │   ├── vue-login-skill/   （实际路径: vue-base-skill/vue-complex-skill/）
│       │   │   └── ...
│       └── frontend-request-skill/
```

## 跨项目使用（如 clone 到 D:/projects/java-vue-admin）

当 vue-admin-skill 被复制到 portal 之外的目录（如 `D:/projects/java-vue-admin/`）时，相对路径失效，pnpm install 会报 ENOENT。必须改 file: 为绝对路径：

```bash
# 在 D:/projects/java-vue-admin/frontend/package.json 中把：
#   "file:../../../../vibeCoding/frontend/..."
# 改为：
#   "file:D:/projects/vibecoding-portal/skills/vibeCoding/frontend/..."
```

**dogfooding 实例**：`D:/projects/java-vue-admin/frontend/package.json` 已使用绝对路径（见该文件实际内容），这是 java-vue-admin 能跑通的原因。

## 推荐做法（脚本化适配）

如需在多项目间复用 template，写一个 `fix-symlinks.js`：

```javascript
// scripts/fix-symlinks.js
import fs from 'node:fs'
import path from 'node:path'

const PORTAL_ROOT = process.env.WG_SKILLS_PORTAL || 'D:/projects/vibecoding-portal/skills'
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))

// 把 file:../../../../vibeCoding/... 替换为 file:<PORTAL_ROOT>/vibeCoding/...
for (const [name, dep] of Object.entries(pkg.dependencies || {})) {
  if (typeof dep === 'string' && dep.startsWith('file:../../../../vibeCoding/')) {
    const suffix = dep.slice('file:../../../../vibeCoding/'.length)
    pkg.dependencies[name] = `file:${PORTAL_ROOT}/vibeCoding/${suffix}`
  }
}
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
console.log('✓ symlinks 路径已改写为绝对路径')
```

## vue-login-skill 路径特殊性

vue-login-skill 是**唯一嵌套 2 层**的 vue-* 子技能：

```
vibeCoding/frontend/vue/vue-base-skill/
├── vue-card-skill/        ← 1 层
├── vue-layout-skill/      ← 1 层
└── vue-complex-skill/
    └── vue-login-skill/   ← 2 层
```

其他 13 个 vue-* 都在 `vue-base-skill/` 一层下（vue-login-skill 嵌套 1 层）。修改软链接脚本时需注意此差异（已通过 `// 路径说明` 注释字段在 package.json 中标注）。
