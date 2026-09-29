# search-bar 使用示例

## 基础用法

```vue
<search-bar v-model="keyword" placeholder="请输入关键词" @search="onSearch" />
```

## 带取消按钮

```vue
<search-bar
  v-model="keyword"
  placeholder="搜索"
  :show-cancel="true"
  @search="onSearch"
  @cancel="onCancel"
/>
```
