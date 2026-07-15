# radio-group 使用示例

## 基础用法

```vue
<radio-group
  v-model="selected"
  label="性别"
  :options="[
    { label: '男', value: 'male' },
    { label: '女', value: 'female' }
  ]"
/>
```
