# stepper 使用示例

## 基础用法

```vue
<stepper v-model="count" />
```

## 限制范围

```vue
<stepper v-model="count" :min="1" :max="10" />
```

## 步长

```vue
<stepper v-model="count" :step="2" />
```
