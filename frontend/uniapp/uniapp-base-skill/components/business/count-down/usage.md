# count-down 使用示例

## 基础用法（结束时间戳）

```vue
<template>
<count-down :target="endTime" />
</template>


```

## 相对秒数倒计时

```vue
<template>
<count-down :seconds="60" />
</template>


```

## 指定展示格式

```vue
<template>
<!-- DD=天 HH=时 mm=分 ss=秒 -->
<count-down :target="endTime" format="DD天HH时mm分ss秒" />
<count-down :target="endTime" format="HH:mm:ss" />
</template>


```

## 分段插槽自定义渲染

```vue
<template>
<count-down :target="endTime">
  <template #default="{ hourText, minuteText, secondText }">
    <text class="my-countdown">{{ hourText }}:{{ minuteText }}:{{ secondText }}</text>
  </template>
</count-down>
</template>


```

## 结束事件与结束态

```vue
<template>
<count-down :target="endTime" @finish="onFinish">
  <template #end>
    <text class="expired">已过期</text>
  </template>
</count-down>
</template>


```

## 说明

- `target`（结束时间戳）与 `seconds`（相对秒数）二选一，`target` 优先。
- 组件卸载时会自动清理定时器；倒计时归零触发 `finish`（同时兼容旧事件名 `end`），只触发一次。
- `format` 非空时按模板渲染，未传 `format` 且未使用默认插槽时走默认分段样式。
