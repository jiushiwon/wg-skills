<template>
  <view class="switch" @click="handleClick">
    <view v-if="label" class="switch__label">{{ label }}</view>
    <view
      :class="['switch__core', { 'switch__core--checked': value, 'switch__core--disabled': disabled }]"
      :style="switchStyle"
    >
      <view class="switch__dot" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'Switch',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    activeColor: {
      type: String,
      default: '#007AFF'
    },
    inactiveColor: {
      type: String,
      default: '#e0e0e0'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    value() {
      return this.modelValue
    },
    switchStyle() {
      return {
        '--active-color': this.activeColor,
        '--inactive-color': this.inactiveColor
      }
    }
  },
  methods: {
    handleClick() {
      if (this.disabled) return
      this.$emit('update:modelValue', !this.value)
      this.$emit('change', !this.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-primary, #fff);

  &__label {
    font-size: 15px;
    color: var(--text-primary, #1C1C1E);
  }

  &__core {
    position: relative;
    width: 51px;
    height: 31px;
    background: var(--inactive-color, #e0e0e0);
    border-radius: 16px;
    transition: background 0.3s;

    &--checked {
      background: var(--active-color, #007AFF);

      .switch__dot {
        transform: translateX(20px);
      }
    }

    &--disabled {
      opacity: 0.5;
    }
  }

  &__dot {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 27px;
    height: 27px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s;
  }
}
</style>
