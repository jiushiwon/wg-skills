<template>
  <view class="date-picker" @click="handleClick">
    <view v-if="label" class="date-picker__label">{{ label }}</view>
    <view :class="['date-picker__value', { 'date-picker__value--placeholder': !value }]">
      {{ value || placeholder }}
    </view>
    <view class="date-picker__arrow">›</view>
  </view>
</template>

<script>
export default {
  name: 'DatePicker',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择日期'
    },
    mode: {
      type: String,
      default: 'date',
      validator: v => ['date', 'time', 'datetime'].includes(v)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    value() {
      return this.modelValue
    }
  },
  methods: {
    handleClick() {
      if (!this.disabled) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.date-picker {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-primary, #fff);
  border-bottom: 1px solid #eee;

  &__label {
    font-size: 14px;
    color: var(--text-primary, #1C1C1E);
    margin-right: 16px;
  }

  &__value {
    flex: 1;
    font-size: 15px;
    color: var(--text-primary, #1C1C1E);

    &--placeholder {
      color: var(--text-secondary, #999);
    }
  }

  &__arrow {
    font-size: 18px;
    color: #ccc;
  }
}
</style>
