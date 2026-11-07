<script setup lang="ts">
import type { LoadingProps } from '../types/loading'

withDefaults(defineProps<LoadingProps>(), {
  type: 'spin',
  size: 'md',
})
</script>

<template>
  <!-- Spin -->
  <span
    v-if="type === 'spin'"
    class="base-loading base-loading--spin"
    :class="`is-${size}`"
  />

  <!-- Dots -->
  <span
    v-else-if="type === 'dots'"
    class="base-loading base-loading--dots"
    :class="`is-${size}`"
  >
    <i /><i /><i />
  </span>

  <!-- Pulse -->
  <span
    v-else-if="type === 'pulse'"
    class="base-loading base-loading--pulse"
    :class="`is-${size}`"
  />
</template>

<style scoped>
.base-loading {
  display: inline-flex;
  vertical-align: middle;
}

/* Sizes */
.base-loading--spin.is-sm { width: 16px; height: 16px; border-width: 2px; }
.base-loading--spin.is-md { width: 24px; height: 24px; border-width: 2px; }
.base-loading--spin.is-lg { width: 40px; height: 40px; border-width: 3px; }

.base-loading--dots.is-sm i { width: 8px; height: 8px; }
.base-loading--dots.is-md i { width: 10px; height: 10px; }
.base-loading--dots.is-lg i { width: 14px; height: 14px; }

.base-loading--pulse.is-sm { width: 16px; height: 16px; }
.base-loading--pulse.is-md { width: 24px; height: 24px; }
.base-loading--pulse.is-lg { width: 40px; height: 40px; }

/* Spin */
.base-loading--spin {
  border: 2px solid var(--color-border, #e4e7ed);
  border-top-color: var(--color-primary, #409eff);
  border-radius: 50%;
  animation: loading-spin 0.8s linear infinite;
}

@keyframes loading-spin {
  to { transform: rotate(360deg); }
}

/* Dots */
.base-loading--dots {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.base-loading--dots i {
  width: var(--dot-size, 12px);
  height: var(--dot-size, 12px);
  background: var(--color-primary, #409eff);
  border-radius: 50%;
  animation: loading-dots 1.4s ease-in-out infinite;
}

.base-loading--dots i:nth-child(1) { animation-delay: 0s; }
.base-loading--dots i:nth-child(2) { animation-delay: 0.2s; }
.base-loading--dots i:nth-child(3) { animation-delay: 0.4s; }

@keyframes loading-dots {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse */
.base-loading--pulse {
  background: var(--color-primary, #409eff);
  border-radius: 50%;
  animation: loading-pulse 1.5s ease-in-out infinite;
}

@keyframes loading-pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
  100% {
    transform: scale(0.8);
    opacity: 1;
  }
}
</style>
