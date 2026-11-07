# list-item 使用示例

> 卡片外壳由根容器 `BaseCard` 提供（圆角、背景、边框），业务侧只传内容。

## 基础用法

```vue
<template>
<list-item title="设置" arrow @click="goToSettings" />
</template>


```

## 带描述

```vue
<template>
<list-item title="用户名" label="微信号: wx123456" arrow />
</template>


```

## 带图标

```vue
<template>
<list-item icon="/static/user.png" title="个人资料" arrow />
</template>


```

## 带值

```vue
<template>
<list-item title="版本" value="v1.0.0" />
</template>


```

## 禁用

```vue
<template>
<list-item title="已下架商品" disabled />
</template>


```

## 使用插槽

```vue
<template>
<list-item>
  <template #right>
    <switch />
  </template>
</list-item>
</template>


```

## 说明

- `disabled` 为真时置灰且不触发 `click`。
- `icon` 为图片地址，加载失败时自动隐藏。
