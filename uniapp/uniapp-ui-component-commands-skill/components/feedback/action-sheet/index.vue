<template>
  <view v-if="show" class="action-sheet-mask" @click="handleClose">
    <view class="action-sheet" @click.stop>
      <view class="action-sheet__title" v-if="title">{{ title }}</view>
      <view class="action-sheet__options">
        <view
          v-for="(item, index) in options"
          :key="index"
          :class="['action-sheet__option', { 'action-sheet__option--destructive': item.destructive }]"
          @click="handleClick(item)"
        >
          {{ item.text }}
        </view>
      </view>
      <view v-if="showCancel" class="action-sheet__cancel" @click="handleClose">
        {{ cancelText }}
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ActionSheet',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '取消'
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleClick(item) {
      this.$emit('select', item)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.action-sheet-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.action-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f2f2f7;

  &__title {
    padding: 16px;
    text-align: center;
    font-size: 13px;
    color: var(--text-secondary, #6C6C70);
    background: #fff;
  }

  &__options {
    background: #fff;
    margin-bottom: 8px;
  }

  &__option {
    padding: 16px;
    text-align: center;
    font-size: 17px;
    color: var(--text-primary, #1C1C1E);
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    &--destructive {
      color: #ff4d4f;
    }
  }

  &__cancel {
    padding: 16px;
    text-align: center;
    font-size: 17px;
    color: var(--primary, #007AFF);
    background: #fff;
    border-radius: 12px;
    margin-bottom: env(safe-area-inset-bottom);
  }
}
</style>
