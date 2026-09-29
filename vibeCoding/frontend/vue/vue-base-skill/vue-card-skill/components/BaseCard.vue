<template>
  <div
    :class="containerClass"
    role="region"
  >
    <div v-if="hasHeader" class="base-card__header">
      <slot name="header">
        <span v-if="title" class="base-card__title">{{ title }}</span>
      </slot>
      <div v-if="$slots['header-right']" class="base-card__header-right">
        <slot name="header-right" />
      </div>
    </div>

    <div class="base-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>

    <div v-if="loading" class="base-card__loading" aria-hidden="true">
      <span class="base-card__spinner"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  /** 卡片标题（base-card.md 公共根容器定义） */
  title?: string
  /** 是否显示阴影（base-card.md 定义） */
  shadow?: boolean
  /** 圆角尺寸（base-wg-card.md 强制依赖，base-card.md 未列出） */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** 内边距（base-wg-card.md 强制依赖） */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /** 边框（base-wg-card.md 强制依赖） */
  bordered?: boolean
  /** 可点击态（base-wg-card.md 强制依赖） */
  clickable?: boolean
  /** 色调（联动左侧强调条）（base-wg-card.md 强制依赖） */
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  /** 加载态（base-wg-card.md 强制依赖） */
  loading?: boolean
}>(), {
  title: '',
  shadow: false,
  radius: 'md',
  padding: 'md',
  bordered: false,
  clickable: false,
  tone: 'neutral',
  loading: false,
})

const slots = useSlots()

const hasHeader = computed(() => {
  return !!(
    props.title ||
    slots.header ||
    slots['header-right']
  )
})

const containerClass = computed(() => [
  'base-card',
  `base-card--radius-${props.radius}`,
  `base-card--padding-${props.padding}`,
  {
    'base-card--shadow': props.shadow,
    'base-card--bordered': props.bordered,
    'base-card--clickable': props.clickable,
    'base-card--loading': props.loading,
    [`base-card--tone-${props.tone}`]: props.tone !== 'neutral',
  },
])
</script>

<style scoped>
.base-card {
  position: relative;
  background: var(--color-surface, #ffffff);
  color: var(--color-text, #333333);
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid transparent;
  border-left-width: 3px;
  border-left-style: solid;
  border-left-color: transparent;
}

/* radius */
.base-card--radius-none { border-radius: 0; }
.base-card--radius-sm   { border-radius: var(--radius-sm, 2px); }
.base-card--radius-md   { border-radius: var(--radius-md, 6px); }
.base-card--radius-lg   { border-radius: var(--radius-lg, 12px); }
.base-card--radius-xl   { border-radius: var(--radius-xl, 16px); }
.base-card--radius-full { border-radius: var(--radius-full, 9999px); }

/* padding */
.base-card--padding-none { padding: 0; }
.base-card--padding-sm   { padding: var(--space-2, 8px); }
.base-card--padding-md   { padding: var(--space-4, 16px); }
.base-card--padding-lg   { padding: var(--space-5, 20px); }
.base-card--padding-xl   { padding: var(--space-6, 24px); }

/* bordered */
.base-card--bordered {
  border-color: var(--color-border-light, #f0f0f0);
}

/* tone → 左侧 3px 强调条 */
.base-card--tone-primary { border-left-color: var(--color-primary, #1890ff); }
.base-card--tone-success { border-left-color: var(--color-success, #52c41a); }
.base-card--tone-warning { border-left-color: var(--color-warning, #faad14); }
.base-card--tone-danger  { border-left-color: var(--color-danger, #ff4d4f); }

/* shadow */
.base-card--shadow {
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.06));
}

/* clickable */
.base-card--clickable {
  cursor: pointer;
  transition: transform var(--transition-fast, 0.15s), box-shadow var(--transition-fast, 0.15s);
}

.base-card--clickable:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.1));
}

/* header */
.base-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3, 12px);
  margin-bottom: var(--space-3, 12px);
}

.base-card__title {
  font-size: var(--font-size-base, 14px);
  font-weight: var(--weight-semibold, 600);
  color: var(--color-text, #333333);
}

.base-card__header-right {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}

/* body */
.base-card__body {
  min-width: 0;
}

/* footer */
.base-card__footer {
  margin-top: var(--space-3, 12px);
  padding-top: var(--space-3, 12px);
  border-top: 1px solid var(--color-border-light, #f0f0f0);
}

/* loading */
.base-card__loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.base-card__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-primary, #1890ff);
  border-top-color: transparent;
  border-radius: var(--radius-full, 9999px);
  animation: base-card-spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes base-card-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>