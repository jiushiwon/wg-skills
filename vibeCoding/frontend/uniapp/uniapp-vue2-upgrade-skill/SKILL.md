---
name: uniapp-vue2-upgrade-skill
description: 当用户要求把 uniapp Vue2 + Options API 项目升级到 Vue3 + Composition API + TypeScript + Pinia 时触发。本 skill 输出升级方案、迁移指南与差异清单，**不直接修改、不重构、不执行升级**。仅当用户确认方案后才执行迁移。
---

# UniApp Vue2 → Vue3 Upgrade Skill

## 定位

本 skill 专门协助把 **Vue2 + Options API** 的 uniapp 项目平滑升级到 **Vue3 + Composition API + TypeScript + Pinia**，识别升级阻塞点、给出迁移方案、生成差异清单，**仅在用户明确同意后才执行升级**。

> Vue2 项目可以**继续被 `uniapp-code-audit-skill` 审计**（Vue3 专属检查项标注为"不适用"），无需先升级。本 skill 是"主动升级"场景的方案输出工具，不是"强制迁移"。

## When to Use

触发此 skill 时使用：

- "vue2 升级 vue3"
- "uniapp 迁移"
- "小程序升级"
- "Options API 转 Composition API"
- "Vuex 迁移到 Pinia"
- "把 vue2 项目升级到 vue3"

## 不触发场景

- "审计这个 vue2 项目" — 应用 `uniapp-code-audit-skill`，本 skill 不参与
- "生成新项目" — 应用 `uniapp-app-generate-skill`，默认生成 Vue3 项目
- "在 vue2 中加新功能" — 继续在 Vue2 中开发

## Workflow

```
Phase 1: 现状评估
  → 扫描项目结构、技术栈、Options API 使用情况
  → 评估升级阻塞点（依赖兼容性、第三方库、自研组件库）
  → 输出"升级就绪度报告"

Phase 2: 方案设计
  → 选择升级策略：
     A. 全量升级（一键全替换）
     B. 渐进式升级（先 Vue2.7 过渡，再升级 Vue3）
     C. 双轨并行（新功能 Vue3，老代码逐步迁移）
  → 输出"升级方案 + 风险清单 + 工时估算"

Phase 3: 用户确认
  → 用户 review 方案
  → 确认后才执行迁移

Phase 4: 迁移执行
  → 按方案逐步替换
  → Options API → Composition API
  → Vuex → Pinia
  → mixins → composables
  → JS → TS（可选）

Phase 5: 验证交付
  → npm run lint
  → npm run type-check
  → npm run build:mp-weixin
  → 三端真机/模拟器回归测试
```

## 升级范围（典型 Vue2 → Vue3 差异）

| 维度 | Vue2 写法 | Vue3 写法 | 难度 |
|------|-----------|-----------|------|
| **API 风格** | Options API（`data`/`methods`/`computed`/`watch`） | Composition API（`ref`/`reactive`/`computed`/`watch`） | 中 |
| **组件定义** | `export default { name, props, data, ... }` | `<script setup>` + `defineProps`/`defineEmits`/`defineExpose` | 中 |
| **生命周期** | `created`/`mounted`/`beforeDestroy` | `onMounted`/`onUnmounted`（无 `beforeDestroy`） | 低 |
| **状态管理** | Vuex（`state`/`mutations`/`actions`/`getters`） | Pinia（`defineStore` setup 风格） | 中 |
| **类型系统** | 可选 TypeScript | 默认 TypeScript 严格模式 | 中 |
| **混入** | `mixins: [...]` | 自定义 composables + `useXxx()` | 中 |
| **过滤器** | `{{ value \| filter }}` | 计算属性或方法 | 低 |
| **插槽语法** | `slot="foo"` `slot-scope="scope"` | `#foo` `v-slot:foo="scope"` | 低 |
| **路由** | uni-app 自带路由 | 不变 | — |
| **构建** | HBuilderX / vue-cli | Vite + `@dcloudio/vite-plugin-uni` | 中 |

## 升级阻塞点（常见）

1. **第三方 UI 库 / 组件库**：未发布 Vue3 版本
2. **Vuex 模块**：Vuex 4 仍可用但迁移 Pinia 收益更高
3. **uni-app 插件市场**：部分插件只支持 Vue2
4. **`sync` 修饰符**：Vue3 移除，需用 `v-model:xxx` 或事件替代
5. **`$listeners`**：Vue3 移除，需用 `$attrs` + `emits`
6. **过滤器 / `filter` 关键字**：Vue3 移除
7. **`keyCode` 修饰符**：Vue3 移除，需用按键名
8. **`v-if` / `v-for` 优先级**：Vue3 中 `v-if` 优先级高于 `v-for`

## 风险等级

| 等级 | 说明 |
|------|------|
| **P0** | 必须先解决才能升级（如 uni-app 核心库版本） |
| **P1** | 需要评估兼容性，必要时寻找替代方案 |
| **P2** | 迁移工作量大但可分批处理 |
| **P3** | 小工作量，纯替换即可 |

## 输出文件

- `vue2-to-vue3-readiness-report.md` — 升级就绪度报告
- `vue2-to-vue3-migration-plan.md` — 迁移方案
- `vue2-to-vue3-diff-checklist.md` — 差异清单（按文件）

> 本 skill 在 Phase 1-3 仅输出报告，Phase 4 才执行迁移（用户确认后）。

## 参考标准

- Vue 3 官方迁移指南：https://v3-migration.vuejs.org/
- uni-app Vue3 升级文档：https://uniapp.dcloud.net.cn/tutorial/migration-to-vue3.html
- `uniapp-standard-skill` — Vue3 项目规范（R01-R20）
- `uniapp-app-generate-skill` — Vue3 项目骨架参考

## 可配合技能

| 配合 Skill | 场景 |
|------------|------|
| `uniapp-code-audit-skill` | 升级前后用同一审计 skill 对比 |
| `uniapp-app-generate-skill` | 参考 Vue3 骨架标准 |
| `uniapp-standard-skill` | 升级后规范符合性核查 |
| `uniapp-components-skill` | 鉴权相关代码迁移参考 |

## 自我审计

本 skill 升级后应核对：

- 升级就绪度报告准确
- 阻塞点清单完整
- 不在用户确认前自动执行迁移
- 风险等级标注正确