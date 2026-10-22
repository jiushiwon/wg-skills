# toast 使用示例

## 基础用法

```vue
<template>
<toast :show="showToast" text="操作成功" type="success" @close="showToast = false" />
</template>


```

## 错误提示

```vue
<template>
<toast :show="showError" text="加载失败，请重试" type="error" @close="showError = false" />
</template>


```

## 警告提示

```vue
<template>
<toast :show="showWarn" text="余额不足" type="warning" @close="showWarn = false" />
</template>


```

## 常驻加载提示（不自动关闭）

```vue
<template>
<toast :show="loading" text="正在提交..." type="loading" :duration="0" />
</template>


```

## 说明

- `show` 变为 `true` 时开始计时，`duration` 到期后自动派发 `close`，由调用方把 `show` 置回 `false`。
- `duration` 设为 `0` 时不自动关闭，需调用方自行控制。
- 组件不使用 emoji，类型差异仅体现在配色上。
