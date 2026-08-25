<template>
  <view class="checkbox-group">
    <view v-if="label" class="checkbox-group__label">{{ label }}</view>
    <view class="checkbox-group__items">
      <view
        v-for="(item, index) in options"
        :key="index"
        :class="['checkbox-group__item', { 'checkbox-group__item--checked': isChecked(item.value) }]"
        @click="handleClick(item)"
      >
        <view class="checkbox-group__box">
          <text v-if="isChecked(item.value)" class="checkbox-group__check">✓</text>
        </view>
        <text class="checkbox-group__text">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CheckboxGroup',
  props: {
    modelValue: {
      type: Array,
      default: () => []
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
    isChecked(value) {
      return this.modelValue.includes(value)
    },
    handleClick(item) {
      if (this.disabled) return
      const list = [...this.modelValue]
      const index = list.indexOf(item.value)
      if (index > -1) {
        list.splice(index, 1)
      } else {
        list.push(item.value)
      }
      this.$emit('update:modelValue', list)
      this.$emit('change', list)
    }
  }
}
</script>

<style lang="scss" scoped>
.checkbox-group {
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
    gap: 16px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__box {
    width: 20px;
    height: 20px;
    border: 2px solid #d9d9d9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &--checked {
      background: var(--primary, #007AFF);
      border-color: var(--primary, #007AFF);
    }
  }

  &__check {
    color: #fff;
    font-size: 12px;
    font-weight: bold;
  }

  &__text {
    font-size: 14px;
    color: var(--text-primary, #1C1C1E);
  }
}
</style>
