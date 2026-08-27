# uniapp-vue2-upgrade-skill 🔄

uniapp **Vue2 + Options API 项目升级到 Vue3 + Composition API + TypeScript + Pinia** 的方案设计与迁移执行技能。先输出方案与差异清单，**用户确认后才执行迁移**。

---

## 它能做什么

当你说：

- "vue2 升级 vue3"
- "uniapp 迁移"
- "小程序升级"
- "Options API 转 Composition API"
- "Vuex 迁移到 Pinia"
- "把 vue2 项目升级到 vue3"

这个 Skill 会引导你完成现状评估 → 方案设计 → 用户确认 → 迁移执行 → 验证交付，输出 `vue2-to-vue3-readiness-report.md` 与 `vue2-to-vue3-migration-plan.md`。

---

## 它解决了什么问题

| 问题 | 解决方案 |
|------|----------|
| Vue2 项目想用 Vue3 新特性（`<script setup>`、Pinia 等） | 系统性升级路径，渐进式或全量二选一 |
| 担心升级破坏现有功能 | 输出升级就绪度报告与阻塞点清单，先评估再动手 |
| Vuex → Pinia 迁移成本高 | 提供模块拆分 + defineStore 转换模板 |
| mixins → composables 写法不熟 | 给出典型场景的转换示例 |
| 升级后规范符合性没保障 | 升级后用 `uniapp-code-audit-skill` 体检 |

---

## 它不做什么

- ❌ **不在用户确认前自动执行升级**：Phase 1-3 仅输出报告，Phase 4 才执行迁移
- ❌ **不强制升级**：Vue2 项目可继续被审计（`uniapp-code-audit-skill` 中 Vue3 专属项标注为"不适用"），无需先升级
- ❌ **不重写项目骨架**：仅做 API 风格与状态管理迁移，不重写目录结构

---

## 五阶段流程

```
Phase 1: 现状评估
  → 扫描项目结构、技术栈、Options API 使用情况
  → 输出 "vue2-to-vue3-readiness-report.md"

Phase 2: 方案设计
  → 选择升级策略（全量 / 渐进 / 双轨）
  → 输出 "vue2-to-vue3-migration-plan.md"

Phase 3: 用户确认
  → 用户 review 方案
  → 确认后才执行迁移

Phase 4: 迁移执行
  → Options API → Composition API
  → Vuex → Pinia
  → mixins → composables
  → JS → TS（可选）

Phase 5: 验证交付
  → npm run lint
  → npm run type-check
  → npm run build:mp-weixin
  → 三端真机回归测试
```

---

## 三种升级策略

| 策略 | 适用场景 | 风险 | 工期 |
|------|----------|------|------|
| **A. 全量升级** | 小项目（< 100 组件）、无第三方依赖阻塞 | 高 | 短 |
| **B. 渐进式升级**（Vue2.7 过渡） | 中等项目、关键依赖需时间替换 | 中 | 中 |
| **C. 双轨并行** | 大项目、不能停服 | 低 | 长 |

> 推荐 B 策略：先升级到 Vue 2.7（兼容 Vue3 部分语法），再升级到 Vue 3。

---

## Vue2 → Vue3 差异对照

| 维度 | Vue2 写法 | Vue3 写法 |
|------|-----------|-----------|
| **API 风格** | Options API（`data`/`methods`/`computed`/`watch`） | Composition API（`ref`/`reactive`/`computed`/`watch`） |
| **组件定义** | `export default { name, props, data, ... }` | `<script setup>` + `defineProps`/`defineEmits` |
| **生命周期** | `created`/`mounted`/`beforeDestroy` | `onMounted`/`onUnmounted` |
| **状态管理** | Vuex | Pinia（`defineStore` setup 风格） |
| **混入** | `mixins: [...]` | 自定义 composables + `useXxx()` |
| **过滤器** | `{{ value \| filter }}` | 计算属性或方法 |
| **插槽语法** | `slot="foo"` | `#foo` |
| **路由** | uni-app 自带路由 | 不变 |
| **构建** | HBuilderX / vue-cli | Vite + `@dcloudio/vite-plugin-uni` |

---

## 常见升级阻塞点

1. **第三方 UI 库 / 组件库**：未发布 Vue3 版本
2. **uni-app 插件市场**：部分插件只支持 Vue2
3. **`sync` 修饰符**：Vue3 移除
4. **`$listeners`**：Vue3 移除
5. **过滤器 / `filter` 关键字**：Vue3 移除
6. **`keyCode` 修饰符**：Vue3 移除
7. **`v-if` / `v-for` 优先级**：Vue3 中 `v-if` 优先级高于 `v-for`

---

## 输出文件

- `vue2-to-vue3-readiness-report.md` — 升级就绪度报告（Phase 1）
- `vue2-to-vue3-migration-plan.md` — 迁移方案（Phase 2）
- `vue2-to-vue3-diff-checklist.md` — 差异清单（Phase 4 期间持续更新）

> 本 skill 在 Phase 1-3 仅输出报告，Phase 4 才执行迁移（用户确认后）。

---

## 参考标准

- Vue 3 官方迁移指南：https://v3-migration.vuejs.org/
- uni-app Vue3 升级文档：https://uniapp.dcloud.net.cn/tutorial/migration-to-vue3.html
- `uniapp-standard-skill` — Vue3 项目规范
- `uniapp-app-generate-skill` — Vue3 项目骨架参考

## 可配合技能

| 配合 Skill | 场景 |
|------------|------|
| `uniapp-code-audit-skill` | 升级前后用同一审计 skill 对比 |
| `uniapp-app-generate-skill` | 参考 Vue3 骨架标准 |
| `uniapp-standard-skill` | 升级后规范符合性核查 |
| `uniapp-components-skill` | 鉴权相关代码迁移参考 |

---

## 目录结构

```
uniapp-vue2-upgrade-skill/
├── SKILL.md           # 技能定义
└── README.md          # 本文件
```

> 当前为骨架版本：仅含 SKILL.md 与 README.md。如需扩展 `references/vue2-vue3-diff.md`、`references/pinia-migration.md`、`references/composition-api-patterns.md` 等详细迁移指南，可后续补充。

---

## 适用 vs 不适用

✅ **适用**：
- 现有 Vue2 uniapp 项目想升级到 Vue3
- 维护老项目时希望系统化评估升级成本
- Vuex → Pinia 迁移参考

❌ **不适用**：
- 已经在 Vue3 + Composition API 的项目
- 纯前端 SPA（Vue/React），应用 `vue-generate-skill` 或 `frontend-code-doctor`
- 需要审计 Vue2 老项目，应用 `uniapp-code-audit-skill`（支持 Vue2 适配）

---

## 维护记录

- 2026-08-27：骨架版本创建。基于 Vue 3 官方迁移指南与 uni-app Vue3 升级文档提取。