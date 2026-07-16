# 项目集成指引

本文件说明如何把 `ui-replica-skill` 产出的代码集成到真实项目中。

## 1. 代码形态选择

根据项目阶段选择输出形态：

| 形态 | 适用场景 | 输出内容 |
|---|---|---|
| 单文件 HTML | 快速验证还原度、无构建环境 | 一个 `.html` 文件 |
| Vue 单文件组件 | Vue2/Vue3/uniapp 项目 | 一个 `.vue` 文件 + 样式 |
| 多文件组件 | 已有规范的项目 | 页面 + 抽离的公共组件 |
| 接入已有项目 | 在现有代码库中添加页面 | 增量 diff |

## 2. 集成到 Vue3 项目

### 2.1 单文件迁移

把 HTML 中的结构复制到 `.vue` 的 `<template>`：

```vue
<template>
  <div class="page-container">
    <!-- 从 skill 输出复制 -->
  </div>
</template>

<script setup>
// 补充响应式数据、方法、生命周期
</script>

<style scoped>
/* 补充 scoped 样式 */
</style>
```

### 2.2 样式迁移

- 如果项目用 Tailwind：保留 class
- 如果项目用 Element Plus / Ant Design：逐步替换为组件库组件
- 如果项目用 SCSS/Less：把 CSS 变量迁移到项目变量文件

### 2.3 组件拆分

把公共部分拆成组件：

```
src/
├── components/
│   ├── AppSidebar.vue      # 侧边栏
│   ├── AppHeader.vue       # 顶部导航
│   ├── Steps.vue           # 步骤条
│   └── Card.vue            # 通用卡片
├── views/
│   └── MeetingQrCode.vue   # 当前页面
```

## 3. 集成到 uniapp 项目

### 3.1 标签替换

```
div → view
span → text
img → image
button → button（uniapp 支持）
input → input
```

### 3.2 样式注意

- 优先使用 `rpx` 代替 `px`
- 避免使用 `box-shadow` 在某些小程序上的兼容问题
- 图标使用 uni-icons 或自定义图标字体

## 4. 接入状态管理

### 4.1 简单页面

用 `ref` / `reactive` 管理本地状态：

```vue
<script setup>
import { ref } from 'vue'
const currentStep = ref(4)
const switchEnabled = ref(true)
const radius = ref(500)
</script>
```

### 4.2 多页面共享状态

接入 Pinia / Vuex：

```js
// stores/meeting.js
import { defineStore } from 'pinia'

export const useMeetingStore = defineStore('meeting', {
  state: () => ({
    meetingId: '452 889 601',
    radius: 500,
  })
})
```

## 5. 接入 API

### 5.1 先定义接口

在 `api/meeting.js` 中定义：

```js
export function getMeetingQrCode(id) {
  return request.get(`/api/meetings/${id}/qrcode`)
}

export function updateMeetingSettings(id, data) {
  return request.put(`/api/meetings/${id}/settings`, data)
}
```

### 5.2 在页面中使用

```vue
<script setup>
import { onMounted } from 'vue'
import { getMeetingQrCode } from '@/api/meeting'

onMounted(async () => {
  const res = await getMeetingQrCode(meetingId)
  qrCodeUrl.value = res.data.url
})
</script>
```

## 6. 接入路由

### Vue Router

```js
{
  path: '/meetings/:id/qrcode',
  name: 'MeetingQrCode',
  component: () => import('@/views/MeetingQrCode.vue')
}
```

### uniapp

```json
{
  "pages": [
    {
      "path": "pages/meeting/qrcode",
      "style": { "navigationBarTitleText": "二维码与接入" }
    }
  ]
}
```

## 7. 沉淀公共组件（可选）

如果复刻中产生了可复用组件，且后续需要长期维护，可考虑沉淀到 `ui-component-commands-skill`：

1. 在 `ui-component-commands-skill/components/` 创建组件目录
2. 编写 `index.vue`、`props.json`、`usage.md`
3. 更新 `ui-component-commands-skill/components/_registry.json`
4. 在后续项目中直接调用

**注意**：沉淀组件是后续收敛阶段的工作，不是复刻第一稿的必做项。

## 8. 增量交付策略

如果用户已有项目，不要一次性重写整个页面，而是：

1. 先输出单文件 HTML 验证还原度
2. 用户确认后，再输出组件化版本
3. 最后输出接入路由/状态/API 的完整集成方案

## 9. 常见集成问题

| 问题 | 解决方案 |
|---|---|
| 样式和项目冲突 | 使用 scoped / CSS Modules / BEM |
| 图标不显示 | 检查图标库是否已引入 |
| 字体不一致 | 统一使用项目字体栈 |
| 响应式异常 | 检查项目是否有全局样式覆盖 |
| 构建失败 | 检查是否使用了不支持的 CSS 特性 |
