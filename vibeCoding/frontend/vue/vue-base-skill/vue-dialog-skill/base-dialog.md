# base-dialog / base-confirm

> 对话框组件。两种形态：通用弹窗（base-dialog）和确认对话框（base-confirm）。

## base-dialog

### 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `false` | 是否显示（v-model） |
| `title` | `string` | `''` | 标题 |
| `width` | `string` | `'500px'` | 弹窗宽度 |
| `closable` | `boolean` | `true` | 是否显示关闭按钮 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭 |
| `footer` | `boolean` | `true` | 是否显示底部 |
| `destroyOnClose` | `boolean` | `false` | 关闭时销毁内容 |

### 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:visible` | `boolean` | 显示状态变化 |
| `close` | - | 关闭时触发 |
| `confirm` | - | 点击确认 |
| `cancel` | - | 点击取消 |

### Slots

| 插槽 | 说明 |
|------|------|
| `default` | 弹窗内容 |
| `header` | 自定义头部 |
| `footer` | 自定义底部 |

### 渲染结构

```vue
<template>
  <Teleport to="body">
    <Transition name="base-dialog">
      <div v-if="visible" class="base-dialog__overlay" @click="handleMaskClick">
        <div class="base-dialog" :style="{ width }" @click.stop>
          <!-- 头部 -->
          <div class="base-dialog__header">
            <slot name="header">
              <span class="base-dialog__title">{{ title }}</span>
            </slot>
            <span
              v-if="closable"
              class="base-dialog__close"
              role="button"
              tabindex="0"
              @click="handleClose"
            >✕</span>
          </div>
          <!-- 内容 -->
          <div class="base-dialog__body">
            <slot />
          </div>
          <!-- 底部 -->
          <div v-if="footer" class="base-dialog__footer">
            <slot name="footer">
              <span class="base-button base-button--variant-outline" role="button" @click="handleCancel">取消</span>
              <span class="base-button base-button--type-primary base-button--variant-solid" role="button" @click="handleConfirm">确认</span>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

---

## base-confirm

### 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `false` | 是否显示（v-model） |
| `type` | `'warning' \| 'danger' \| 'info'` | `'warning'` | 图标类型 |
| `title` | `string` | `'确认操作'` | 标题 |
| `message` | `string` | `''` | 描述文字 |
| `confirmText` | `string` | `'确认'` | 确认按钮文字 |
| `cancelText` | `string` | `'取消'` | 取消按钮文字 |
| `confirmType` | `'primary' \| 'danger'` | `'primary'` | 确认按钮样式 |

### 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:visible` | `boolean` | 显示状态变化 |
| `confirm` | - | 点击确认 |
| `cancel` | - | 点击取消 |

### 渲染结构

```vue
<template>
  <Teleport to="body">
    <Transition name="base-dialog">
      <div v-if="visible" class="base-dialog__overlay" @click="handleCancel">
        <div class="base-dialog base-dialog--confirm" @click.stop>
          <div class="base-confirm__icon" :class="`base-confirm__icon--${type}`">
            <span v-if="type === 'warning'" class="base-confirm__icon-shape">⚠</span>
            <span v-else-if="type === 'danger'" class="base-confirm__icon-shape">✕</span>
            <span v-else class="base-confirm__icon-shape">i</span>
          </div>
          <span class="base-dialog__title base-dialog__title--center">{{ title }}</span>
          <span class="base-confirm__message">{{ message }}</span>
          <div class="base-dialog__footer base-dialog__footer--center">
            <span class="base-button base-button--variant-outline" role="button" @click="handleCancel">{{ cancelText }}</span>
            <span
              class="base-button"
              :class="[`base-button--type-${confirmType}`, 'base-button--variant-solid']"
              role="button"
              @click="handleConfirm"
            >{{ confirmText }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

---

## 核心样式

```css
/* 遮罩 */
.base-dialog__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 通用弹窗 */
.base-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.base-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border-light);
}

.base-dialog__title {
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
}
.base-dialog__title--center { text-align: center; width: 100%; }

.base-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s;
}
.base-dialog__close:hover { background: var(--color-bg-hover); color: var(--color-text-primary); }

.base-dialog__body {
  padding: var(--space-5) var(--space-6);
  overflow-y: auto;
  flex: 1;
}

.base-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border-light);
}
.base-dialog__footer--center { justify-content: center; }

/* 确认弹窗 */
.base-dialog--confirm {
  max-width: 400px;
  padding: var(--space-6);
  align-items: center;
  gap: var(--space-3);
}

.base-confirm__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
}
.base-confirm__icon--warning { background: var(--color-warning-light); }
.base-confirm__icon--danger  { background: var(--color-danger-light); }
.base-confirm__icon--info    { background: var(--color-primary-light); }

.base-confirm__icon-shape { font-size: 24px; }
.base-confirm__icon--warning .base-confirm__icon-shape { color: var(--color-warning); }
.base-confirm__icon--danger  .base-confirm__icon-shape { color: var(--color-danger); }
.base-confirm__icon--info    .base-confirm__icon-shape { color: var(--color-primary); }

.base-confirm__message {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
  margin-bottom: var(--space-3);
}

/* 入场/退场动画 */
.base-dialog-enter-active { transition: opacity 0.2s ease; }
.base-dialog-enter-active .base-dialog { transition: transform 0.2s ease; }
.base-dialog-leave-active { transition: opacity 0.15s ease; }
.base-dialog-leave-active .base-dialog { transition: transform 0.15s ease; }

.base-dialog-enter-from { opacity: 0; }
.base-dialog-enter-from .base-dialog { transform: translateY(-20px); }
.base-dialog-leave-to { opacity: 0; }
.base-dialog-leave-to .base-dialog { transform: translateY(-20px); }
```

## 约束

- **零 HTML5 标签**：按钮用 `<span role="button">`
- **Teleport**：必须挂载到 `body`
- **单例管理**：同一页面可存在多个 dialog，z-index 自增
- **禁止硬编码颜色值**
