# Vue2 到 Vue3 语法差异对照

> 本文档详细对比 Vue2 和 Vue3 的语法差异

## 模板语法

### v-for

```vue
<!-- Vue2 -->
<view v-for="(item, index) in list" :key="index">

<!-- Vue3 -->
<view v-for="(item, index) in list" :key="index">
```

### v-model

```vue
<!-- Vue2 -->
<input v-model="value">
<input v-model.trim="value">
<input v-model.number="value">

<!-- Vue3 -->
<!-- 语法相同，但组件上用法有变化 -->
<input v-model="value">
<!-- 自定义组件 -->
<Child v-model="value">
<Child v-model:title="title">
```

### 事件绑定

```vue
<!-- Vue2 -->
<button @click="handleClick">点击</button>
<button v-on:click="handleClick">点击</button>

<!-- Vue3 -->
<!-- 完全相同 -->
<button @click="handleClick">点击</button>
```

### Slot

```vue
<!-- Vue2 -->
<template slot="default">
  内容
</template>
<!-- 或 -->
<template slot-scope="{ data }">
  {{ data }}
</template>

<!-- Vue3 -->
<template #default>
  内容
</template>
<!-- 或 -->
<template #default="{ data }">
  {{ data }}
</template>
```

## Script 语法

### 数据定义

```typescript
// Vue2
export default {
  data() {
    return {
      count: 0,
      name: '张三',
      list: [] as any[]
    }
  }
}

// Vue3 - 方式1: Composition API
import { ref, reactive } from 'vue'
export default {
  setup() {
    const count = ref(0)
    const name = ref('张三')
    const list = ref<any[]>([])
    return { count, name, list }
  }
}

// Vue3 - 方式2: <script setup>
<script setup lang="ts">
import { ref, reactive } from 'vue'

const count = ref(0)
const name = ref('张三')
const list = ref<any[]>([])
</script>
```

### Props

```typescript
// Vue2
export default {
  props: {
    title: String,
    count: {
      type: Number,
      default: 0
    }
  }
}

// Vue3 - 方式1
export default {
  props: {
    title: String,
    count: {
      type: Number,
      default: 0
    }
  }
}

// Vue3 - 方式2: <script setup>
<script setup lang="ts">
interface Props {
  title?: string
  count?: number
}

withDefaults(defineProps<Props>(), {
  title: '',
  count: 0
})
</script>
```

### Emit

```typescript
// Vue2
export default {
  methods: {
    handleClick() {
      this.$emit('update', 1)
    }
  }
}

// Vue3 - 方式1
export default {
  emits: ['update'],
  setup(props, { emit }) {
    function handleClick() {
      emit('update', 1)
    }
    return { handleClick }
  }
}

// Vue3 - 方式2: <script setup>
<script setup lang="ts">
const emit = defineEmits<{
  update: [value: number]
}>()

function handleClick() {
  emit('update', 1)
}
</script>
```

### Computed

```typescript
// Vue2
export default {
  computed: {
    double() {
      return this.count * 2
    }
  }
}

// Vue3
import { computed } from 'vue'

// 方式1
export default {
  setup() {
    const count = ref(1)
    const double = computed(() => count.value * 2)
    return { double }
  }
}

// 方式2: <script setup>
const count = ref(1)
const double = computed(() => count.value * 2)
</script>
```

### Watch

```typescript
// Vue2
export default {
  data() { return { count: 0 } },
  watch: {
    count(newVal, oldVal) {
      console.log(newVal, oldVal)
    }
  }
}

// Vue3
import { watch } from 'vue'

// 方式1
export default {
  setup() {
    const count = ref(0)
    watch(count, (newVal, oldVal) => {
      console.log(newVal, oldVal)
    })
    return { count }
  }
}

// 方式2: <script setup>
const count = ref(0)
watch(count, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})
</script>
```

## 生命周期

### Vue 标准生命周期

| Vue2 | Vue3 | 说明 |
|------|------|------|
| `beforeCreate` | 无直接对应 | setup() 在此阶段之前已执行 |
| `created` | 无直接对应 | setup() 在此阶段运行；用 setup() 顶层代码替代 |
| `beforeMount` | `onBeforeMount` | 挂载前 |
| `mounted` | `onMounted` | 挂载完成 |
| `beforeUpdate` | `onBeforeUpdate` | 更新前 |
| `updated` | `onUpdated` | 更新完成 |
| `activated` | `onActivated` | keep-alive 激活 |
| `deactivated` | `onDeactivated` | keep-alive 停用 |
| `beforeDestroy` | `onBeforeUnmount` | 销毁前 |
| `destroyed` | `onUnmounted` | 销毁完成 |
| `errorCaptured` | `onErrorCaptured` | 捕获子组件错误 |

```typescript
// Vue2
export default {
  created() {
    console.log('created') // 数据初始化、API 调用
  },
  mounted() {
    console.log('mounted') // DOM 操作
  },
  beforeDestroy() {
    console.log('beforeDestroy') // 清理工作
  }
}

// Vue3 — <script setup>：setup() 顶层代码等价于 created 阶段
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

// 顶层代码 = created 阶段执行
console.log('setup — 等价于 created')
fetchInitialData()

onMounted(() => {
  console.log('mounted')
})

onBeforeUnmount(() => {
  console.log('beforeUnmount — 等价于 beforeDestroy')
})
</script>
```

### uni-app 页面生命周期（在 `<script setup>` 中使用）

> 以下生命周期需从 `@dcloudio/uni-app` 导入。

```vue
<script setup lang="ts">
import { onLoad, onReady, onShow, onHide, onUnload, onReachBottom, onPullDownRefresh, onPageScroll, onShareAppMessage } from '@dcloudio/uni-app'

// onLoad — 监听页面加载（可获取页面参数 options）
onLoad((options: any) => {
  console.log('页面参数:', options.id)
})

// onReady — 监听页面初次渲染完成
onReady(() => {})

// onShow — 监听页面显示（每次进入页面都会触发）
onShow(() => {})

// onHide — 监听页面隐藏
onHide(() => {})

// onUnload — 监听页面卸载
onUnload(() => {})

// onReachBottom — 页面上拉触底
onReachBottom(() => {
  // 加载更多数据
})

// onPullDownRefresh — 监听下拉刷新
onPullDownRefresh(async () => {
  await refreshData()
  uni.stopPullDownRefresh()
})

// onPageScroll — 监听页面滚动
onPageScroll((e) => {
  console.log('滚动距离:', e.scrollTop)
})
</script>
```

### Vue 与 uni-app 生命周期执行时序

```
Vue2 uni-app:
  beforeCreate → created → onLoad → beforeMount → mounted → onReady → onShow

Vue3 uni-app:
  setup() → onLoad → onBeforeMount → onMounted → onReady → onShow

关键差异：
- setup() 在 onLoad 之前运行，但 setup 中无法访问 onLoad 的 options 参数
- 依赖页面参数（如 id）的逻辑必须放在 onLoad 回调中
- onShow 在每次 Tab 切换时都会触发（不像 mounted 只触发一次）
```

## 状态管理

### Vuex → Pinia

```typescript
// Vue2 - Vuex
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    increment({ commit }) {
      commit('increment')
    }
  },
  getters: {
    double: state => state.count * 2
  }
})

// 使用
this.$store.state.count
this.$store.commit('increment')
this.$store.getters.double

// Vue3 - Pinia
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return { count, double, increment }
})

// 使用
import { useCounterStore } from '@/stores'
const store = useCounterStore()
store.count
store.increment()
store.double
```

## 组件

### 组件注册

```vue
<!-- Vue2 -->
<script>
import Child from './Child.vue'

export default {
  components: {
    Child
  }
}
</script>

<!-- Vue3 -->
<!-- <script setup> 中直接使用 -->
<script setup lang="ts">
import Child from './Child.vue'
</script>
```

### 异步组件

```typescript
// Vue2
components: {
  AsyncComponent: () => import('./AsyncComponent.vue')
}

// Vue3
import { defineAsyncComponent } from 'vue'
const AsyncComponent = defineAsyncComponent(() => import('./AsyncComponent.vue'))
```

## 常见迁移问题

### 1. 组件根元素（Fragment）

```vue
<!-- Vue2: 必须一个根元素（不支持 Fragment） -->
<template>
  <view>
    <view>1</view>
    <view>2</view>
  </view>
</template>

<!-- Vue3: 支持多个根元素（Fragment），无需额外包裹 -->
<template>
  <view>1</view>
  <view>2</view>
</template>

<!-- 注意：uni-app 小程序端对多根节点的支持因版本而异，建议验证 -->
<!-- 跨端兼容方案：仍使用单一根元素包裹，避免兼容性问题 -->
```

### 2. 自定义指令

```typescript
// Vue2 — 全局注册
Vue.directive('focus', {
  inserted(el) { el.focus() }
})

// Vue2 — 组件内
directives: {
  focus: {
    inserted(el) { el.focus() }
  }
}

// Vue3 — 全局注册
const app = createSSRApp(App)
app.directive('focus', {
  mounted(el) { el.focus() }
})

// Vue3 — 组件内（<script setup> 中，指令名必须以 v 开头）
<script setup lang="ts">
const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}
</script>
<template>
  <input v-focus />
</template>```

**Vue2→Vue3 指令生命周期完整映射**：

| Vue2 钩子 | Vue3 钩子 | 说明 |
|-----------|-----------|------|
| `bind` | `created` | 指令首次绑定到元素时 |
| `inserted` | `mounted` | 元素插入父节点时 |
| `update` | `updated` | 组件 VNode 更新时（注意：Vue2 在更新前、Vue3 在更新后） |
| `componentUpdated` | `updated` | 与 `update` 合并为 `updated`（Vue3 的 updated 在子 VNode 更新后触发，等效此钩子） |
| `unbind` | `unmounted` | 指令与元素解绑时 |

```

### 3. $children / $parent

```typescript
// Vue2
this.$children
this.$parent

// Vue3
// 移除，使用 provide/inject 或 pinia
```

### 4. $listeners

```typescript
// Vue2
this.$listeners

// Vue3
// 合并到 $attrs 中
this.$attrs
```

### 5. Filters 过滤器

```typescript
// Vue2 - 过滤器
export default {
  filters: {
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD')
    }
  }
}

// 使用
{{ date | formatDate }}

// Vue3 - 移除过滤器，使用计算属性或函数
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 使用
{{ formatDate(date) }}
```

### 6. 全局 API 变化

```typescript
// Vue2 - 全局配置
Vue.config.productionTip = false
Vue.component('MyComponent', {})
Vue.directive('focus', {})

// Vue3 - 使用 app 实例
const app = createApp(App)
app.config.productionTip = false
app.component('MyComponent', {})
app.directive('focus', {})
```

### 7. Provide / Inject

```typescript
// Vue2 - 同样支持
provide: {
  name: 'John'
}
inject: ['name']

// Vue3 - 完全相同，但推荐使用组合式 API
import { provide, inject } from 'vue'

// 父组件
provide('name', 'John')

// 子组件
const name = inject('name')
```

### 8. 异步组件

```typescript
// Vue2
components: {
  AsyncComponent: () => import('./AsyncComponent.vue')
}

// Vue3
import { defineAsyncComponent } from 'vue'
const AsyncComponent = defineAsyncComponent(() => import('./AsyncComponent.vue'))
```

> **小程序端警告**：`defineAsyncComponent` 依赖动态 `import()`，微信小程序基础库 2.x+ 才支持，且分包行为不可控。uni-app 小程序端推荐使用分包加载（`pages.json` 的 `subPackages`），或将异步组件条件编译为仅 H5 端使用。

### 样式深度选择器迁移

```scss
// Vue2 — 深度选择器（scoped 样式中穿透到子组件）
<style scoped>
.parent /deep/ .child { color: red; }
.parent >>> .child { color: red; }
</style>

// Vue3 — /deep/ 和 >>> 已废弃，必须使用 :deep()
<style scoped>
.parent :deep(.child) { color: red; }
</style>
```

### 9. 组合式 API 响应式

```typescript
// ref - 基础类型
const count = ref(0)
count.value++

// reactive - 对象
const state = reactive({
  name: 'John',
  age: 30
})
state.name = 'Jane'

// toRefs - 解构响应式
const { name, age } = toRefs(state)

// toRef - 单一响应式
const name = toRef(state, 'name')
```

### 10. this.$refs 重构

```typescript
// Vue2 — this.$refs 访问子组件/DOM
this.$refs.childComponent.doSomething()
this.$refs.inputRef.focus()

// Vue3 — 使用 ref() + 同名变量
const childComponent = ref(null)
const inputRef = ref(null)

// 模板中 ref="childComponent" 同名绑定
childComponent.value.doSomething()
inputRef.value.focus()

// 注意：<script setup> 中的变量默认不暴露给父组件
// 需要暴露的方法/属性使用 defineExpose()
defineExpose({
  doSomething,
  validate,
  formData
})
```

### 11. this.$nextTick

```typescript
// Vue2
this.$nextTick(() => {
  console.log('DOM 更新完成')
})

// Vue3
import { nextTick } from 'vue'

nextTick(() => {
  console.log('DOM 更新完成')
})

// 或者 await 用法
await nextTick()
console.log('DOM 更新完成')
```

### 12. Event Bus 移除与替代

```typescript
// Vue2 — 全局事件总线（Vue3 中彻底移除）
// 初始化：通常在 main.js 中
Vue.prototype.$bus = new Vue()

// 发送
this.$bus.$emit('custom-event', payload)

// 监听
this.$bus.$on('custom-event', (payload) => { ... })

// 移除
this.$bus.$off('custom-event')

// Vue3 — 方案一：mitt（轻量级 Event Bus）
import mitt from 'mitt'

const emitter = mitt()

emitter.emit('custom-event', payload)
emitter.on('custom-event', (payload) => { ... })
emitter.off('custom-event')

// Vue3 — 方案二：provide/inject（推荐用于父子/祖孙通信）
// 祖先组件
provide('userUpdated', (data) => {
  console.log('用户更新', data)
})

// 后代组件
const userUpdated = inject<(data: any) => void>('userUpdated')
userUpdated?.({ id: 1 })
```

### 13. this.$set 不再需要

```typescript
// Vue2 — 对象新增属性需用 $set 保证响应式
this.$set(this.userInfo, 'age', 18)

// Vue3 — Proxy 自动追踪，直接赋值即可
userInfo.value.age = 18
// 或 reactive
state.userInfo.age = 18
```

### 14. Mixin → Composable

```typescript
// Vue2 — Mixin
// mixins/pageMixin.js
export default {
  data() {
    return {
      loading: false,
      page: 1,
      list: []
    }
  },
  methods: {
    async fetchData() {
      this.loading = true
      // ...
      this.loading = false
    }
  },
  onShow() {
    this.fetchData()
  }
}

// 页面使用
export default {
  mixins: [pageMixin],
  // ...
}

// Vue3 — Composable
// composables/usePageList.ts
import { ref, onShow } from 'vue'

export function usePageList<T>(fetchFn: (page: number) => Promise<T[]>) {
  const loading = ref(false)
  const page = ref(1)
  const list = ref<T[]>([])

  async function fetchData() {
    loading.value = true
    const result = await fetchFn(page.value)
    list.value = result
    loading.value = false
  }

  onShow(() => {
    fetchData()
  })

  return { loading, page, list, fetchData }
}

// 页面使用
const { loading, page, list, fetchData } = usePageList(fetchUserList)
```

### 15. v-if / v-for 优先级变化

```vue
<!-- Vue2 — v-for 优先级高于 v-if（同元素上 v-if 可访问 v-for 循环变量） -->
<ul>
  <li v-for="item in list" v-if="item.visible">{{ item.name }}</li>
</ul>

<!-- Vue3 — v-if 优先级高于 v-for，同元素使用时 v-if 中无法访问 v-for 变量 -->
<!-- 会报错：Property "item" was accessed during render but is not defined -->
<!-- 正确写法：先 computed 过滤，再 v-for -->
<script setup lang="ts">
const visibleList = computed(() => list.value.filter(item => item.visible))
</script>
<template>
  <ul>
    <li v-for="item in visibleList" :key="item.id">{{ item.name }}</li>
  </ul>
</template>

<!-- 或使用 <template> 包裹：-->
<template v-for="item in list" :key="item.id">
  <li v-if="item.visible">{{ item.name }}</li>
</template>
```

### 16. .sync 修饰符 → v-model:propName

```vue
<!-- Vue2 — .sync 双向绑定 -->
<Child :title.sync="pageTitle" />
<!-- 等价于 -->
<Child :title="pageTitle" @update:title="pageTitle = $event" />

<!-- 子组件中 -->
this.$emit('update:title', newValue)

<!-- Vue3 — v-model:propName 替代 .sync -->
<Child v-model:title="pageTitle" />

<!-- 子组件中（<script setup>） -->
const emit = defineEmits<{
  'update:title': [value: string]
}>()
emit('update:title', newValue)
```

### 17. uni-app 特有差异

#### 17.1 easycom 组件自动导入

```json
// Vue2 的 pages.json — easycom 默认开启，组件无需 type 字段
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^u-(.*)": "@/components/u-$1/u-$1.vue"
    }
  }
}

// Vue3 的 pages.json — 自定义 easycom 需要显式声明 type
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^u-(.*)": "@/components/u-$1/u-$1.vue"
    }
  }
}
```

#### 17.2 自定义组件事件声明

```vue
<!-- uni-app Vue2 — 无需显式声明 emits -->
<script>
export default {
  methods: {
    handleClick() {
      this.$emit('change', this.value)
    }
  }
}
</script>

<!-- uni-app Vue3 — 必须显式声明 emits，否则事件不生效 -->
<script setup lang="ts">
const emit = defineEmits<{
  change: [value: string]
}>()

function handleClick() {
  emit('change', props.value)
}
</script>
```

#### 17.3 onLoad 参数获取

```typescript
// Vue2 — Options API
export default {
  onLoad(options) {
    console.log(options.id)
  }
}

// Vue3 — <script setup> 中需从 @dcloudio/uni-app 导入
<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad((options) => {
  console.log(options.id)
})
</script>
```

#### 17.4 uni-app 全局属性注入

```typescript
// Vue2 — 通过 Vue.prototype 注入全局属性
Vue.prototype.$api = api
Vue.prototype.$utils = utils

// 页面中使用
this.$api.getUser()
this.$utils.formatDate()

// Vue3 — 方式一：app.config.globalProperties
const app = createSSRApp(App)
app.config.globalProperties.$api = api

// 页面中使用（需要 getCurrentInstance）
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
proxy.$api.getUser()

// Vue3 — 方式二（推荐）：直接导入使用
import { getUser } from '@/api/modules/user'
import { formatDate } from '@/utils/date'

getUser()
formatDate()
```

#### 17.5 uni-app 页面生命周期与 Vue 生命周期时序

```
Vue2 uni-app:
  created → onLoad → mounted → onReady → onShow

Vue3 uni-app:
  setup 执行 → onLoad → onMounted → onReady → onShow

关键差异：
- Vue3 的 setup() 在 onLoad 之前执行（而 Vue2 的 created 也在 onLoad 之前）
- 但 setup 中无法访问 onLoad 传入的 options 参数
- 需要页面参数的操作（如根据 id 获取详情）必须放在 onLoad 回调中

#### 17.6 getCurrentInstance() 使用限制

```typescript
// Vue3 — 获取组件实例（相当于 Vue2 的 this）
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const { proxy } = instance

// 通过 proxy 访问全局属性
proxy.$api.getUser()

// 重要限制：
// 1. getCurrentInstance() 只能在 setup() 或生命周期中同步调用
//    不要在 async 回调、setTimeout 等异步上下文中调用
// 2. uni-app 的 onLaunch 中调用 getCurrentInstance() 可能返回 null
// 3. App 端的 renderjs 中不可用
// 4. 建议先用 getCurrentInstance() 获取所需引用、再在回调中使用：
const { proxy } = getCurrentInstance()
async function fetchData() {
  proxy.$api.getUser() // OK — proxy 已在同步上下文中获取
}
```

#### 17.7 #ifdef / #ifndef 条件编译迁移

```vue
<!-- 旧项目常见写法 -->
<template>
  <!-- #ifdef VUE2 -->
  <view class="old-style">
  <!-- #endif -->
  <!-- #ifdef VUE3 -->
  <view class="new-style">
  <!-- #endif -->
    <text>内容</text>
  </view>
</template>

<script>
// #ifdef VUE2
import OldPlugin from 'old-plugin'
// #endif
// #ifdef VUE3
import NewPlugin from 'new-plugin'
// #endif
</script>

<!-- 迁移策略 -->
<!-- 1. 旧页面（保留作回退）→ 保留 #ifdef VUE2 块不变 -->
<!-- 2. 新页面 → 移除 #ifdef VUE2 块，添加 #ifdef VUE3 保护（如需跨端兼容） -->
<!-- 3. 灰度完成后 → 移除所有条件编译，只保留 Vue3 代码 -->

<!-- 通用迁移模板 -->
<script lang="ts">
// #ifdef VUE2
import oldApi from '@/api/old-api.js'      // 回退用
// #endif
</script>

<script setup lang="ts">
import newApi from '@/api/modules/api.ts'
// 新旧共存期间通过条件编译切换实现
</script>
```

**条件编译迁移检查清单**：
```
□ 搜索项目中所有 #ifdef VUE2 / #ifndef VUE3 代码块
□ 每个模块迁移完成后，搜索 #ifdef VUE2 确认是否还有残留
□ 收尾清理时，全局搜索移除所有 VUE2 条件编译
□ 平台条件编译（#ifdef MP-WEIXIN / H5 / APP-PLUS）保留不变
```

**嵌套条件编译处理**：当 `#ifdef VUE2` 与平台条件编译交织时，迁移后移除 VUE2 分支并展平：

```vue
<!-- 迁移前 -->
<!-- #ifdef MP-WEIXIN -->
  <!-- #ifdef VUE2 -->
  <old-wechat-comp />
  <!-- #endif -->
  <!-- #ifdef VUE3 -->
  <new-wechat-comp />
  <!-- #endif -->
<!-- #endif -->

<!-- 迁移后（移除 VUE2 分支） -->
<!-- #ifdef MP-WEIXIN -->
<new-wechat-comp />
<!-- #endif -->
```

### 18. Vue2 类组件（Decorator）迁移

部分 Vue2 项目使用 `vue-class-component` + `vue-property-decorator` 装饰器语法：

```typescript
// Vue2 — 类组件（Decorator）
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class MyComponent extends Vue {
  @Prop({ default: 'default' }) title!: string
  count: number = 0

  @Watch('count')
  onCountChanged(newVal: number, oldVal: number) {
    console.log(newVal, oldVal)
  }

  get double() { return this.count * 2 }

  handleClick() {
    this.$emit('change', this.count)
  }
}

// Vue3 — <script setup lang="ts">
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props { title?: string }
const props = withDefaults(defineProps<Props>(), { title: 'default' })

const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})

const double = computed(() => count.value * 2)

const emit = defineEmits<{ change: [value: number] }>()
function handleClick() { emit('change', count.value) }
</script>
```

**类组件迁移对照**：

| Decorator | Vue3 `<script setup>` 替代 |
|-----------|---------------------------|
| `@Component` | `<script setup>` 本身 |
| `@Prop({ default }) title: string` | `defineProps<{ title?: string }>()` + `withDefaults()` |
| `@Watch('x')` | `watch(x, (newVal, oldVal) => {})` |
| `get xxx()` | `computed(() => ...)` |
| `this.$emit` | `defineEmits()` + `emit()` |
| `this.$refs` | `ref()` + `defineExpose()` |
| `@Emit()` | `defineEmits()` + `emit()` |
| `@Ref() el` | `ref()` |
```
