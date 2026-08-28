<template>
  <view class="radio-group">
    <view v-if="label" class="radio-group__label">{{ label }}</view>
    <view class="radio-group__items">
      <view
        v-for="(item, index) in options"
        :key="index"
        :class="['radio-group__item', { 'radio-group__item--checked': modelValue === item.value }]"
        @click="handleClick(item)"
      >
        <view class="radio-group__circle">
          <view v-if="modelValue === item.value" class="radio-group__dot" />
        </view>
        <text class="radio-group__text">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RadioGroup',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(item) {
      if (this.disabled) return
      this.$emit('update:modelValue', item.value)
      this.$emit('change', item.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.radio-group {
  padding: 12px 16px;
  background: var(--bg-primary, #fff);

  &__label {
    font-size: 14px;
    color: var(--text-primary, #1C1C1E);
    margin-bottom: 12px;
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__circle {
    width: 20px;
    height: 20px;
    border: 2px solid #d9d9d9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &--checked {
      border-color: var(--primary, #007AFF);
    }
  }

  &__dot {
    width: 10px;
    height: 10px;
    background: var(--primary, #007AFF);
    border-radius: 50%;
  }

  &__text {
    font-size: 14px;
    color: var(--text-primary, #1C1C1E);
  }
}
</style>
