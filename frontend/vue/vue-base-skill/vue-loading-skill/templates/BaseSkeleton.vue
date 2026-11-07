<script setup lang="ts">
import { computed } from 'vue'
import type { SkeletonProps } from '../types/loading'

const props = withDefaults(defineProps<SkeletonProps>(), {
  type: 'paragraph',
  rows: 3,
  columns: 4,
  avatarShape: 'circle',
  animated: true,
})

const rowHeights = ['80px', '60px', '40px']
const rowHeight = computed(() => rowHeights[Math.min(props.rows - 1, 2)])
</script>

<template>
  <!-- Avatar -->
  <div v-if="type === 'avatar'" class="base-skeleton base-skeleton--avatar">
    <span
      class="base-skeleton__avatar"
      :class="{ 'is-circle': avatarShape === 'circle' }"
      :style="{ animationPlayState: animated ? 'running' : 'paused' }"
    />
  </div>

  <!-- Paragraph -->
  <div v-else-if="type === 'paragraph'" class="base-skeleton base-skeleton--paragraph">
    <div
      v-for="i in rows"
      :key="i"
      class="base-skeleton__row"
      :style="{
        height: rowHeight,
        width: i === rows ? '60%' : '100%',
        animationPlayState: animated ? 'running' : 'paused'
      }"
    />
  </div>

  <!-- Table -->
  <div v-else-if="type === 'table'" class="base-skeleton base-skeleton--table">
    <!-- Header -->
    <div class="base-skeleton__table-header">
      <span
        v-for="i in columns"
        :key="'h' + i"
        class="base-skeleton__cell"
        :style="{ animationPlayState: animated ? 'running' : 'paused' }"
      />
    </div>
    <!-- Rows -->
    <div
      v-for="j in rows"
      :key="j"
      class="base-skeleton__table-row"
    >
      <span
        v-for="i in columns"
        :key="i"
        class="base-skeleton__cell"
        :style="{ animationPlayState: animated ? 'running' : 'paused' }"
      />
    </div>
  </div>

  <!-- Card -->
  <div v-else-if="type === 'card'" class="base-skeleton base-skeleton--card">
    <span
      class="base-skeleton__card-image"
      :style="{ animationPlayState: animated ? 'running' : 'paused' }"
    />
    <div class="base-skeleton__card-content">
      <span
        class="base-skeleton__card-title"
        :style="{ animationPlayState: animated ? 'running' : 'paused' }"
      />
      <span
        v-for="i in 2"
        :key="i"
        class="base-skeleton__card-text"
        :style="{ animationPlayState: animated ? 'running' : 'paused' }"
      />
    </div>
  </div>
</template>

<style scoped>
.base-skeleton {
  width: 100%;
}

/* Avatar */
.base-skeleton--avatar {
  display: flex;
}

.base-skeleton__avatar {
  display: block;
  width: 48px;
  height: 48px;
  background: var(--color-bg-secondary, #f5f7fa);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.base-skeleton__avatar.is-circle {
  border-radius: 50%;
}

.base-skeleton__avatar:not(.is-circle) {
  border-radius: var(--radius-md, 8px);
}

/* Paragraph */
.base-skeleton--paragraph {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.base-skeleton__row {
  background: var(--color-bg-secondary, #f5f7fa);
  border-radius: var(--radius-sm, 4px);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* Table */
.base-skeleton--table {
  display: flex;
  flex-direction: column;
}

.base-skeleton__table-header,
.base-skeleton__table-row {
  display: flex;
  gap: var(--space-3, 12px);
  padding: var(--space-3, 12px) 0;
  border-bottom: 1px solid var(--color-border-light, #e4e7ed);
}

.base-skeleton__table-header {
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-skeleton__cell {
  flex: 1;
  height: 20px;
  background: var(--color-bg-secondary, #f5f7fa);
  border-radius: var(--radius-sm, 4px);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* Card */
.base-skeleton--card {
  display: flex;
  flex-direction: column;
}

.base-skeleton__card-image {
  display: block;
  width: 100%;
  height: 160px;
  background: var(--color-bg-secondary, #f5f7fa);
  border-radius: var(--radius-md, 8px) var(--radius-md, 8px) 0 0;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.base-skeleton__card-content {
  padding: var(--space-3, 12px);
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}

.base-skeleton__card-title {
  height: 20px;
  width: 70%;
  background: var(--color-bg-secondary, #f5f7fa);
  border-radius: var(--radius-sm, 4px);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.base-skeleton__card-text {
  height: 14px;
  background: var(--color-bg-secondary, #f5f7fa);
  border-radius: var(--radius-sm, 4px);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.base-skeleton__card-text:last-child {
  width: 50%;
}

/* Animation */
@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.base-skeleton__avatar,
.base-skeleton__row,
.base-skeleton__cell,
.base-skeleton__card-image,
.base-skeleton__card-title,
.base-skeleton__card-text {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary, #f5f7fa) 25%,
    var(--color-bg, #fafafa) 50%,
    var(--color-bg-secondary, #f5f7fa) 75%
  );
  background-size: 200% 100%;
}
</style>
