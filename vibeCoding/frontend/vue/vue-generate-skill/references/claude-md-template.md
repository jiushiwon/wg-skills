# CLAUDE.md 模板（≤ 50 行）

> **硬约束：CLAUDE.md 不得超过 50 行。** 超出部分移到 AGENTS.md。

---

## 模板（47 行）

```markdown
# {{PROJECT_NAME}}

## 项目简介
[一句话产品定位] + [技术栈一行：Vue3 + TS + Vite + Pinia + Element Plus]

## 必须依赖 Skill
- **frontend-request-skill**：请求层规范（fetch + 响应信封 + Token 刷新队列）

## 红线（必须遵守）
1. 不使用 any（必要时用 unknown + 类型守卫）
2. 不写 console.log（debug 用 debugger）
3. 不用 Options API（统一 Composition API + <script setup lang="ts">）
4. 组件 props 用 defineProps<T>()，不用运行时声明
5. 优先用 Element Plus 组件，不手写同类 UI
6. 业务组件复用 ≥3 次才抽到 src/components/
7. 业务代码只用 var(--color-*) 等 CSS 变量，不写裸色值
8. 请求统一走 src/api/request.ts（fetch 标准，不用 axios）
9. 鉴权跳转统一交给 src/services/auth.service.ts

## 目录约定
- src/views/ 页面（一个页面一个 .vue）
- src/components/ 业务组件（仅复用 ≥3 次）
- src/api/modules/ 接口（按业务模块聚合）
- src/services/ 业务服务（鉴权收口）
- src/composables/ 组合式函数
- src/stores/modules/ Pinia（Setup 风格）
- src/utils/ 通用工具
- src/styles/tokens.css 主题变量

## 触发词
- "加个新页面" → 自动建 src/views/<Name>.vue
- "加个新组件" → 先评估是否复用 ≥3 次
- "加个接口" → 自动加到 src/api/modules/<module>.ts
- "加个 Pinia store" → 自动建 src/stores/modules/<name>.ts
- "调个 bug" → 先复现 → 定位 → 修复 → 复测

## 完成后必跑
1. npm run type-check（vue-tsc --noEmit，0 error）
2. npm run lint（0 error）
3. npm run build（构建成功）
```

---

## 行数验证

```bash
wc -l CLAUDE.md    # 必须 ≤ 50
```

---

## 关键改动（相对于通用模板）

本模板**与 frontend-request-skill 严格对齐**：

| 项 | 说明 |
|----|------|
| **必须依赖 Skill** | 显式声明依赖 `frontend-request-skill`，避免重复造轮子 |
| **红线 8** | 请求统一走 `request.ts`（fetch 标准，不用 axios） |
| **红线 9** | 鉴权跳转统一交给 `auth.service.ts`（不写在组件里） |
| **目录新增** | `src/services/` 用于鉴权收口（不与 stores 混用） |
| **响应信封** | 隐含约定：所有接口返回 `{ code, message, data }`（见 `types/api.ts`） |

---

## 反模式（禁止）

### ❌ 反模式 1：写 1800 行的"专业" CLAUDE.md

AI 不会逐字读完。**CLAUDE.md 应该 30 秒读完**。

### ❌ 反模式 2：把 ESLint / Prettier / TypeScript 规则塞进 CLAUDE.md

规则在 `.eslintrc.cjs` / `.prettierrc.json` / `tsconfig.json` 里。CLAUDE.md 只写**本项目的特定约束**。

### ❌ 反模式 3：声明使用 axios 或其他 HTTP 库

必须用 `fetch`。`frontend-request-skill` 已经统一标准。

### ❌ 反模式 4：在 CLAUDE.md 里写详细的 API 文档

API 文档应该在 `src/api/modules/<module>.ts` 的 JSDoc 里。

---

## 经验值（CLAUDE.md 行数 vs AI 行为）

| 行数 | AI 实际行为 |
|------|-----------|
| ≤ 50 | ✅ 全部读完，理解所有约束 |
| 50-200 | ⚠️ 大部分读完，遗漏细节 |
| 200-500 | ⚠️ 重点读完，跳过部分 |
| 500-1000 | ❌ 选择性忽略 |
| 1000+ | ❌ 几乎不读 |

**CLAUDE.md 是"电梯演讲"，不是"技术文档"。**
