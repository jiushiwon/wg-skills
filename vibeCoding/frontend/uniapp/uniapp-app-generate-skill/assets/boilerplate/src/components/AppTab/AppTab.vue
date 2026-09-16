<script setup lang="ts">
type TabKey = string | number;

withDefaults(
  defineProps<{
    items: { key: TabKey; label: string }[];
    modelValue?: TabKey;
  }>(),
  {
    modelValue: '',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', key: TabKey): void;
  (e: 'change', key: TabKey): void;
}>();

function select(key: TabKey) {
  emit('update:modelValue', key);
  emit('change', key);
}
</script>

<template>
  <view class="app-tab">
    <view
      v-for="item in items"
      :key="item.key"
      class="app-tab__item"
      :class="{ 'app-tab__item--active': item.key === modelValue }"
      @tap="select(item.key)"
    >
      <text class="app-tab__label">
        {{ item.label }}
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.app-tab {
  display: flex;
  align-items: center;
  height: $comp-tab-height;

  &__item {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 $comp-tab-item-padding-x;
    color: $color-text-secondary;
    font-size: $font-body;

    &--active {
      color: $color-primary;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: $comp-tab-indicator-width;
        height: $comp-tab-indicator-height;
        border-radius: $radius-full;
        background: $color-primary;
        transform: translateX(-50%);
      }
    }
  }
}
</style>
