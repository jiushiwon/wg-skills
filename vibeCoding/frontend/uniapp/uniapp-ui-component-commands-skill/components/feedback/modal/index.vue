<template>
  <view v-if="show" class="modal-mask" @click="handleMaskClick">
    <view class="modal" @click.stop>
      <view v-if="title" class="modal__title">{{ title }}</view>
      <view class="modal__content">
        <slot>{{ message }}</slot>
      </view>
      <view class="modal__footer">
        <view v-if="showCancel" class="modal__btn modal__btn--cancel" @click="handleCancel">
          {{ cancelText }}
        </view>
        <view v-if="showConfirm" class="modal__btn modal__btn--confirm" @click="handleConfirm">
          {{ confirmText }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    showConfirm: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    closeOnMask: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleMaskClick() {
      if (this.closeOnMask) {
        this.$emit('close')
      }
    },
    handleCancel() {
      this.$emit('cancel')
      this.$emit('close')
    },
    handleConfirm() {
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 70%;
  max-width: 300px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;

  &__title {
    padding: 20px 16px 10px;
    font-size: 17px;
    font-weight: 600;
    text-align: center;
    color: var(--text-primary, #1C1C1E);
  }

  &__content {
    padding: 10px 16px 20px;
    font-size: 15px;
    color: var(--text-secondary, #6C6C70);
    text-align: center;
    line-height: 1.5;
  }

  &__footer {
    display: flex;
    border-top: 1px solid #eee;
  }

  &__btn {
    flex: 1;
    height: 44px;
    line-height: 44px;
    text-align: center;
    font-size: 16px;

    &--cancel {
      color: var(--text-secondary, #6C6C70);
      border-right: 1px solid #eee;
    }

    &--confirm {
      color: var(--primary, #007AFF);
      font-weight: 500;
    }
  }
}
</style>
