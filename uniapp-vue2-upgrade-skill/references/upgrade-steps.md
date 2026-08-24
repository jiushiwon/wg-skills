# 逐模块迁移详细步骤

> 包含完整迁移操作步骤、双版本共存方案与 Pinia-Vuex 桥接方案。

## 升级前准备

### 1. 项目备份

```bash
# 方式一：Git 分支
git checkout -b upgrade-vue3

# 方式二：完整备份（推荐大项目）
cp -r my-project my-project-vue2-backup
```

### 2. 全量扫描

```bash
# 生成文件清单
find src -type f > file-inventory.txt

# 统计页面 / 组件 / Store 数量
find src/pages -name "*.vue" | wc -l
find src/components -name "*.vue" | wc -l
find src/store -name "*.js" | wc -l
```

### 3. 运行资产分类扫描

根据 `references/asset-classification.md` 编写或使用扫描脚本，生成 `asset-classification.csv`。

### 4. 运行模块识别

根据 `references/module-migration-strategy.md` 识别业务模块，生成 `module-map.json` 和 `module-deps.json`。

---

## 第一步：生成标准骨架

### 1.1 调用 uniapp-app-generate-skill

```
在临时目录生成标准项目骨架，然后复制核心文件到迁移目标项目。
详细操作见 references/skeleton-alignment.md。
```
在临时目录生成标准项目骨架，然后复制核心文件到迁移目标项目。
详细操作见 references/skeleton-alignment.md
```

### 1.2 安装依赖

```bash
npm install
```

### 1.3 运行骨架自检

```bash
npm run verify
# 输出：
# ✓ theme:sync — 主题文件已同步
# ✓ theme:check — 未发现硬编码颜色违规
# ✓ lint — ESLint 检查通过
# ✓ build:mp-weixin — 构建成功
```

### 1.4 合并旧项目配置

#### pages.json — 保留所有旧页面路径

```json
{
  "pages": [
    // ...标准骨架的首页（可选保留作为升级中控台）
    // ...旧项目的全部页面路径
  ],
  "subPackages": [
    // ...旧项目的全部分包
  ]
}
```

> **关键**：旧页面路径不变，保证迁移期间旧页面仍可正常访问。

#### manifest.json — 更新关键字段

```json
{
  "name": "旧项目名称（不变）",
  "appid": "旧项目 appid（不变）",
  "vueVersion": "3",
  "versionName": "旧版本号",
  "versionCode": "旧版本号"
}
```

### 1.5 静态资源迁移

```bash
# 旧项目 static/ → 新项目 src/static/
cp -r 旧项目/static/* src/static/

# 旧项目 assets/ → 新项目 src/static/（合并到 static 目录，uni-app 规范）
cp -r 旧项目/assets/* src/static/
```

### 1.6 主题迁移

```bash
# 1. 从旧项目的全局样式文件中提取颜色值
# 2. 写入 theme.json
# 3. 运行同步
npm run theme:sync
npm run theme:check
```

---

## 第二步：基础设施层迁移

### 2.1 main.ts — 双运行时共存模式

迁移期间需要 Vuex 和 Pinia 同时运行，保证未迁移的模块仍可访问旧 Store：

```typescript
// src/main.ts — 过渡期（Vuex + Pinia 共存）
import { createSSRApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
// 保留 Vuex Store 导入（确保 globalProperties.$store 可用）
import store from './store' // 旧 Vuex Store

export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  // 将旧 Vuex Store 注册为全局属性，供 Pinia-Vuex 桥接层访问
  app.config.globalProperties.$store = store
  return { app }
}
```

> **所有模块迁移完成后**，移除 Vuex：删除 `import store` 和 `app.config.globalProperties.$store` 行，`npm uninstall vuex`。

### 2.2 App.vue — 迁移生命周期逻辑

```vue
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  // 迁移旧 App.vue 中 onLaunch 的逻辑
  // 如：登录状态检查、云开发初始化、全局配置
})

onShow(() => {
  // 迁移旧 App.vue 中 onShow 的逻辑
})

onHide(() => {
  // 迁移旧 App.vue 中 onHide 的逻辑
})
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
```

### 2.3 request.ts — 使用标准骨架的请求封装

```typescript
// src/utils/request.ts
// 基于 uniapp-app-generate-skill 的标准模板
// 将旧项目的拦截器逻辑（Token 注入、错误处理、请求/响应拦截）合并进来

import { useUserStore } from '@/stores/modules/user'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
}

async function request<T = any>(options: RequestOptions): Promise<T> {
  const userStore = useUserStore()

  if (options.showLoading !== false) {
    uni.showLoading({ title: '加载中...', mask: true })
  }

  try {
    const res = await uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(userStore.token ? { Authorization: `Bearer ${userStore.token}` } : {}),
        ...options.header,
      },
    })

    // 统一错误处理（根据旧项目的响应格式调整）
    if (res.statusCode !== 200) {
      throw new Error(`请求失败: ${res.statusCode}`)
    }

    return res.data as T
  } catch (error: any) {
    // Token 过期处理
    if (error.statusCode === 401) {
      const userStore = useUserStore()
      // 尝试刷新 Token
      try {
        await userStore.refreshToken()
        // Token 刷新成功，重试原请求
        return request({ ...options, showLoading: false })
      } catch {
        // 刷新失败，跳转登录
        userStore.logout()
        uni.reLaunch({ url: '/pages/login/index' })
        throw new Error('登录已过期')
      }
    }
    uni.showToast({ title: '网络错误', icon: 'none' })
    throw error
  } finally {
    uni.hideLoading()
  }
}

export default request
```

### 2.4 Pinia-Vuex 桥接策略

#### 方案一：Pinia-Vuex 桥接（兼容期使用）

当部分模块已迁移到 Pinia、部分仍在 Vuex 时，通过桥接层使 Vue3 组件透明访问 Vuex Store：

```typescript
// stores/compat.ts — Vuex→Pinia 桥接层
// 原理：在 Pinia 已注册后，通过 getCurrentInstance 获取全局 Vuex 实例
// 限制：需要先确保旧 Vuex Store 已通过 app.use 注册（在 main.ts 中同时注册 Pinia 和 Vuex）

import { getCurrentInstance } from 'vue'
import { reactive, computed } from 'vue'

// 从 Vuex 模块动态获取 state
export function useCompatState(modulePath: string) {
  const instance = getCurrentInstance()
  if (!instance) throw new Error('useCompatState must be called in setup()')

  // 方式一：通过 app.config.globalProperties.$store 访问旧 Vuex
  const store = instance.appContext.config.globalProperties.$store
  const [namespace, ...path] = modulePath.split('/')

  return reactive({
    ...store.state[modulePath]
  })
}

// 发送 Vuex action
export function useCompatDispatch(modulePath: string) {
  const instance = getCurrentInstance()
  const store = instance.appContext.config.globalProperties.$store

  return function dispatch(actionName: string, payload?: any) {
    const fullName = modulePath.includes('/')
      ? `${modulePath}/${actionName}`
      : actionName
    return store.dispatch(fullName, payload)
  }
}

// 使用示例（Vue3 组件中访问未迁移的 Vuex 模块）
const goodsState = useCompatState('goods')
const goodsDispatch = useCompatDispatch('goods')
goodsDispatch('fetchList', { page: 1 })
console.log(goodsState.list)
```

> **注意**：桥接方案是临时过渡手段。目标是在逐模块迁移中将所有 Vuex 模块逐一迁移为 Pinia Store。
> 如果旧项目没有新的 Vue 实例（即卸载了 Vuex），则此方案不可用，必须优先迁移 core store 后再迁业务模块。

#### 方案二：全量 Pinia 迁移（推荐，最终目标）

一次性将所有 Vuex Store 迁移到 Pinia，详见本节 2.5。

### 2.5 Vuex 模块 → Pinia Store 迁移映射

| Vuex 概念 | Pinia 概念 | 迁移规则 |
|-----------|-----------|----------|
| `state` | `ref()` / `reactive()` | 直接映射 |
| `getters` | `computed()` | 直接映射 |
| `mutations` | 合并到 actions | `mutations` 中的同步操作变为 `function` |
| `actions` | `function` | 去除 `commit` 调用，直接修改 state |
| `modules` | 独立 Store 文件 | 每个 module 单独一个 `defineStore()` |
| `namespaced: true` | 自动 | Pinia 自动 Namespace |
| `plugins` | Pinia 插件 | 使用 `pinia.use()` 替代 |

**Vuex Namespaced Module 迁移示例**：

```typescript
// Vue2 — store/modules/goods.js
const state = {
  list: [],
  current: null,
  loading: false
}

const mutations = {
  SET_LIST(state, list) { state.list = list },
  SET_CURRENT(state, item) { state.current = item },
  SET_LOADING(state, loading) { state.loading = loading }
}

const actions = {
  async fetchList({ commit }, params) {
    commit('SET_LOADING', true)
    const list = await getGoodsList(params)
    commit('SET_LIST', list)
    commit('SET_LOADING', false)
  }
}

export default { namespaced: true, state, mutations, actions }
```

```typescript
// Vue3 — stores/modules/goods.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getGoodsList } from '@/api/modules/goods'
import type { GoodsItem } from '@/types'

export const useGoodsStore = defineStore('goods', () => {
  const list = ref<GoodsItem[]>([])
  const current = ref<GoodsItem | null>(null)
  const loading = ref(false)

  async function fetchList(params: any) {
    loading.value = true
    const result = await getGoodsList(params)
    list.value = result
    loading.value = false
  }

  return { list, current, loading, fetchList }
})
```

---

## 第三步：逐模块迁移

### 3.1 确定迁移顺序

根据 `module-deps.json` 确定的优先级，从 P0 基础模块开始：

```
P0: 用户模块 → P1: 商品模块 → P1: 公共组件 → P2: 购物车 → P3: 订单 → P4: 支付
```

### 3.2 逐模块执行清单

对每个模块执行以下步骤：

#### Step 1：创建模块迁移分支

```bash
git checkout -b upgrade/user-module
```

#### Step 2：迁移模块 Store

```
store/modules/xxx.js → stores/modules/xxx.ts
  - state → ref()
  - getters → computed()
  - mutations → 合并到 functions
  - actions → async functions
  - 页面中 store 调用替换：
    this.$store.dispatch('xxx/action') → useXxxStore().action()
    this.$store.state.xxx.list → useXxxStore().list
```

#### Step 3：迁移模块 Mixin → Composable

```
mixins/xxx.js → composables/useXxx.ts

检查原有 mixin 是否已在其他模块中迁移：
  - 已迁移 → 直接 import 使用
  - 未迁移 → 创建 composables/useXxx.ts
```

#### Step 4：迁移模块公共组件

```
components/Xxx/index.vue (Options API) → <script setup lang="ts">

与标准骨架组件对比：
  - 功能重叠 → 替换为标准组件（AppButton/AppCard 等）
  - 无法替换 → 手动迁移语法
```

#### Step 5：迁移模块页面

```
pages/xxx/*.vue (Options API) → <script setup lang="ts">

迁移清单：
  - [ ] props → defineProps<Props>()
  - [ ] $emit → defineEmits<{...}>()
  - [ ] data() → ref()/reactive()
  - [ ] computed → computed()
  - [ ] methods → function
  - [ ] 生命周期 → onMounted/onUnmounted + uni 生命周期
  - [ ] this.$refs → ref()
  - [ ] this.$nextTick → nextTick()
  - [ ] Filter → 普通函数
  - [ ] Event Bus → remove or replace with mitt/provide
  - [ ] this.$store → useXxxStore()
  - [ ] this.$router → uni.navigateTo()
  - [ ] <template slot=""> → <template #default>
```

#### Step 6：模块级构建验证

```bash
npm run build:mp-weixin

# 如果构建失败：
# 1. 检查 TypeScript 错误
# 2. 检查组件导入路径
# 3. 检查 Store 引用（注意 Pinia 的 useStore 必须在 setup 中调用）
```

#### Step 7：模块功能验证

通过 `pages.json` 条件编译或 feature flag 启用新页面：

```javascript
// 添加路由钩子实现新旧页面切换
const USE_V3_USER = false // 开发阶段关，灰度时开

export function navigateToUserModule(path: string) {
  if (USE_V3_USER) {
    return path.replace('/pages/user/', '/pages/user-v3/')
  }
  return path
}
```

功能验证清单：
```
□ 页面正常加载
□ 数据请求正常
□ 页面交互正常
□ Store 状态同步正确
□ 导航跳转正常
□ 表单提交正常
□ 错误状态处理正常（网络异常、空数据等）
```

#### Step 8：合并到主分支

```bash
git checkout main
git merge upgrade/user-module
```

**pages.json / manifest.json 冲突解决策略**：

多团队并行迁移时，`pages.json` 必然冲突。推荐按模块 section 组织路由：
```json
{
  "pages": [
    // ===== 标准骨架页面（不可删除）=====
    { "path": "pages/index/index" },

    // ===== 用户模块（团队 A 升级）=====
    { "path": "pages/user/login" },
    { "path": "pages/user-v3/login" },

    // ===== 商品模块（团队 B 升级）=====
    { "path": "pages/goods/list" },
    { "path": "pages/goods-v3/list" },

    // ===== 订单模块（团队 C 升级）=====
    { "path": "pages/order/list" },
    { "path": "pages/order-v3/list" }
  ]
}
```

冲突解决规则：
1. **每个模块的路由使用注释标注团队名**，合并时按注释块整段处理
2. **骨架页面和 TabBar 页面统一放在最前**，由主分支管理员维护
3. **灰度完成后清理 `-v3` 后缀**，删除旧页面路由，统一由管理员提交
4. 如冲突频繁，考虑使用 `merge-pages-json.js` 脚本自动合并（见下方）

```javascript
// scripts/merge-pages-json.js — 自动合并 pages.json 路由
const fs = require('fs')
const current = JSON.parse(fs.readFileSync('src/pages.json', 'utf-8'))
const incoming = JSON.parse(fs.readFileSync('src/pages-incoming.json', 'utf-8'))

// 按模块 section 注释去重合并
const merged = { ...current, pages: [...new Set([...current.pages, ...incoming.pages])] }
fs.writeFileSync('src/pages.json', JSON.stringify(merged, null, 2))
```

---

## 第四步：灰度上线

### 4.1 Feature Flag 配置

```typescript
// config/feature-flags.ts
export const FeatureFlags = {
  userModuleV3: false,      // 用户模块
  goodsModuleV3: false,     // 商品模块
  orderModuleV3: false,     // 订单模块
  paymentModuleV3: false,   // 支付模块
}
```

### 4.2 pages.json 双版本路由

```json
{
  "pages": [
    // 旧版页面（保留，作为回退）
    { "path": "pages/user/login", "style": { "navigationBarTitleText": "登录" } },
    { "path": "pages/user/profile", "style": { "navigationBarTitleText": "我的" } },
    // 新版页面（灰度中）
    { "path": "pages/user-v3/login", "style": { "navigationBarTitleText": "登录" } },
    { "path": "pages/user-v3/profile", "style": { "navigationBarTitleText": "我的" } }
  ]
}
```

### 4.3 路由分发中间件

```typescript
// utils/navigation.ts
import { FeatureFlags } from '@/config/feature-flags'

// 基础路径映射（不含 query 参数）
const ROUTE_MAP: Record<string, string> = {
  '/pages/user/login': '/pages/user-v3/login',
  '/pages/user/profile': '/pages/user-v3/profile',
  // ... 更多路由映射
}

export function navigateTo(url: string, options?: any) {
  // 分离路径和 query 参数
  const [basePath, query] = url.split('?')
  const mappedPath = ROUTE_MAP[basePath] || basePath
  const finalPath = FeatureFlags.userModuleV3 ? mappedPath : basePath
  const targetUrl = query ? `${finalPath}?${query}` : finalPath

  uni.navigateTo({ url: targetUrl, ...options })
}

// 同样需要包装 redirectTo / switchTab / reLaunch
export function redirectTo(url: string, options?: any) {
  const [basePath, query] = url.split('?')
  const mappedPath = ROUTE_MAP[basePath] || basePath
  const finalPath = FeatureFlags.userModuleV3 ? mappedPath : basePath
  const targetUrl = query ? `${finalPath}?${query}` : finalPath

  uni.redirectTo({ url: targetUrl, ...options })
}
```

### 4.4 灰度流程

```
1. 开发环境 → 全部使用 v3 页面，验证功能
2. 测试环境 → 全部使用 v3 页面，测试团队验证
3. 预发环境 → 内部员工先使用 v3（通过 Feature Flags + 白名单）
4. 生产环境小流量（1%）→ 监控错误率 2 小时
5. 生产环境（10%）→ 监控错误率 24 小时
6. 生产环境（50%）→ 监控 48 小时
7. 生产环境全量 → 关闭 Feature Flag，删除旧页面
```

---

## 第五步：收尾清理

### 5.1 移除 Vue2 运行时

所有模块灰度稳定 2 周后：

```bash
# 删除 Vue2 相关依赖
npm uninstall vuex vue@2

# 删除旧 Store 目录
rm -rf src/store/

# 删除旧页面
rm -rf src/pages/user/  # 仅保留 v3 版本
rm -rf src/pages/goods/
# ...

# 重命名 v3 目录为正式目录
mv src/pages/user-v3 src/pages/user
```

### 5.2 更新 pages.json

```json
{
  "pages": [
    { "path": "pages/user/login", "style": { "navigationBarTitleText": "登录" } },
    { "path": "pages/user/profile", "style": { "navigationBarTitleText": "我的" } }
    // 移除所有 v3 页面路由
  ]
}
```

### 5.3 删除 Feature Flag

```bash
# 删除 config/feature-flags.ts
# 删除 utils/navigation.ts 中的路由映射
# 所有页面使用直接路径跳转
```

### 5.4 运行全局规范检查

```bash
# 代码审计
# (调用 uniapp-code-audit-skill)

# 样式一致性审计
# (调用 uniapp-style-skill 或 frontend-style-harmonizer-skill)

# 跨平台兼容性审计
# (调用 uniapp-crossplatform-audit-skill)

# 标准骨架自检
npm run verify
```

---

## 常见错误解决方案

### 1. Pinia Store 在组件外使用报错

```typescript
// 错误：在 setup 外部调用 useXxxStore()
import { useUserStore } from '@/stores/modules/user'
const userStore = useUserStore() // ❌ 报错：getActivePinia was called with no active Pinia

// 解决：确保在 setup 函数内或 Pinia 已注册后调用
// 或者在非组件场景中传入 pinia 实例
import pinia from '@/stores'
const userStore = useUserStore(pinia)
```

### 2. 小程序中 `<script setup>` 组件事件不生效

```vue
<!-- 错误：没有显式声明 emits -->
<script setup lang="ts">
function handleClick() {
  emit('change') // 事件不生效
}
</script>

<!-- 正确：显式声明 emits -->
<script setup lang="ts">
const emit = defineEmits<{
  change: []
}>()

function handleClick() {
  emit('change')
}
</script>
```

### 3. ref 对象在模板中使用不需要 .value

```vue
<script setup lang="ts">
const count = ref(0)
</script>
<template>
  <!-- 模板中自动解包，不需要 .value -->
  <view>{{ count }}</view>
</template>
```

### 4. reactive 对象解构后失去响应式

```typescript
// 错误
const state = reactive({ count: 0, name: 'test' })
const { count } = state // ❌ 失去响应式

// 正确：使用 toRefs
import { toRefs } from 'vue'
const { count } = toRefs(state) // ✓ 保持响应式

// 或者直接用 ref
const count = ref(0)
const name = ref('test')
```

### 5. Props 默认值与 TypeScript

```vue
<script setup lang="ts">
interface Props {
  title?: string
  count?: number
}

// 错误：直接使用解构默认值（失去响应式）
const { title = '默认标题' } = defineProps<Props>() // ❌

// 正确：使用 withDefaults
const props = withDefaults(defineProps<Props>(), {
  title: '默认标题',
  count: 0
})

// 或者使用 defineProps 的运行时声明（适合简单场景）
defineProps({
  title: { type: String, default: '默认标题' },
  count: { type: Number, default: 0 }
})
</script>
```
