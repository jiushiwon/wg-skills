# breadcrumb 使用示例

## 基础用法

```vue
<breadcrumb :items="[
  { name: '首页', path: '/' },
  { name: '分类', path: '/category' },
  { name: '详情' }
]" />
```

## 自定义分隔符

```vue
<breadcrumb :items="items" separator=">" @click="onItemClick" />
```

## 点击事件

```vue
<breadcrumb :items="items" @click="handleClick" />
```
