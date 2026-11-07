<template>
  <div :class="cardClass" @click="clickable ? $emit('click', $event) : undefined">
    <div v-if="$slots.header" :class="['base-card__header', { 'base-card--has-header-border': headerBorder }]">
      <div class="base-card__header-main">
        <slot name="header" />
      </div>
      <div v-if="$slots.actions" class="base-card__header-actions">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="title" :class="['base-card__header', { 'base-card--has-header-border': headerBorder }]">
      <div class="base-card__header-main">
        <div class="base-card__title">{{ title }}</div>
        <div v-if="desc" class="base-card__desc">{{ desc }}</div>
      </div>
      <div v-if="$slots.actions" class="base-card__header-actions">
        <slot name="actions" />
      </div>
    </div>
    <div class="base-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'flat' | 'elevated' | 'outlined'
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  bordered?: boolean
  clickable?: boolean
  headerBorder?: boolean
  title?: string
  desc?: string
}>(), {
  radius: 'lg',
  padding: 'lg',
  shadow: 'sm',
  headerBorder: false,
  clickable: false,
  bordered: false,
})

defineEmits<{ click: [e: MouseEvent] }>()

const cardClass = computed(() => [
  'base-card',
  props.radius && `base-card--radius-${props.radius}`,
  props.padding && `base-card--padding-${props.padding}`,
  props.shadow && `base-card--shadow-${props.shadow}`,
  props.variant && `base-card--variant-${props.variant}`,
  props.tone && `base-card--tone-${props.tone}`,
  props.bordered && 'base-card--bordered',
  props.clickable && 'base-card--clickable',
])
</script>