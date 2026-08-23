# base-switch 开关

> 通用开关组件，由 `base-card` 设计思想封装（与 `base-card` 同源：参数化外壳组件，包裹开关交互逻辑）。支持胶囊、方正、迷你、图标、卡片、iOS等多种形态。

> 所有需要开关切换的场景（设置、个人资料、配置）都应使用本组件，避免样式碎片化。

## HTML 参考图

6 种风格独立成文件：

| 风格 | 场景 | HTML |
|------|------|------|
| 标准胶囊 | 设置项、通知开关 | [switch-standard.html](html/switch-standard.html) |
| 方正风格 | 简洁设置、工具类App | [switch-square.html](html/switch-square.html) |
| 迷你圆点 | 紧凑列表、小程序 | [switch-mini.html](html/switch-mini.html) |
| 图标按钮 | 功能开关、状态控制 | [switch-icon.html](html/switch-icon.html) |
| 卡片式 | 高级设置、带状态文字 | [switch-card.html](html/switch-card.html) |
| iOS风格 | 系统风格、设置页 | [switch-ios.html](html/switch-ios.html) |

## 为什么需要这个组件？

开关是 App 高频交互场景，但实际开发中：
- 胶囊开关、方正开关、迷你开关各自实现，样式不统一
- 选中态、禁用态、描述文字各自处理
- 图标开关、卡片开关重复开发
- 主题切换时开关样式难以同步

`base-switch` 把所有开关的共性收敛成一个组件，页面只关心绑定值。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` / `v-model` | boolean | `false` | 开关状态 |
| `disabled` | boolean | `false` | 是否禁用 |
| `size` | string | `'normal'` | 尺寸：`normal` / `large` / `small` |
| `color` | string | `'success'` | 开启颜色 |
| `label` | string | - | 左侧标签 |
| `desc` | string | - | 描述文字 |

## Events

| Event | 说明 |
|-------|------|
| `update:modelValue` | 状态变化 |
| `change` | 切换时触发 |

## 代码

```vue
<template>
  <view class="base-switch" :class="[`switch-${size}`, { checked: modelValue, disabled }]">
    <view v-if="label" class="switch-label-wrap">
      <text class="switch-label">{{ label }}</text>
      <text v-if="desc" class="switch-desc">{{ desc }}</text>
    </view>
    <view class="switch-track" @click="onToggle">
      <view class="switch-thumb"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean
  disabled?: boolean
  size?: 'normal' | 'large' | 'small'
  color?: string
  label?: string
  desc?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  size: 'normal',
  color: 'success',
  label: '',
  desc: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

function onToggle() {
  if (props.disabled) return
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.base-switch { display: flex; align-items: center; justify-content: space-between; }
.switch-track {
  width: 51px;
  height: 31px;
  background: #e8e8e8;
  border-radius: 16px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}
.switch.checked .switch-track { background: var(--color-success); }
.switch-thumb {
  position: absolute;
  width: 27px;
  height: 27px;
  background: #fff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}
.switch.checked .switch-thumb { transform: translateX(20px); }
.switch.disabled { opacity: 0.5; cursor: not-allowed; }
/* 更多样式... */
</style>
```

## 使用示例

### 标准胶囊开关

```vue
<base-switch
  v-model="notification"
  label="接收推送通知"
  desc="开启后接收最新消息推送"
/>
```

### 方正风格

```vue
<base-switch
  v-model="darkMode"
  label="深色模式"
  size="normal"
/>
```

### 迷你开关

```vue
<base-switch
  v-model="autoPlay"
  size="small"
/>
```

### 卡片式开关

```vue
<base-switch
  v-model="wifi"
  label="WiFi"
  desc="已连接"
  type="card"
/>
```

## 形态

通过 `size` 和 `type` 切换开关形态：

| 类型 | 场景 |
|------|------|
| `normal` | 标准胶囊，通用场景 |
| `large` | 大尺寸，强调状态 |
| `small` | 迷你尺寸，紧凑列表 |

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-success)` | 开启状态颜色 |
| `var(--color-surface)` | 关闭状态背景 |
| `var(--color-text)` | 标签文字 |
| `var(--color-text-tertiary)` | 描述文字 |

## 触发词

```markdown
/uniapp-base-skill 做一个开关
/uniapp-base-skill 做一个胶囊开关
/uniapp-base-skill 做一个方正开关
/uniapp-base-skill 做一个迷你开关
/uniapp-base-skill 做一个图标开关
/uniapp-base-skill 做一个卡片开关
/uniapp-base-skill 做一个iOS风格开关
```

## 演示

[查看 HTML 演示](html/switch-standard.html)
