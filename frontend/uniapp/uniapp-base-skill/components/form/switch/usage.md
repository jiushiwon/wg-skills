# switch 使用示例

## 基础用法

```vue
<switch v-model="checked" label="开关" @change="onChange" />
```

```vue
<script setup lang="ts">
import { ref } from 'vue'

const checked = ref(false)

function onChange(value: boolean) {
  console.log('当前状态：', value)
}
</script>
```

## 自定义颜色

`activeColor` / `inactiveColor` 传入具体色值覆盖主题色；留空则跟随主题。

```vue
<switch v-model="checked" active-color="#52c41a" inactive-color="#d9d9d9" />
```

## 禁用

```vue
<switch v-model="checked" label="不可操作" disabled />
```

## 说明

- 组件为纯展示控件，不套容器；点击整行（含标签）均可切换。
- `change` 事件在每次切换后抛出新的布尔值。
- 开关轨道默认使用主题变量 `--color-primary`（开启）与 `--text-tertiary`（关闭）。
