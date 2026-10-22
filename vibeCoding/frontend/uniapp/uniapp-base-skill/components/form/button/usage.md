# button 使用示例

## 基础用法

```vue
<template>
<button text="提交" @click="onSubmit" />
</template>


```

## 类型与尺寸

```vue
<template>
<button type="primary" size="lg" text="立即下单" />
<button type="ghost" size="sm" text="取消" />
<button type="text" text="查看更多" />
<button type="danger" text="删除" />
</template>


```

## 加载与禁用

```vue
<template>
<button :loading="submitting" text="提交中" />
<button disabled text="暂不可用" />
</template>


```

## 块级与圆角

```vue
<template>
<button block shape="round" text="一键登录" />
</template>


```

## 自定义内容

```vue
<template>
<button>
  <image src="/icons/check.png" mode="aspectFit" class="btn-icon" />
  <text>完成</text>
</button>
</template>


```

## 说明

- `loading` 与 `disabled` 都会阻止 `click` 事件触发。
- 加载态的旋转动画由全局关键帧类 `ui-spin` 提供，组件内不自带 `@keyframes`。
- 触控区高度不小于 88rpx（`size="sm"` 时为 56rpx，其余档位 ≥ 72rpx）。
