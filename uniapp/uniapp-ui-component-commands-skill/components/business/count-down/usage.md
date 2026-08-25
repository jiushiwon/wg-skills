# count-down 使用示例

## 基础用法

```vue
<count-down :timestamp="endTime" />
```

## 显示天数

```vue
<count-down :timestamp="endTime" :show-day="true" />
```

## 结束事件

```vue
<count-down :timestamp="endTime" @end="onEnd" />

<template #end>
  <text class="expired">已过期</text>
</template>
```
