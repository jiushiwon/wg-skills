<template>
  <view v-if="show" :class="['toast', `toast--${type}`]" :style="toastStyle">
    <view v-if="icon" class="toast__icon">{{ icon }}</view>
    <view class="toast__message">{{ message }}</view>
  </view>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text',
      validator: v => ['text', 'success', 'error', 'warning', 'loading'].includes(v)
    },
    icon: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 2000
    },
    position: {
      type: String,
      default: 'center',
      validator: v => ['top', 'center', 'bottom'].includes(v)
    }
  },
  computed: {
    toastStyle() {
      const style = {}
      if (this.position === 'top') {
        style.top = '20%'
      } else if (this.position === 'bottom') {
        style.bottom = '20%'
      } else {
        style.top = '50%'
        style.transform = 'translateY(-50%)'
      }
      return style
    }
  },
  watch: {
    show(val) {
      if (val && this.duration > 0) {
        setTimeout(() => {
          this.$emit('close')
        }, this.duration)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  max-width: 70%;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 8px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &__icon {
    font-size: 32px;
  }

  &__message {
    font-size: 14px;
    color: #fff;
    text-align: center;
    line-height: 1.4;
  }

  &--success {
    background: rgba(82, 196, 26, 0.9);
  }

  &--error {
    background: rgba(255, 77, 79, 0.9);
  }

  &--warning {
    background: rgba(250, 173, 20, 0.9);
  }

  &--loading {
    background: rgba(0, 0, 0, 0.75);
  }
}
</style>
