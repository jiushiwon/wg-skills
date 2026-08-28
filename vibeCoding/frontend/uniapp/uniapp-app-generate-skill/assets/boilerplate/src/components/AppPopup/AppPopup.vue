<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    position?: 'bottom' | 'center';
    title?: string;
    closeOnMask?: boolean;
    showClose?: boolean;
  }>(),
  {
    position: 'bottom',
    title: '',
    closeOnMask: true,
    showClose: true,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function onMaskTap() {
  if (closeOnMask) close();
}
</script>

<template>
  <view
    v-if="modelValue"
    class="app-popup"
    :class="`app-popup--${position}`"
  >
    <view class="app-popup__mask" @tap="onMaskTap" />
    <view class="app-popup__content" @tap.stop>
      <view v-if="title || showClose" class="app-popup__header">
        <text class="app-popup__title">
          {{ title }}
        </text>
        <text v-if="showClose" class="app-popup__close" @tap="close">
          ×
        </text>
      </view>
      <slot />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.app-popup {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  display: flex;

  &--bottom {
    align-items: flex-end;
  }

  &--center {
    align-items: center;
    justify-content: center;
  }

  &__mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: $comp-popup-mask-bg;
  }

  &__content {
    position: relative;
    width: 100%;
    max-height: $comp-popup-sheet-max-height;
    padding: $comp-popup-padding;
    background: $color-bg-primary;
    border-radius: $comp-popup-radius $comp-popup-radius 0 0;
    box-sizing: border-box;
    overflow-y: auto;
  }

  &--center &__content {
    width: $comp-popup-width-center;
    max-height: none;
    border-radius: $comp-popup-radius;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
  }

  &__title {
    flex: 1;
    font-size: $font-title;
    font-weight: 600;
    color: $color-text-primary;
  }

  &__close {
    width: 48rpx;
    height: 48rpx;
    line-height: 48rpx;
    text-align: center;
    font-size: $font-headline;
    color: $color-text-tertiary;
  }
}
</style>
