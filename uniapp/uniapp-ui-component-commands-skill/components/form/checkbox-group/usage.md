# checkbox-group 使用示例

## 基础用法

```vue
<checkbox-group
  v-model="checked"
  label="爱好"
  :options="[
    { label: '篮球', value: 'basketball' },
    { label: '足球', value: 'football' },
    { label: '游泳', value: 'swimming' }
  ]"
/>
```
