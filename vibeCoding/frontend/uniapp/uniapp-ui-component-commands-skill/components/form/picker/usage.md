# picker 使用示例

## 基础用法

```vue
<picker
  v-model="selected"
  label="请选择"
  :range="options"
  range-key="name"
  @click="showPicker"
/>
```

## 数组形式

```vue
<picker
  v-model="selected"
  label="城市"
  :range="['北京', '上海', '广州', '深圳']"
  @click="showPicker"
/>
```
