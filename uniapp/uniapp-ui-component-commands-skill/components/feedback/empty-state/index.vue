<template>
  <view class="empty-state">
    <view v-if="image" class="empty-state__image">
      <image :src="image" mode="aspectFit" />
    </view>
    <view v-else class="empty-state__icon">{{ icon }}</view>
    <view v-if="title" class="empty-state__title">{{ title }}</view>
    <view v-if="desc" class="empty-state__desc">{{ desc }}</view>
    <view v-if="showButton" class="empty-state__button" @click="handleClick">
      {{ buttonText }}
    </view>
  </view>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    image: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: '📭'
    },
    title: {
      type: String,
      default: ''
    },
    desc: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: ''
    },
    showButton: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  &__image {
    width: 200px;
    height: 200px;

    image {
      width: 100%;
      height: 100%;
    }
  }

  &__icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  &__title {
    margin-top: 16px;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary, #1C1C1E);
  }

  &__desc {
    margin-top: 8px;
    font-size: 14px;
    color: var(--text-secondary, #6C6C70);
    text-align: center;
    line-height: 1.5;
  }

  &__button {
    margin-top: 24px;
    padding: 10px 32px;
    background: var(--primary, #007AFF);
    color: #fff;
    font-size: 15px;
    border-radius: 20px;
  }
}
</style>
