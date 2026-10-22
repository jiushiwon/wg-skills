# progress-bar 使用示例

## 基础用法

```vue
<template>
<progress-bar :percent="60" />
</template>


```

## 不同状态

```vue
<template>
<progress-bar :percent="60" status="primary" />
<progress-bar :percent="60" status="success" />
<progress-bar :percent="60" status="warning" />
<progress-bar :percent="60" status="error" />
</template>


```

## 自定义文字

```vue
<template>
<progress-bar :percent="60" text="下载中..." />
<!-- 不显示文字 -->
<progress-bar :percent="60" :show-text="false" />
</template>


```

## 调整粗细

```vue
<template>
<progress-bar :percent="30" :stroke-width="10" />
</template>


```

## 说明

- `percent` 超出 0~100 时自动截断。
- `strokeWidth` 使用 px 数值语义，渲染时按 1px = 2rpx 换算。
- 填充色与轨道底色全部取主题变量。
