<template>
  <view v-if="show" class="loading">
    <view :class="['loading__spinner', `loading__spinner--${type}`]" :style="spinnerStyle">
      <!-- 菊花图 -->
      <view v-if="type === 'spinner'" class="loading__dots">
        <view v-for="i in 12" :key="i" class="loading__dot" :style="{ animationDelay: (i * 0.1) + 's' }" />
      </view>
      <!-- 圆圈 -->
      <view v-else-if="type === 'circle'" class="loading__circle" />
    </view>
    <view v-if="text" class="loading__text">{{ text }}</view>
  </view>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    show: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'spinner',
      validator: v => ['spinner', 'circle'].includes(v)
    },
    size: {
      type: String,
      default: 'medium',
      validator: v => ['small', 'medium', 'large'].includes(v)
    },
    color: {
      type: String,
      default: '#007AFF'
    }
  },
  computed: {
    spinnerStyle() {
      const sizeMap = { small: '20px', medium: '30px', large: '40px' }
      return {
        width: sizeMap[this.size],
        height: sizeMap[this.size],
        '--loading-color': this.color
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;

  &__spinner {
    &--spinner {
      position: relative;
      width: 30px;
      height: 30px;
    }

    &--circle {
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-top-color: var(--loading-color, #007AFF);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }

  &__dots {
    width: 100%;
    height: 100%;
    position: relative;
  }

  &__dot {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    &::before {
      content: '';
      display: block;
      width: 10%;
      height: 10%;
      margin: 0 auto;
      background: var(--loading-color, #007AFF);
      border-radius: 50%;
      animation: fadeDelay 1.2s infinite ease-in-out both;
    }
  }

  &__text {
    margin-top: 12px;
    font-size: 14px;
    color: var(--text-secondary, #6C6C70);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeDelay {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
