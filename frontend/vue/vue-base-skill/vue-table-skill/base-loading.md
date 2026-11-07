# base-loading 加载状态组件

> 通用加载状态组件，支持全屏加载、容器加载、按钮加载、文本加载、点状/条状/圆环/脉冲动画。
> **必须嵌入 base-card** 使用（全屏加载除外）。
> **零 HTML5 标签**：禁止使用 `<button>` `<input>` 等，全部用 `<div>` `<span>` + CSS3 实现。

## 为什么需要 base-loading？

实际开发中加载状态痛点：
- ❌ 全屏加载 / 容器加载 / 按钮加载各自实现
- ❌ 加载动画不统一（spinner / dots / bar / ring）
- ❌ 遮罩层样式不一致
- ❌ 颜色和尺寸难以统一

**base-loading 把所有加载场景收敛成一个组件**：
- ✅ 5 种加载类型（fullscreen / container / section / inline / overlay）
- ✅ 7 种动画模式（dots / bar / ring / pulse / wave / cube / ripple）
- ✅ 5 种 size + 5 种 theme
- ✅ 主题自动继承

---

## 形态速览

### 加载类型（5 种）

| 类型 | 描述 | 适用场景 |
|------|------|----------|
| `container` | 容器加载（默认） | 包裹组件 |
| `fullscreen` | 全屏加载 | 整页加载 |
| `section` | 区域加载 | 局部区域 |
| `inline` | 行内加载 | 文本旁 |
| `overlay` | 覆盖加载 | 浮层 |

### 动画模式（7 种）

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| `dots` | 三点弹跳（默认） | 通用 |
| `bar` | 条状横扫 | 进度条 |
| `ring` | 圆环旋转 | 加载等待 |
| `pulse` | 脉冲扩散 | 强调 |
| `wave` | 波浪起伏 | 优雅 |
| `cube` | 方块翻转 | 时尚 |
| `ripple` | 涟漪扩散 | 提示 |

---

## 效果展示

### 1. 基础加载（容器）

```vue
<base-card title="数据加载中">
  <base-loading />
</base-card>
```

### 2. 容器加载（包裹内容）

```vue
<base-card title="用户列表">
  <base-loading :loading="loading" text="加载用户数据...">
    <base-table :data="users" :columns="columns" />
  </base-loading>
</base-card>
```

### 3. 全屏加载

```vue
<base-loading fullscreen :loading="loading" text="加载中..." />
```

### 4. 按钮加载（依赖 base-button）

```vue
<base-button :loading="submitting" @click="onSubmit">提交</base-button>
```

### 5. 不同动画模式

```vue
<base-loading type="inline" mode="dots" />
<base-loading type="inline" mode="bar" />
<base-loading type="inline" mode="ring" />
<base-loading type="inline" mode="pulse" />
<base-loading type="inline" mode="wave" />
<base-loading type="inline" mode="cube" />
<base-loading type="inline" mode="ripple" />
```

### 6. 不同尺寸

```vue
<base-loading type="inline" size="xs" />
<base-loading type="inline" size="sm" />
<base-loading type="inline" size="md" />
<base-loading type="inline" size="lg" />
<base-loading type="inline" size="xl" />
```

### 7. 不同主题

```vue
<base-loading type="inline" theme="primary" />
<base-loading type="inline" theme="success" />
<base-loading type="inline" theme="warning" />
<base-loading type="inline" theme="danger" />
<base-loading type="inline" theme="info" />
```

### 8. 自定义加载文案

```vue
<base-loading text="数据加载中，请稍候..." />
```

### 9. 自定义加载图标

```vue
<base-loading>
  <template #icon>
    <div class="custom-spinner"></div>
  </template>
</base-loading>
```

### 10. 自定义文案

```vue
<base-loading>
  <template #text>
    <div class="custom-text">自定义加载文案</div>
  </template>
</base-loading>
```

### 11. 区域加载（指定容器）

```vue
<div class="my-container">
  <base-loading type="section" :loading="loading" />
  <div class="content">内容</div>
</div>
```

### 12. 覆盖层加载

```vue
<base-loading type="overlay" :loading="loading" />
```

---

## 使用示例（必须在 base-card 内）

```vue
<template>
  <base-card title="用户管理">
    <base-loading :loading="loading" text="加载用户数据..." mode="dots">
      <base-table :data="users" :columns="columns" />
    </base-loading>
  </base-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(true)
const users = ref([])

onMounted(async () => {
  try {
    users.value = await fetchUsers()
  } finally {
    loading.value = false
  }
})
</script>
```

---

## 容器原则

> **非全屏加载必须嵌入 `<base-card>`。**

```vue
<!-- ✅ 正确：容器加载 -->
<base-card title="用户列表">
  <base-loading :loading="loading">
    <base-table :data="users" :columns="columns" />
  </base-loading>
</base-card>

<!-- ✅ 正确：全屏加载 -->
<base-loading fullscreen :loading="loading" />

<!-- ❌ 错误：非全屏加载游离 -->
<base-loading :loading="loading">
  <base-table :data="users" :columns="columns" />
</base-loading>
```

---

## 红线

- ❌ 禁止裸用 `<base-loading>`（非全屏必须 `<base-card>` 包裹）
- ❌ 禁止裸色值 / 裸 px（必须 `var(--*)`）
- ❌ 禁止使用 `<button>` `<input>` 等 HTML5 标签（必须 `<div>` `<span>` + CSS3）
- ❌ 禁止混入 Element Plus / 任何第三方加载组件

---

## Props

```typescript
interface BaseLoadingProps {
  // 核心
  loading?: boolean                                                         // 是否加载中，默认 true
  type?: 'container' | 'fullscreen' | 'section' | 'inline' | 'overlay'     // 加载类型

  // 动画
  mode?: 'dots' | 'bar' | 'ring' | 'pulse' | 'wave' | 'cube' | 'ripple'    // 动画模式

  // 文案
  text?: string                                                             // 加载文案
  textPosition?: 'top' | 'bottom' | 'left' | 'right'                       // 文案位置

  // 样式
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'                                 // 尺寸
  theme?: 'primary' | 'success' | 'warning' | 'danger' | 'info'           // 主题色
  customColor?: string                                                      // 自定义颜色

  // 遮罩
  mask?: boolean                                                            // 显示遮罩
  maskColor?: string                                                        // 遮罩颜色
  maskBlur?: boolean                                                        // 遮罩模糊
  lockScroll?: boolean                                                      // 锁定滚动（全屏时）

  // 行为
  delay?: number                                                            // 延迟显示（ms），避免闪烁
  minDuration?: number                                                      // 最小显示时长（ms）

  // 全屏
  fullscreen?: boolean                                                      // 全屏加载（兼容旧 API）
  zIndex?: number                                                           // 全屏层级

  // 容器
  background?: string                                                       // 容器背景色
  vertical?: boolean                                                        // 垂直布局（默认 true）
  center?: boolean                                                          // 内容居中（默认 true）
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `loading` | `boolean` | `true` | 是否加载中 |
| `type` | `'container' \| 'fullscreen' \| 'section' \| 'inline' \| 'overlay'` | `'container'` | 加载类型 |
| `mode` | `'dots' \| 'bar' \| 'ring' \| 'pulse' \| 'wave' \| 'cube' \| 'ripple'` | `'dots'` | 动画模式 |
| `text` | `string` | `undefined` | 加载文案 |
| `textPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | 文案位置 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 尺寸 |
| `theme` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'` | 主题色 |
| `customColor` | `string` | `undefined` | 自定义颜色 |
| `mask` | `boolean` | `true` | 显示遮罩（container 类型） |
| `maskColor` | `string` | `undefined` | 遮罩颜色 |
| `maskBlur` | `boolean` | `false` | 遮罩模糊 |
| `lockScroll` | `boolean` | `false` | 锁定滚动 |
| `delay` | `number` | `0` | 延迟显示（ms） |
| `minDuration` | `number` | `0` | 最小显示时长（ms） |
| `fullscreen` | `boolean` | `false` | 全屏加载（兼容旧 API） |
| `zIndex` | `number` | `9999` | 全屏层级 |
| `background` | `string` | `undefined` | 容器背景色 |
| `vertical` | `boolean` | `true` | 垂直布局 |
| `center` | `boolean` | `true` | 内容居中 |

---

## Slots

| Slot | 说明 |
|------|------|
| `default` | 被包裹的内容 |
| `icon` | 自定义加载图标 |
| `text` | 自定义加载文案 |

---

## 动画模式详解

### 1. dots（三点弹跳）

三个圆点依次弹跳。

### 2. bar（条状横扫）

从左到右横扫的进度条。

### 3. ring（圆环旋转）

传统圆形旋转加载。

### 4. pulse（脉冲扩散）

中心向外脉冲扩散。

### 5. wave（波浪起伏）

上下起伏的条状。

### 6. cube（方块翻转）

3D 方块翻转动画。

### 7. ripple（涟漪扩散）

水滴涟漪扩散。

---

## 实现要点

```vue
<template>
  <div :class="[
    'base-loading',
    `base-loading--type-${type}`,
    `base-loading--mode-${mode}`,
    `base-loading--size-${size}`,
    `base-loading--theme-${theme}`,
    { 'base-loading--fullscreen': fullscreen || type === 'fullscreen' },
    { 'base-loading--inline': type === 'inline' },
    { 'base-loading--section': type === 'section' },
    { 'base-loading--overlay': type === 'overlay' },
    { 'base-loading--mask': mask && type === 'container' },
    { 'base-loading--mask-blur': maskBlur },
    { 'base-loading--vertical': vertical },
    { 'base-loading--center': center },
    { 'base-loading--no-text': !showText },
  ]" :style="containerStyle">
    <!-- 加载层 -->
    <transition name="base-loading-fade">
      <div v-if="shouldShow" class="base-loading__layer">
        <!-- 动画 -->
        <slot name="icon">
          <div :class="['base-loading__spinner', `base-loading__spinner--${mode}`]" :style="spinnerStyle">
            <!-- dots -->
            <template v-if="mode === 'dots'">
              <span v-for="i in 3" :key="i" :class="`base-loading__dot base-loading__dot--${i}`" />
            </template>

            <!-- bar -->
            <template v-else-if="mode === 'bar'">
              <span class="base-loading__bar" />
            </template>

            <!-- ring -->
            <template v-else-if="mode === 'ring'">
              <span class="base-loading__ring" />
            </template>

            <!-- pulse -->
            <template v-else-if="mode === 'pulse'">
              <span class="base-loading__pulse" />
              <span class="base-loading__pulse" />
              <span class="base-loading__pulse" />
            </template>

            <!-- wave -->
            <template v-else-if="mode === 'wave'">
              <span v-for="i in 5" :key="i" :class="`base-loading__wave base-loading__wave--${i}`" />
            </template>

            <!-- cube -->
            <template v-else-if="mode === 'cube'">
              <span class="base-loading__cube">
                <span class="base-loading__cube-face base-loading__cube-face--front" />
                <span class="base-loading__cube-face base-loading__cube-face--back" />
                <span class="base-loading__cube-face base-loading__cube-face--right" />
                <span class="base-loading__cube-face base-loading__cube-face--left" />
                <span class="base-loading__cube-face base-loading__cube-face--top" />
                <span class="base-loading__cube-face base-loading__cube-face--bottom" />
              </span>
            </template>

            <!-- ripple -->
            <template v-else-if="mode === 'ripple'">
              <span class="base-loading__ripple" />
              <span class="base-loading__ripple" />
              <span class="base-loading__ripple" />
            </template>
          </div>
        </slot>

        <!-- 文案 -->
        <slot name="text">
          <div v-if="text" :class="['base-loading__text', `base-loading__text--${textPosition}`]">
            {{ text }}
          </div>
        </slot>
      </div>
    </transition>

    <!-- 被包裹的内容 -->
    <div v-if="type === 'container' || type === 'section'" :class="['base-loading__content', { 'base-loading__content--hidden': loading }]">
      <slot />
    </div>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<BaseLoadingProps>(), {
  loading: true,
  type: 'container',
  mode: 'dots',
  textPosition: 'bottom',
  size: 'md',
  theme: 'primary',
  mask: true,
  maskBlur: false,
  lockScroll: false,
  delay: 0,
  minDuration: 0,
  fullscreen: false,
  zIndex: 9999,
  vertical: true,
  center: true,
})

const showLoading = ref(props.loading)
const startTime = ref(0)
let delayTimer: ReturnType<typeof setTimeout> | null = null
let durationTimer: ReturnType<typeof setTimeout> | null = null

// 计算是否应该显示加载（考虑 delay 和 minDuration）
const shouldShow = computed(() => showLoading.value)

const showText = computed(() => !!props.text || !!slots.text)

// 自定义颜色样式
const spinnerStyle = computed(() => {
  if (!props.customColor) return {}
  return {
    '--loading-custom-color': props.customColor,
  }
})

const containerStyle = computed(() => {
  const style: Record<string, string | number> = {}
  if (props.zIndex) {
    style.zIndex = props.zIndex
  }
  if (props.background) {
    style.background = props.background
  }
  return style
})

watch(
  () => props.loading,
  (newVal, oldVal) => {
    if (newVal) {
      // 开始显示
      startTime.value = Date.now()
      if (delayTimer) clearTimeout(delayTimer)
      if (durationTimer) clearTimeout(durationTimer)

      if (props.delay > 0) {
        showLoading.value = false
        delayTimer = setTimeout(() => {
          showLoading.value = true
        }, props.delay)
      } else {
        showLoading.value = true
      }

      // 锁定滚动
      if ((props.fullscreen || props.type === 'fullscreen') && props.lockScroll) {
        document.body.style.overflow = 'hidden'
      }
    } else {
      // 隐藏
      if (delayTimer) {
        clearTimeout(delayTimer)
        delayTimer = null
      }

      const elapsed = Date.now() - startTime.value
      if (props.minDuration > 0 && elapsed < props.minDuration) {
        durationTimer = setTimeout(() => {
          showLoading.value = false
        }, props.minDuration - elapsed)
      } else {
        showLoading.value = false
      }

      // 解锁滚动
      if ((props.fullscreen || props.type === 'fullscreen') && props.lockScroll) {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (delayTimer) clearTimeout(delayTimer)
  if (durationTimer) clearTimeout(durationTimer)
  if (props.lockScroll && (props.fullscreen || props.type === 'fullscreen')) {
    document.body.style.overflow = ''
  }
})

import { useSlots } from 'vue'
const slots = useSlots()
</script>

<style scoped>
.base-loading {
  position: relative;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-loading--inline {
  display: inline-flex;
  min-height: auto;
}

.base-loading--fullscreen {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
}

.base-loading--section {
  min-height: 120px;
}

.base-loading--overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
}

.base-loading--center {
  align-items: center;
  justify-content: center;
}

/* 加载层 */
.base-loading__layer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.base-loading--vertical .base-loading__layer {
  flex-direction: column;
}

.base-loading__layer--horizontal,
.base-loading:not(.base-loading--vertical) .base-loading__layer {
  flex-direction: row;
}

/* 文案位置 */
.base-loading__text--top {
  order: -1;
}

.base-loading__text--bottom {
  order: 1;
}

.base-loading__text--left {
  order: -1;
}

.base-loading__text--right {
  order: 1;
}

.base-loading__text {
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
}

/* 尺寸 */
.base-loading--size-xs .base-loading__spinner { font-size: 10px; }
.base-loading--size-sm .base-loading__spinner { font-size: 14px; }
.base-loading--size-md .base-loading__spinner { font-size: 18px; }
.base-loading--size-lg .base-loading__spinner { font-size: 24px; }
.base-loading--size-xl .base-loading__spinner { font-size: 32px; }

/* 自定义颜色 */
.base-loading__spinner[style*="--loading-custom-color"] :is(.base-loading__dot, .base-loading__bar, .base-loading__ring, .base-loading__pulse, .base-loading__wave, .base-loading__cube, .base-loading__ripple) {
  background: var(--loading-custom-color);
  border-color: var(--loading-custom-color);
}

/* ============== dots ============== */
.base-loading__spinner--dots {
  display: flex;
  gap: var(--space-2);
}

.base-loading__dot {
  display: inline-block;
  width: 1em;
  height: 1em;
  border-radius: var(--radius-full);
  animation: base-loading-bounce 1.4s infinite ease-in-out both;
}

.base-loading__dot--1 { animation-delay: -0.32s; }
.base-loading__dot--2 { animation-delay: -0.16s; }
.base-loading__dot--3 { animation-delay: 0s; }

@keyframes base-loading-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* ============== bar ============== */
.base-loading__spinner--bar {
  position: relative;
  width: 4em;
  height: 0.3em;
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.base-loading__bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 40%;
  border-radius: var(--radius-full);
  animation: base-loading-bar 1.4s infinite ease-in-out;
}

@keyframes base-loading-bar {
  0% { left: -40%; }
  100% { left: 100%; }
}

/* ============== ring ============== */
.base-loading__spinner--ring {
  display: inline-block;
  width: 1em;
  height: 1em;
}

.base-loading__ring {
  display: inline-block;
  width: 100%;
  height: 100%;
  border: 0.15em solid var(--color-primary-light);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: base-loading-rotate 0.8s linear infinite;
}

@keyframes base-loading-rotate {
  to { transform: rotate(360deg); }
}

/* ============== pulse ============== */
.base-loading__spinner--pulse {
  position: relative;
  width: 1em;
  height: 1em;
}

.base-loading__pulse {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-full);
  opacity: 0;
  animation: base-loading-pulse 1.8s infinite;
}

.base-loading__pulse:nth-child(2) {
  animation-delay: 0.6s;
}

.base-loading__pulse:nth-child(3) {
  animation-delay: 1.2s;
}

@keyframes base-loading-pulse {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}

/* ============== wave ============== */
.base-loading__spinner--wave {
  display: flex;
  align-items: center;
  gap: 0.1em;
  height: 1em;
}

.base-loading__wave {
  display: inline-block;
  width: 0.15em;
  height: 100%;
  border-radius: var(--radius-sm);
  animation: base-loading-wave 1.2s infinite ease-in-out;
}

.base-loading__wave--1 { animation-delay: -0.4s; }
.base-loading__wave--2 { animation-delay: -0.3s; }
.base-loading__wave--3 { animation-delay: -0.2s; }
.base-loading__wave--4 { animation-delay: -0.1s; }
.base-loading__wave--5 { animation-delay: 0s; }

@keyframes base-loading-wave {
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
}

/* ============== cube ============== */
.base-loading__spinner--cube {
  display: inline-block;
  width: 1em;
  height: 1em;
  perspective: 200px;
}

.base-loading__cube {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: base-loading-cube-rotate 2s infinite ease-in-out;
}

.base-loading__cube-face {
  position: absolute;
  inset: 0;
  border: 0.1em solid var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.base-loading__cube-face--front  { transform: translateZ(0.5em); }
.base-loading__cube-face--back   { transform: rotateY(180deg) translateZ(0.5em); }
.base-loading__cube-face--right  { transform: rotateY(90deg) translateZ(0.5em); }
.base-loading__cube-face--left   { transform: rotateY(-90deg) translateZ(0.5em); }
.base-loading__cube-face--top    { transform: rotateX(90deg) translateZ(0.5em); }
.base-loading__cube-face--bottom { transform: rotateX(-90deg) translateZ(0.5em); }

@keyframes base-loading-cube-rotate {
  0% { transform: rotateY(0deg) rotateX(0deg); }
  50% { transform: rotateY(180deg) rotateX(180deg); }
  100% { transform: rotateY(360deg) rotateX(360deg); }
}

/* ============== ripple ============== */
.base-loading__spinner--ripple {
  position: relative;
  width: 1em;
  height: 1em;
}

.base-loading__ripple {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-full);
  border: 0.1em solid var(--color-primary);
  opacity: 1;
  animation: base-loading-ripple 1.5s infinite cubic-bezier(0, 0.2, 0.8, 1);
}

.base-loading__ripple:nth-child(2) {
  animation-delay: 0.5s;
}

.base-loading__ripple:nth-child(3) {
  animation-delay: 1s;
}

@keyframes base-loading-ripple {
  0% { transform: scale(0.3); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* 主题色 */
.base-loading--theme-primary :is(.base-loading__dot, .base-loading__bar, .base-loading__ring, .base-loading__pulse, .base-loading__wave, .base-loading__cube-face, .base-loading__ripple) {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.base-loading__spinner--bar.base-loading--theme-primary { background: var(--color-primary-light); }
.base-loading__spinner--ring.base-loading--theme-primary .base-loading__ring { border-color: var(--color-primary-light); border-top-color: var(--color-primary); }
.base-loading__spinner--cube.base-loading--theme-primary .base-loading__cube-face { background: color-mix(in srgb, var(--color-primary) 30%, transparent); border-color: var(--color-primary); }

.base-loading--theme-success :is(.base-loading__dot, .base-loading__bar, .base-loading__pulse, .base-loading__wave, .base-loading__cube-face, .base-loading__ripple) {
  background: var(--color-success);
  border-color: var(--color-success);
}

.base-loading--theme-warning :is(.base-loading__dot, .base-loading__bar, .base-loading__pulse, .base-loading__wave, .base-loading__cube-face, .base-loading__ripple) {
  background: var(--color-warning);
  border-color: var(--color-warning);
}

.base-loading--theme-danger :is(.base-loading__dot, .base-loading__bar, .base-loading__pulse, .base-loading__wave, .base-loading__cube-face, .base-loading__ripple) {
  background: var(--color-danger);
  border-color: var(--color-danger);
}

.base-loading--theme-info :is(.base-loading__dot, .base-loading__bar, .base-loading__pulse, .base-loading__wave, .base-loading__cube-face, .base-loading__ripple) {
  background: var(--color-info);
  border-color: var(--color-info);
}

/* 内容 */
.base-loading__content {
  transition: opacity 0.3s;
}

.base-loading__content--hidden {
  opacity: 0;
  pointer-events: none;
}

/* 过渡动画 */
.base-loading-fade-enter-active,
.base-loading-fade-leave-active {
  transition: opacity 0.3s;
}

.base-loading-fade-enter-from,
.base-loading-fade-leave-to {
  opacity: 0;
}

/* 遮罩 */
.base-loading--mask .base-loading__layer {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-bg) 85%, transparent);
  z-index: 10;
}

.base-loading--mask-blur .base-loading__layer {
  backdrop-filter: blur(4px);
}
</style>
```

---

## 相关技能

- [vue-base-skill](../SKILL.md) — 父技能
- [vue-button-skill](../vue-button-skill/) — base-button（按钮加载）
- [vue-card-skill](../vue-card-skill/) — base-card（容器）
- [vue-theme-skill](../../vue-theme-skill/) — Token
- [vue-table-skill](./) — base-table 表格加载