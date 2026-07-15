# action-sheet 使用示例

## 基础用法

```vue
<action-sheet
  :show="showSheet"
  title="请选择操作"
  :options="[
    { text: '分享', value: 'share' },
    { text: '收藏', value: 'favorite' },
    { text: '删除', value: 'delete', destructive: true }
  ]"
  @select="handleSelect"
  @close="showSheet = false"
/>
```
