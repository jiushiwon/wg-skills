# top-tab 使用示例

## 基础用法

```vue
<top-tab :tabs="['推荐', '热门', '最新', '科技', '体育']" @change="onTabChange" />
```

## 数组对象

```vue
<top-tab
  :tabs="[
    { name: '推荐', id: 'rec' },
    { name: '热门', id: 'hot' },
    { name: '最新', id: 'new' }
  ]"
  @change="onTabChange"
/>
```

## 自定义颜色

```vue
<top-tab
  :tabs="tabs"
  active-color="#ff6b6b"
  inactive-color="#999"
  @change="onTabChange"
/>
```
