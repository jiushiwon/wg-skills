<template>
  <view class="progress-bar">
    <view v-if="showText" class="progress-bar__text">
      <text>{{ text || `${percent}%` }}</text>
    </view>
    <view :class="['progress-bar__track', { 'progress-bar__track--round': round }]" :style="trackStyle">
      <view
        :class="['progress-bar__fill', `progress-bar__fill--${type}`]"
        :style="fillStyle"
      />
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    percent: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      default: 'primary',
      validator: v => ['primary', 'success', 'warning', 'error'].includes(v)
    },
    showText: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: ''
    },
    strokeWidth: {
      type: Number,
      default: 6
    },
    round: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    trackStyle() {
      return {
        height: this.strokeWidth + 'px'
      }
    },
    fillStyle() {
      return {
        width: Math.min(100, Math.max(0, this.percent)) + '%',
        height: this.strokeWidth + 'px'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-bar {
  width: 100%;

  &__text {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--text-secondary, #6C6C70);
  }

  &__track {
    width: 100%;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;

    &--round {
      border-radius: 3px;
    }
  }

  &__fill {
    border-radius: 3px;
    transition: width 0.3s ease;

    &--primary {
      background: var(--primary, #007AFF);
    }

    &--success {
      background: #52c41a;
    }

    &--warning {
      background: #faad14;
    }

    &--error {
      background: #ff4d4f;
    }
  }
}
</style>
