# modal 使用示例

## 基础用法

```vue
<template>
<modal
  v-model:show="showModal"
  title="提示"
  message="确定要删除吗？"
  @confirm="onConfirm"
  @cancel="onCancel"
/>
</template>


```

## 危险态确认

```vue
<template>
<modal
  v-model:show="showDelete"
  title="删除订单"
  message="删除后不可恢复，确定继续吗？"
  confirm-text="删除"
  danger
  @confirm="doDelete"
/>
</template>


```

## 单按钮 / 禁止点遮罩关闭

```vue
<template>
<modal
  v-model:show="showTip"
  title="温馨提示"
  message="当前版本已停用"
  confirm-text="我知道了"
  :show-cancel="false"
  :close-on-mask="false"
  @confirm="showTip = false"
/>
</template>


```

## 自定义内容（默认插槽）

```vue
<template>
<modal v-model:show="showForm" title="完善资料">
  <view class="form">
    <text class="form__label">昵称</text>
    <input class="form__input" placeholder="请输入昵称" />
  </view>
</modal>
</template>


```

## 说明

- 外壳（遮罩、圆角、进出场动画）由 `BasePopup` 提供，组件不重复实现。
- 点击遮罩是否关闭由 `closeOnMask` 控制（默认开启）。
- 确认与取消都会关闭自身并派发 `close` 事件，`update:show` 同步为 `false`。
- `danger` 仅影响确认按钮颜色，不改变交互逻辑。
