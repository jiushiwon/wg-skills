# empty-state 使用示例

## 基础用法

```vue
<template>
<empty-state title="暂无数据" desc="暂时没有相关内容" />
</template>


```

## 带操作按钮

```vue
<template>
<empty-state
  title="暂无订单"
  desc="快去选购喜欢的商品吧"
  button-text="去逛逛"
  show-button
  @click="goShopping"
/>
</template>


```

## 带插图

```vue
<template>
<empty-state
  image="/static/images/empty-order.png"
  title="暂无订单"
  desc="订单会在这里展示"
/>
</template>


```

## 自定义图标与操作区（插槽）

```vue
<template>
<empty-state title="搜索结果为空" desc="换个关键词试试">
  <template #icon>
    <image class="search-icon" src="/static/images/search.png" mode="aspectFit" />
  </template>
  <template #action>
    <view class="reset-btn" @click="resetKeyword">重置搜索</view>
  </template>
</empty-state>
</template>


```

## 说明

- 组件不使用 emoji：未提供 `image` 时用 CSS 形状占位，也可用 `icon` 插槽完全自定义。
- `action` 插槽优先于内置按钮；未提供插槽时需 `show-button` 且 `button-text` 非空才渲染按钮。
- 点击内置按钮派发 `click` 事件。
