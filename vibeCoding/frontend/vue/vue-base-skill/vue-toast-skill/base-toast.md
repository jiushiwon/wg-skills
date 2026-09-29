# base-toast

> 轻提示组件。用于操作反馈，自动消失。
>
> 全局挂载，通过 `useToast()` 调用。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'success' \| 'warning' \| 'danger' \| 'info'` | `'success'` | 提示类型 |
| `message` | `string` | `''` | 提示文字 |
| `duration` | `number` | `3000` | 自动关闭时间（ms），0 = 不自动关闭 |
| `position` | `'top' \| 'center' \| 'bottom'` | `'top'` | 出现位置 |
| `closable` | `boolean` | `false` | 是否显示关闭按钮 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `close` | - | 关闭时触发 |

## Composable: useToast

```typescript
interface ToastAPI {
  success(message: string, options?: Partial<ToastOptions>): void;
  warning(message: string, options?: Partial<ToastOptions>): void;
  error(message: string, options?: Partial<ToastOptions>): void;
  info(message: string, options?: Partial<ToastOptions>): void;
}

interface ToastOptions {
  duration: number;
  position: 'top' | 'center' | 'bottom';
  closable: boolean;
}
```

## 实现要点

### 渲染结构

```vue
<template>
  <Teleport to="body">
    <div class="base-toast-container" :class="`base-toast-container--${position}`">
      <TransitionGroup name="base-toast">
        <div
          v-for="item in toasts"
          :key="item.id"
          class="base-toast"
          role="alert"
        >
          <!-- 图标区 -->
          <span class="base-toast__icon" :class="`base-toast__icon--${item.type}`">
            <span v-if="item.type === 'success'" class="base-toast__icon-shape">✓</span>
            <span v-else-if="item.type === 'danger'" class="base-toast__icon-shape">✕</span>
            <span v-else-if="item.type === 'warning'" class="base-toast__icon-shape">!</span>
            <span v-else class="base-toast__icon-shape">i</span>
          </span>
          <!-- 文字 -->
          <span class="base-toast__message">{{ item.message }}</span>
          <!-- 关闭按钮 -->
          <span
            v-if="item.closable"
            class="base-toast__close"
            role="button"
            tabindex="0"
            @click="remove(item.id)"
          >✕</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
```

### 核心样式

```css
/* 容器 */
.base-toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  pointer-events: none;
}
.base-toast-container--top    { top: var(--space-6); left: 50%; transform: translateX(-50%); }
.base-toast-container--center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
.base-toast-container--bottom { bottom: var(--space-6); left: 50%; transform: translateX(-50%); }

/* 单条 Toast */
.base-toast {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  font-size: var(--font-sm);
  pointer-events: auto;
}

/* 图标圆底 */
.base-toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  color: white;
  font-size: var(--font-xs);
  font-weight: var(--weight-bold);
  flex-shrink: 0;
}
.base-toast__icon--success { background: var(--color-success); }
.base-toast__icon--danger  { background: var(--color-danger); }
.base-toast__icon--warning { background: var(--color-warning); }
.base-toast__icon--info    { background: var(--color-primary); }

.base-toast__message { color: var(--color-text-primary); }
.base-toast__close {
  margin-left: var(--space-1);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-xs);
}
.base-toast__close:hover { color: var(--color-text-primary); }

/* 入场/退场动画 */
.base-toast-enter-active { animation: toast-in 0.3s ease-out; }
.base-toast-leave-active { animation: toast-out 0.2s ease-in; }

@keyframes toast-in {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes toast-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-16px); }
}
```

## 约束

- **零 HTML5 标签**：按钮用 `<span role="button">`
- **全局单例**：通过 `createApp` + `Teleport` 挂载到 `body`
- **队列管理**：多条 Toast 垂直排列，最多同时显示 5 条
- **禁止硬编码颜色值**
- **禁止左侧彩色边框**（AI 味太重），用图标圆底传达类型
