# price-tag 使用示例

## 基础用法

```vue
<template>
<price-tag price="99.00" />
</template>


```

## 带划线原价

```vue
<template>
<price-tag price="99.00" original-price="199.00" />
</template>


```

## 不同尺寸

```vue
<template>
<price-tag price="99" size="small" />
<price-tag price="99" size="medium" />
<price-tag price="99" size="large" />
</template>


```

## 自定义货币符号

```vue
<template>
<price-tag price="12.50" currency="$" />
<!-- 不显示符号 -->
<price-tag price="12.50" :symbol="false" />
</template>


```

## 说明

- 数字类型的 `price` 默认保留两位小数，可用 `decimal` 关闭。
- `originalPrice` 传入非空值时以划线形式追加在价格后面。
- 字号、颜色全部取主题变量，不支持自定义像素尺寸。
