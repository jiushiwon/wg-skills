# empty-state 使用示例

## 基础用法

```vue
<empty-state
  title="暂无数据"
  desc="暂时没有内容哦"
/>
```

## 带按钮

```vue
<empty-state
  title="暂无订单"
  desc="快去选购商品吧"
  button-text="去逛逛"
  :show-button="true"
  @click="goShopping"
/>
```

## 自定义图标

```vue
<empty-state
  icon="🔍"
  title="搜索结果为空"
  desc="换个关键词试试"
/>
```
