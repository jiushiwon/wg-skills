<template>
  <view class="picker" @click="handleClick">
    <view v-if="label" class="picker__label">{{ label }}</view>
    <view :class="['picker__value', { 'picker__value--placeholder': !selectedText }]">
      {{ selectedText || placeholder }}
    </view>
    <view class="picker__arrow">›</view>
  </view>
</template>

<script>
export default {
  name: 'Picker',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    range: {
      type: Array,
      default: () => []
    },
    rangeKey: {
      type: String,
      default: 'name'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    selectedText() {
      if (this.modelValue === '' || this.modelValue === null) return ''
      const item = this.range.find((item, index) => index === this.modelValue)
      return item ? (typeof item === 'object' ? item[this.rangeKey] : item) : ''
    }
  },
  methods: {
    handleClick() {
      if (this.disabled) return
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss" scoped>
.picker {
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
