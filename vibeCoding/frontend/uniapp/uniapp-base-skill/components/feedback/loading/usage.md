# loading 使用示例

## 基础用法

```vue
<template>
<loading />
</template>


```

## 带文字

```vue
<template>
<loading :loading="loading" text="加载中..." />
</template>


```

## 不同尺寸

```vue
<template>
<loading size="small" />
<loading size="medium" />
<loading size="large" />
</template>


```

## 页面级遮罩用法

```vue
<template>
<view v-if="loading" class="page-loading">
  <loading text="正在加载数据..." />
</view>
</template>


```

## 说明

- `loading` 为 `false` 时组件不渲染任何内容。
- `size` 决定指示器直径，取值 `small` / `medium` / `large`。
- 组件内不写关键帧动画，旋转由 `transform` + 过渡时长实现，样式层统一管理关键帧。
