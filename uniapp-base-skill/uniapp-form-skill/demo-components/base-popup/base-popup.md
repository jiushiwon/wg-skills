# base-popup 弹窗组件

> 通用弹窗/抽屉组件，由 `base-card` 设计思想封装（与 `base-card` 同源：参数化外壳组件，包裹业务内容）。内部仍然是卡片，但外层可以设置方向、圆角、高度，固定携带遮罩层，支持滑入滑出动画。

> 作为根组件（空组件），内部通过 slot 自由填充内容，可与 base-card、base-select 等组合使用。

## HTML 参考图

4 种弹出方向在一个 HTML 文件中演示，通过按钮切换：

| 方向 | 场景 | HTML |
|------|------|------|
| 底部弹出 | 操作菜单、分享、选择器 | [popup-demo.html](demo-components/base-popup/html/popup-demo.html) |
| 顶部弹出 | 系统通知、公告 | [popup-demo.html](demo-components/base-popup/html/popup-demo.html) |
| 左侧弹出 | 侧边抽屉、侧滑菜单 | [popup-demo.html](demo-components/base-popup/html/popup-demo.html) |
| 右侧弹出 | 筛选面板、侧边设置 | [popup-demo.html](demo-components/base-popup/html/popup-demo.html) |

## 为什么需要这个组件？

弹窗是 App 高频交互场景，但实际开发中：
- 底部弹窗、侧边抽屉、顶部通知各自实现，样式不统一
- 遮罩层、动画、圆角、安全区域适配重复开发
- 关闭逻辑（点击遮罩/点击关闭按钮）各自处理
- 主题切换时弹窗样式难以同步

`base-popup` 把所有弹窗的共性收敛成一个组件，页面只关心内容填充。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | boolean | `false` | 是否显示 |
| `direction` | string | `'bottom'` | 弹出方向：`top` / `bottom` / `left` / `right` |
| `radius` | string | `'16px'` | 弹窗圆角 |
| `height` | string | `'auto'` | 高度（top/bottom 生效） |
| `width` | string | `'280px'` | 宽度（left/right 生效） |
| `mask` | boolean | `true` | 是否显示遮罩层 |
| `maskClosable` | boolean | `true` | 点击遮罩是否关闭 |
| `duration` | number | `300` | 动画时长（ms） |
| `safeArea` | boolean | `true` | 是否适配安全区域 |

## Events

| Event | 说明 |
|-------|------|
| `update:show` | 显示状态变化 |
| `close` | 关闭时触发 |

## 代码

```vue
<template>
  <!-- 遮罩层 -->
  <view
    v-if="show && mask"
    class="popup-mask"
    :class="{ show }"
    :style="{ opacity: show ? 1 : 0 }"
    @click="onMaskClick"
  />

  <!-- 弹窗主体 -->
  <view
    v-if="show"
    class="popup"
    :class="[`popup-${direction}`, { show }]"
    :style="popupStyle"
  >
    <view class="popup-content">
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  show?: boolean
  direction?: 'top' | 'bottom' | 'left' | 'right'
  radius?: string
  height?: string
  width?: string
  mask?: boolean
  maskClosable?: boolean
  duration?: number
  safeArea?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  direction: 'bottom',
  radius: '16px',
  height: 'auto',
  width: '280px',
  mask: true,
  maskClosable: true,
  duration: 300,
  safeArea: true,
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
}>()

const popupStyle = computed(() => {
  const style: Record<string, string> = {
    transitionDuration: `${props.duration}ms`,
    borderRadius: props.radius,
  }

  if (props.direction === 'top' || props.direction === 'bottom') {
    style.height = props.height === 'auto' ? 'auto' : props.height
    if (props.safeArea) {
      style.paddingBottom = 'env(safe-area-inset-bottom)'
    }
  } else {
    style.width = props.width
  }

  return style
})

function onMaskClick() {
  if (props.maskClosable) {
    emit('update:show', false)
    emit('close')
  }
}
</script>

<style scoped>
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
}
.popup-mask.show {
  opacity: 1;
  visibility: visible;
}

.popup {
  position: fixed;
  z-index: 1000;
  background: var(--color-bg-surface, #fff);
  transition: transform 0.3s ease;
}

.popup-top {
  top: 0;
  left: 0;
  right: 0;
  transform: translateY(-100%);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
.popup-top.show { transform: translateY(0); }

.popup-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(100%);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
.popup-bottom.show { transform: translateY(0); }

.popup-left {
  top: 0;
  left: 0;
  bottom: 0;
  transform: translateX(-100%);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}
.popup-left.show { transform: translateX(0); }

.popup-right {
  top: 0;
  right: 0;
  bottom: 0;
  transform: translateX(100%);
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
}
.popup-right.show { transform: translateX(0); }

.popup-content {
  width: 100%;
  height: 100%;
}
</style>
```

## 使用示例

### 底部弹窗

```vue
<base-popup v-model:show="show" direction="bottom" radius="16px">
  <view class="content">
    <text>这里是弹窗内容</text>
  </view>
</base-popup>
```

### 左侧抽屉

```vue
<base-popup v-model:show="show" direction="left" width="280px">
  <view class="menu">
    <view class="menu-item">个人资料</view>
    <view class="menu-item">设置</view>
  </view>
</base-popup>
```

### 右侧筛选

```vue
<base-popup v-model:show="show" direction="right" width="300px">
  <view class="filter">
    <!-- 筛选内容 -->
  </view>
</base-popup>
```

### 顶部通知

```vue
<base-popup v-model:show="show" direction="top" height="auto">
  <view class="notice">
    <text>您有新的消息</text>
  </view>
</base-popup>
```

## 组合使用

`base-popup` 作为空组件，可与 base-select、base-switch 等组合：

```vue
<!-- 组合 base-select 的弹出面板模式 -->
<base-popup v-model:show="show" direction="bottom">
  <base-select :options="options" @change="onChange" />
</base-popup>

<!-- 组合 base-switch 的设置面板 -->
<base-popup v-model:show="show" direction="right" width="320px">
  <view class="settings">
    <base-switch v-model="wifi" label="WiFi" />
    <base-switch v-model="bluetooth" label="蓝牙" />
  </view>
</base-popup>
```

## 形态

通过 `direction` 切换弹出方向：

| 方向 | 场景 |
|------|------|
| `bottom` | 底部操作菜单、分享、选择器 |
| `top` | 系统通知、公告 |
| `left` | 侧边抽屉、侧滑菜单 |
| `right` | 筛选面板、侧边设置 |

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-bg-surface)` | 弹窗背景 |
| `var(--radius-lg)` | 弹窗圆角默认值 |
| `var(--spacing-lg)` | 弹窗内边距 |

## 触发词

```markdown
/uniapp-base-skill 做一个底部弹窗
/uniapp-base-skill 做一个顶部弹窗
/uniapp-base-skill 做一个左侧抽屉
/uniapp-base-skill 做一个右侧筛选面板
/uniapp-base-skill 做一个弹窗
```

## 演示

[查看 HTML 演示](demo-components/base-popup/html/popup-demo.html)
