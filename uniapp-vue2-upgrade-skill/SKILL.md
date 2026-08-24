---
name: uniapp-vue2-upgrade-skill
description: 将 Vue2 uniapp/小程序项目渐进式迁移到 Vue3+TypeScript+Pinia，支持超大项目（1000+ 页面）分模块迁移、静态资源/SDK/云服务自动排除、与 uniapp-app-generate-skill 标准骨架对齐。诊断先行：先出逐文件修改报告，再执行迁移。
trigger: /uniapp-upgrade
---

# UniApp Vue2 Upgrade Skill

## Overview

将 Vue2 uniapp 项目或原生微信小程序**渐进式**迁移到 Vue3 + TypeScript + Pinia 技术栈。专为企业级超大项目（1000+ 页面）设计。

**核心思路**：诊断先行，报告驱动。先扫描全局，生成逐文件修改报告，用户审阅批准后，再按优先级执行迁移。

## When to Use

使用 `/uniapp-upgrade` 命令触发，或描述以下场景时：

- "Vue2 升级到 Vue3"
- "uniapp 迁移"
- "小程序升级"
- "项目从 Vue2 升级"
- "vue2 升级 vue3+ts+pinia"
- "大项目重构升级"
- "迁移为 uniapp 标准项目"

## 适用范围

| 项目类型 | 说明 |
|----------|------|
| uniapp Vue2 项目（HBuilderX / CLI） | 主要适配对象 |
| 原生微信小程序 Vue2 | 需先评估是否转为 uniapp 架构后再迁移 |
| 混合项目（Vue2 + 原生） | 仅处理 Vue2 部分 |
| mpvue / wepy / taro-vue2 等 Vue2 变体 | 不直接支持；需先评估是否转为 uniapp 架构后再迁移 |

## 核心设计原则

### 1. 诊断先行、报告驱动

在修改任何一行代码之前，先完成全局诊断：扫描技术差异 → 逐文件分析修改点 → 生成报告 → 用户批准 → 才开始迁移。

### 2. 分模块渐进式

不搞"大爆炸"一次性迁移。按业务模块独立拆解，每个模块经历完整的"迁移 → 验证 → 灰度"闭环。

### 3. 资产分类排除

迁移前自动扫描项目，将资产分为四类：

| 分类 | 策略 | 示例 |
|------|------|------|
| 可跳过 | 直接复制到新项目 | `static/` 图片、字体、音频 |
| 需核对 | 检查 Vue3 兼容版本 | uView UI、vant-weapp、第三方 SDK 包装层 |
| 需适配 | 在新骨架中重新对接 | 阿里云 OSS SDK、腾讯 IM SDK、云函数调用 |
| 必须改 | 完整语法迁移 | `.vue` 组件、Vuex store、Options API 代码 |

### 4. 标准骨架对齐

脚手架阶段**不使用** `degit dcloudio/uni-preset-vue` 裸模板，而是基于 `uniapp-app-generate-skill` 的标准化骨架。

### 5. 新旧共存与可回滚

迁移期间 Vue2 和 Vue3 页面可在同一项目中混合运行。每个模块迁移在独立 Git 分支上进行，通过 feature flag 控制。出问题时关闭 flag 即可回到旧版本。

## Workflow

```
══════════════════ 诊断组（只读，不修改任何代码） ═══════════════════

Phase 0: 技术差异分析
  → 扫描项目源码，检出实际使用的 Vue2 模式
  → 分析依赖兼容性（package.json + uni_modules）
  → 输出：tech-diff-report.md（针对本项目的定制化技术差异报告）

Phase 1: 全量诊断报告
  → 业务模块自动识别 + 依赖拓扑图
  → 逐文件修改报告（每个文件标注：Vue2 模式 → Vue3 替代 → 风险 → 工时 → 依赖）
  → 全局迁移优先级排序 + 总工时汇总
  → 输出：migration-report.csv + migration-roadmap.md

──────────────── 诊断/执行分割线（用户审阅、确认、批准） ────────────────

══════════════════ 执行组（开始修改代码） ═══════════════════

Phase 2: 骨架对齐
  → 基于 uniapp-app-generate-skill 生成标准 Vue3 骨架
  → 全局配置迁移（pages.json / manifest.json / .env）
  → 静态资源批量复制
  → 全局样式 Design Token 化

Phase 3: 基础设施层迁移
  → main.ts / App.vue 重写
  → 全局基础设施：request.ts / storage.ts / platform*.ts
  → Pinia 核心 Store 搭建 + Pinia-Vuex 桥接层创建
  → 全局中间件/拦截器迁移

Phase 4: 逐模块迁移
  → 按 migration-report.csv 的优先级排序逐文件执行
  → 对每个业务模块：Store → Components → Pages → 验证
    1. 模块 Store 迁移（Vuex module → Pinia store）
    2. 模块公共组件迁移（mixin → composable，替换为标准组件）
    3. 模块页面迁移（Options API → <script setup> + TS）
    4. 模块级构建验证
    5. 模块级功能测试

Phase 5: 灰度验证
  → Feature Flag 控制双版本 → 模块级灰度 → 全量灰度
  → 线上新旧页面对比监控（错误率、性能）
  → 回归测试

Phase 6: 收尾清理
  → 移除 Vue2 运行时代码
  → 移除兼容桥接层
  → 全局规范对齐（ESLint、样式审计、跨平台审计）
```

---

## Phase Details

### Phase 0: 技术差异分析

> **只读诊断**。由 AI 驱动执行：AI 依次读取项目源码 + reference 文件，按检测表规则匹配，生成定制化报告。不修改任何代码。
>
> **扩展项目**：对 1000+ 文件的项目，AI 分批扫描，每批 50-100 个文件，逐批汇总结果。对超大项目推荐使用 `asset-classification.md` 中的扫描脚本辅助做文件级分类预处理。

**输入**：项目源码 + `references/vue2-vue3-diff.md`（参考源）+ `references/dependency-compat.md`（参考源）

#### 0.1 Vue2 模式检测扫描

自动扫描项目代码，按以下维度统计 Vue2 模式使用情况。若某模式检出数为 0，后续 Phase 中对应的迁移步骤可跳过。

| 检测模式 | 搜索规则 | 风险 | 对应 Vue3 迁移方案 | 参考 |
|----------|----------|------|--------------------|------|
| `this.$refs` | 匹配 `.vue` 中的 `this.$refs` | 中 | `ref()` + `defineExpose()` | vue2-vue3-diff §10 |
| `this.$nextTick` | 匹配 `this.$nextTick` | 低 | `import { nextTick } from 'vue'` | §11 |
| Event Bus | 匹配 `$bus\|$on\|$off\|new Vue()` | 高 | `mitt` 或 `provide/inject` | §12 |
| `this.$set` | 匹配 `this.$set` | 低 | 直接赋值（Proxy 自动响应） | §13 |
| Filters | 匹配 `filters:\s*{` 或 `Vue.filter(` | 低 | computed / 普通函数 | §5 |
| `v-if` + `v-for` 同元素 | 匹配同一标签 | 中 | computed 过滤 + `v-for` | §15 |
| `.sync` 修饰符 | 匹配 `:xxx.sync=` | 低 | `v-model:xxx` | §16 |
| `this.$listeners` | 匹配 `this.$listeners` | 中 | 合并到 `$attrs` | §4 |
| Mixin | 匹配 `mixins:` + 导出对象含 `data()`/`methods:` | 中 | Composable (`useXxx.ts`) | §14 |
| Vuex Store | 匹配 `Vuex.Store\|new Vuex`（检出 0 则跳过 Phase 3 桥接） | 高 | `defineStore()` | §状态管理 |
| Options API | 统计含 `export default {` 的 `.vue` 数 | 中 | `<script setup lang="ts">` | §Script |
| `Vue.prototype.$xxx` | 匹配 `Vue.prototype.` | 中 | 直接 import 模块 | §17.4 |
| `Vue.use()` | 匹配 `Vue.use(` | 中 | `app.use()` | §6 |
| `#ifdef VUE2` | 匹配条件编译 | 低 | 迁移后移除 | §17.7 |
| Slot 旧语法 | 匹配 `slot="xxx"` | 低 | `v-slot` 或 `#` | §Slot |
| 类组件 Decorator | 匹配 `@Component\|vue-property-decorator` | 高 | `<script setup>` | §18 |
| `@vue/composition-api` | 匹配 `import.*@vue/composition-api` | 低 | 移除插件 + 改从 `vue` 导入 | §Composition API |
| 深度选择器 | 匹配 `/deep/\|>>>` 在 `<style scoped>` 中 | 低 | `:deep()` | §样式 |
| `this.$t(` (i18n) | 匹配 `this.\$t\(`（vue-i18n v8） | 中 | `t()` 函数（v9 API 变更） | dependency-compat §i18n |
| vue-router | 匹配 `\$router\.\|this\.\$route\.\|beforeEach\|addRoutes` | 高 | `uni.navigateTo` + `onLoad(options)` | 见下方 §vue-router |
| render / JSX | 匹配 `render\(h\)\|h\(\|\.jsx\|@vitejs/plugin-vue-jsx` | 中 | `h()` 全局导入 + JSX 插件 | vue2-vue3-diff |
| `uni.$emit/$on` | 匹配 `uni\.\$emit\|uni\.\$on\|uni\.\$once\|uni\.\$off` | 低 | 语法不变，审查内存泄漏 | uni-app 文档 |
| `getApp()` | 匹配 `getApp\(\)` | 低 | 建议迁移为 Pinia Store | §Composition API |
| `this.$forceUpdate` | 匹配 `\$forceUpdate` | 低 | Vue3 中无需使用，审查原始 Bug | — |
| `Vue.set/delete` | 匹配 `Vue\.set\(\|this\.\$delete\|Vue\.delete\(` | 低 | 直接赋值/delete（Proxy 自动响应） | §13 |

#### 0.2 依赖兼容性分析

基于 `references/dependency-compat.md`，检查 `package.json` 中每个依赖的兼容性状态：必须替换 / 需要升级 / 可以保留 / 需核对。同时检查 `uni_modules/` 目录中每个插件的 Vue3 兼容性。

#### 0.3 输出：tech-diff-report.md

```markdown
# 技术差异分析报告 — <项目名>

## Vue2 模式检出统计

| Vue2 模式 | 检出文件数 | 风险 | 对应 Vue3 方案 | 参考 |
|-----------|-----------|------|----------------|------|
| this.$refs | 87 | 中 | ref() + defineExpose() | §10 |
| Filters | 12 | 低 | computed / 函数调用 | §5 |
| Event Bus | 3 | 高 | mitt / provide-inject | §12 |
| Mixin | 8 | 中 | Composable (useXxx.ts) | §14 |
| Vuex Store | 5 模块 | 高 | defineStore() | §状态管理 |
| Options API | 215 | 中 | <script setup lang="ts"> | §Script |

## 依赖兼容性矩阵

| 依赖 | 当前版本 | 目标版本 | 状态 | 动作 |
|------|---------|---------|------|------|
| vue | 2.6.14 | ^3.4.0 | 必须替换 | 升级 |
| vuex | 3.6.2 | — | 弃用 | 替换 Pinia |
| dayjs | 1.11.10 | ✅ | 兼容 | 直接保留 |

## uni_modules 插件兼容性

| 插件 | Vue3 兼容 | 动作 |
|------|-----------|------|
| uni-id | ✓ | 升级最新版 |
```

---

### Phase 1: 全量诊断报告

> **只读诊断**。基于 Phase 0 的检测结果，对每个文件生成逐文件修改报告。此前不修改任何代码。

**输入**：Phase 0 的 `tech-diff-report.md` + 项目源码 + `references/asset-classification.md` + `references/module-migration-strategy.md`

#### 1.1 业务模块识别与依赖拓扑

从 `pages.json`、目录结构、store 模块提取业务模块划分，生成 `module-map.json` 和 `module-deps.json`。详见 `references/module-migration-strategy.md`。

#### 1.2 逐文件修改报告（核心交付物）

对每个业务文件生成详细的修改说明。**`migration-report.csv` 格式**：

| 字段 | 说明 |
|------|------|
| `file` | 文件路径 |
| `category` | SKIP / CHECK / ADAPT / REWRITE |
| `vue2_patterns` | 检测到的 Vue2 模式（管道符分隔） |
| `vue3_pattern` | 推荐的 Vue3 迁移方案 |
| `risk` | 低 / 中 / 高 |
| `effort_hours` | 预估工时（小时） |
| `dependencies` | 前置依赖文件（必须先完成这些依赖才能迁移本文件） |
| `standard_component` | 是否可替换为标准骨架组件（`AppButton` 等） |

**示例**：

```csv
file,category,vue2_patterns,vue3_pattern,risk,effort_hours,dependencies,standard_component
src/pages/user/login.vue,REWRITE,"Options API|this.$refs|this.$store","<script setup> + ref() + useUserStore()",中,2.5,stores/modules/user.ts,-
src/components/MyButton.vue,REWRITE,"Options API|$emit","替换为标准 AppButton",低,0,-,AppButton
src/store/modules/cart.js,REWRITE,Vuex,"Pinia defineStore",高,3,-,-
src/static/logo.png,SKIP,无,无,无,0,-,-
src/utils/request.js,ADAPT,"Vue.prototype.$http","直接 import request.ts",低,1,-,-
```

#### 1.2.1 CSV 生成说明

> **由 AI 驱动生成**。AI 基于 Phase 0 的 `tech-diff-report.md` 检测结果，结合 `references/asset-classification.md` 的分类规则，逐文件填写。

**`effort_hours` 基准值**（AI 可根据文件复杂度上下浮动 50%）：

| 文件类型 | 复杂度 | 基准工时 |
|----------|--------|----------|
| 简单静态页面（纯展示，无 Store/API 调用） | 低 | 0.5-1h |
| 表单页面（含 v-model、校验） | 中 | 1.5-2.5h |
| 列表页面（含分页、搜索、筛选） | 中 | 2-3h |
| 详情页面（含多状态切换） | 中 | 2-3h |
| 复杂业务页面（含多 Store、mixin、Event Bus） | 高 | 3-6h |
| Vuex Store module → Pinia | 中 | 1-3h |
| Mixin → Composable | 中 | 1-2h |
| 公共组件（含 props/emits/slots） | 中 | 1-3h |
| 工具函数（纯 JS → TS 类型标注） | 低 | 0.5-1h |

**`dependencies` 推断规则**：
- 文件引用了某 Pinia Store → 该 Store 为迁移完毕的前置依赖
- 文件引用了某 Composable → 该 Composable 为迁移完毕的前置依赖
- 文件在 Phase 1.1 的模块依赖拓扑中标为"依赖某模块" → 该模块的基础层（Store + Composable）为前置依赖

**循环依赖处理**：
- **Pinia Store 间交叉引用**：Pinia 运行时支持惰性求值，交叉引用的 Store 标记为"同批迁移"，不分先后
- **Composable ↔ Store 循环**：优先迁 Store，Composable 迁移时若引用未完成迁移的 Store，通过 Pinia 的惰性 `useStore()` 兼容——在 CSV 中标注"存循环，先迁 Store 再迁 Composable"
- **AI 检测逻辑**：生成 CSV 后扫描 `dependencies` 列，若 A 依赖 B 且 B 依赖 A，将两者标记为同批次

#### 1.3 迁移优先级排序

基于依赖关系 + 模块依赖拓扑，产出全局排序：

```
P0 基础层（无依赖、被最多文件依赖）→ 最先迁移：
  stores/modules/user.ts          (3h, 依赖: 无)
  composables/usePageList.ts      (2h, 依赖: 无)
  utils/request.ts                (1h, 依赖: 无)

P1 公共组件层（依赖 P0）：
  components/UserCard.vue         (3h, 依赖: useUserStore)

P2 业务页面层（依赖 P0+P1）：
  pages/user/login.vue            (2.5h, 依赖: useUserStore + AppButton)
  pages/goods/detail.vue          (4h, 依赖: useGoodsStore + usePageList)
```

#### 1.4 总工时汇总

| 模块 | 文件数 | SKIP | CHECK | ADAPT | REWRITE | 总工时 | 优先级 |
|------|--------|------|-------|-------|---------|--------|--------|
| 用户模块 | 25 | 8 | 2 | 1 | 14 | 38h | P0 |
| 商品模块 | 42 | 15 | 3 | 4 | 20 | 62h | P1 |
| 订单模块 | 35 | 10 | 2 | 2 | 21 | 55h | P2 |
| **合计** | **350** | **120** | **15** | **12** | **203** | **480h** | — |

#### 1.5 Phase 1 输出

- `migration-report.csv` — **逐文件修改报告（核心交付物）**
- `migration-report.md` — 人类可读的汇总报告
- `migration-roadmap.md` — 迁移路线图（优先级排序 + 工时汇总 + 团队分配建议）
- `module-map.json` — 模块与文件归属映射
- `module-deps.json` — 模块依赖关系图

> **关键决策节点**：Phase 0 和 Phase 1 完成后，**停止并等待用户审阅**以下交付物：
> 1. `tech-diff-report.md` — 技术差异分析
> 2. `migration-report.csv` — 逐文件修改报告
> 3. `migration-roadmap.md` — 迁移路线图
>
> 用户确认无误、批准迁移范围后，再进入 Phase 2（执行组）。

---

### Phase 2: 骨架对齐

#### 2.1 生成标准 Vue3 骨架

使用 `uniapp-app-generate-skill` 的标准模板，而非 `degit` 裸模板。详细操作见 `references/skeleton-alignment.md`。

#### 2.2 全局配置迁移

- `pages.json` — 保留旧页面路径，追加 Vue3 新路径
- `manifest.json` — 更新 `vueVersion: "3"`
- `.env` — 基于 `.env.example` 填充

#### 2.3 静态资源批量复制

```bash
# 旧项目 static/ → 新项目 src/static/
# 大文件（>500KB）建议改为 CDN 引用
```

#### 2.4 主题迁移

```bash
npm run theme:sync
npm run theme:check
```

---

### Phase 3: 基础设施层迁移

#### 3.1 main.ts / App.vue 重写

基于标准骨架模板，迁移旧项目 `onLaunch`/`onShow` 生命周期逻辑。

#### 3.2 request.ts 标准化

基于标准骨架的 `utils/request.ts`，合并旧项目拦截器逻辑（Token 注入、错误处理、401 刷新）。

#### 3.3 Pinia 核心 Store 搭建 + 桥接层

搭建 `user`、`app` 等基础 Pinia Store。对尚未迁移的 Vuex 模块创建桥接层（详见 `references/upgrade-steps.md`）。桥接策略：

```
阶段一（兼容期）：Vuex 保留 → Pinia 桥接 → Vue3 组件通过 Pinia 访问
阶段二（迁移期）：逐模块将 Vuex module 重写为 Pinia Store
阶段三（完成期）：所有模块迁移完成 → 删除 Vuex
```

---

### Phase 4: 逐模块迁移

#### 4.1 迁移顺序

按 `migration-report.csv` 的 `dependencies` 字段确定的优先级，从 P0 基础层开始。

#### 4.2 单模块迁移流程

对每个文件执行 `migration-report.csv` 中标注的迁移方案：

**Store 迁移**：Vuex module → `defineStore()`
**mixin → composable**：`mixins: [xxx]` → `useXxx()`
**组件迁移**：Options API → `<script setup>`；与标准组件重叠的替换为 `AppButton`/`AppCard` 等
**页面迁移**：Options API → `<script setup>` + TS
**验证**：`npm run build:mp-weixin`

> **部分回滚策略**：模块内迁移过程中如需回退——迁移起点打 `git tag`，若中途失败则 `git reset --hard <tag>` 丢弃所有本地修改，从零开始。建议每个模块**完整迁移 + 验证通过后一次性提交**，避免半迁移状态。

#### 4.3 常见陷阱

| 陷阱 | 解决方案 |
|------|----------|
| `this.$refs` | `ref()` + `defineExpose()` |
| `this.$nextTick` | `import { nextTick } from 'vue'` |
| Event Bus | 替换为 `mitt` 或 `provide/inject` |
| Filters | 改为 computed 或普通函数 |
| `$listeners` / `$children` | 合并到 `$attrs` / 使用 Pinia |
| WebSocket 连接 | 从 `this.$socket` / Vuex 管理 → composable 封装，在 `onShow`/`onHide` 中管理重连 |
| 无 Vuex 的项目 | 跳过 Pinia 桥接层，直接从 Options API → `<script setup>` |
| `onShareAppMessage` 不生效 | 确认从 `@dcloudio/uni-app` 导入：`import { onShareAppMessage } from '@dcloudio/uni-app'` |
| uni-app `easycom` | 确保 `pages.json` 中配置 `type: "component"` |

---

### Phase 5: 灰度验证

#### 5.1 灰度策略

```
开发环境 → 测试环境 → 预发环境 → 生产小流量(1%) → 10% → 50% → 全量
每步监控：错误率、加载时长、API 成功率
```

> **小程序 Feature Flag 限制**：微信小程序不支持远程实时开关——修改 Feature Flag 需要重新构建 + 审核 + 发布（周期 1-7 天），无法"即时回退"。小程序场景的快速回退方案是**保留旧版 v2 页面路由在 `pages.json` 中**，出现问题时通过**页面级路由映射切换**（不依赖远程配置，而是直接导航到 v2 页面）。H5 端可通过远程配置接口实现即时开关。

#### 5.2 Feature Flag + 双版本路由

```typescript
// utils/navigation.ts — 带 query 参数分离的路由分发
const ROUTE_MAP: Record<string, string> = {
  '/pages/user/login': '/pages/user-v3/login',
}

export function navigateTo(url: string, options?: any) {
  const [basePath, query] = url.split('?')
  const mappedPath = ROUTE_MAP[basePath] || basePath
  const finalPath = FeatureFlags.userModuleV3 ? mappedPath : basePath
  const targetUrl = query ? `${finalPath}?${query}` : finalPath
  uni.navigateTo({ url: targetUrl, ...options })
}
```

> **关于 pages.json 的 `condition` 字段**：uni-app 提供 `condition` 字段用于开发阶段快速切换编译页面入口，但仅作用于本地开发模式，无法在生产环境中动态切换页面版本。因此灰度方案采用自定义 `navigation.ts` + Feature Flag 实现路由分发。

#### 5.3 监控实现

```typescript
// App.vue — 全局错误监控，区分 v2/v3 页面
onLaunch(() => {
  uni.onError((err) => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const isV3 = currentPage.route?.includes('-v3')
    reportError({
      message: err,
      pageVersion: isV3 ? 'v3' : 'v2',
      page: currentPage.route,
    })
  })
})
```

```typescript
// 页面性能打点
onLoad(() => { uni.setStorageSync('perf_loadStart', Date.now()) })
onReady(() => {
  const readyTime = Date.now() - uni.getStorageSync('perf_loadStart')
  reportPerformance({ page: getCurrentPages()[0].route, readyTime })
})
```

指标与告警：页面错误率 > 1%、加载时长 > 旧版 1.5 倍 → 回退。

---

### Phase 6: 收尾清理

#### 6.1 移除 Vue2 运行时

所有模块灰度稳定 2 周后：
```bash
npm uninstall vuex vue@2                     # 移除 Vue2 依赖
rm -rf src/store/ src/pages/user/            # 删除旧文件（保留 v3 版本）
mv src/pages/user-v3 src/pages/user          # 重命名为正式路径
```

#### 6.2 全局规范对齐

```bash
# 调用 uniapp-code-audit-skill 审计代码质量
# 调用 uniapp-style-skill 审计样式一致性
# 调用 frontend-style-harmonizer-skill 收敛硬编码样式
# 调用 uniapp-crossplatform-audit-skill 审计跨平台兼容性
npm run verify                                # theme:sync + theme:check + lint + build
```

---

## 与其他 Skill 协作

| 阶段 | 协作 Skill | 用途 |
|------|-----------|------|
| Phase 2 | `uniapp-app-generate-skill` | 生成标准 Vue3 骨架 |
| Phase 2 | `image-forge-skill` | 静态资源批量压缩 |
| Phase 2 | `uniapp-theme-skill` | 主题系统迁移 |
| Phase 3 | `frontend-request-skill` | 请求层标准化 |
| Phase 3 | `uniapp-standard-skill` | 规范基线对齐 |
| Phase 4 | `uniapp-page-components-skill` | 页面组件标准化 |
| Phase 6 | `uniapp-code-audit-skill` | 代码质量审计 |
| Phase 6 | `uniapp-style-skill` | 样式一致性审计 |
| Phase 6 | `frontend-style-harmonizer-skill` | 硬编码样式收敛 |
| Phase 6 | `uniapp-crossplatform-audit-skill` | 跨平台兼容性审计 |

## Output

此 skill 输出：

**Phase 0 输出**：
- `tech-diff-report.md` — 项目级 Vue2 模式检出 + 依赖兼容性矩阵

**Phase 1 输出**：
- `migration-report.csv` — 逐文件修改报告（核心交付物）
- `migration-report.md` — 人类可读汇总
- `migration-roadmap.md` — 迁移路线图（优先级 + 工时 + 团队分配）

**Phase 2 输出**：
- 标准 Vue3 骨架（基于 uniapp-app-generate-skill）
- 更新后的 `pages.json` / `manifest.json`

**Phase 3 输出**：
- 重写后的 `main.ts`、`App.vue`
- Pinia 核心 Store + 桥接层
- 标准化 `request.ts`、`platform*.ts`

**Phase 4 输出**：
- 每个模块的迁移分支 + 构建/测试报告

**Phase 6 输出**：
- 清理后的项目（仅 Vue3）
- 代码审计报告

## References

- `references/vue2-vue3-diff.md` — Vue2 到 Vue3 深度语法差异（供 Phase 0 模式检测消费）
- `references/upgrade-steps.md` — 详细逐模块迁移步骤 + 双版本共存方案
- `references/dependency-compat.md` — 依赖兼容性列表 + SDK/云服务/uni_modules 清单
- `references/module-migration-strategy.md` — 业务模块拆分方法论与依赖拓扑
- `references/asset-classification.md` — 资产四分类详细规则
- `references/skeleton-alignment.md` — 与 uniapp-app-generate-skill 骨架对齐操作指南
- `references/progressive-ts-strategy.md` — TypeScript 渐进式引入策略
