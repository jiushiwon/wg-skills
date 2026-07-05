<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/stores/modules/user';
import { platformLogin } from '@/utils/platform-auth';

const userStore = useUserStore();
const nickname = computed(() => userStore.nickname || '未登录');

async function handleLogin() {
  const auth = await platformLogin();
  if (auth?.token) {
    uni.showToast({ title: '登录成功', icon: 'success' });
  } else {
    uni.showToast({ title: '登录失败或已取消', icon: 'none' });
  }
}
</script>

<template>
  <view class="page profile-page">
    <view class="profile-page__user">
      <image
        class="profile-page__avatar"
        src="/static/avatar-placeholder.png"
        mode="aspectFill"
      />
      <text class="profile-page__nickname">
        {{ nickname }}
      </text>
    </view>

    <view class="profile-page__menu">
      <view
        class="profile-page__item"
        @tap="handleLogin"
      >
        <text class="profile-page__item-text">
          登录 / 退出
        </text>
        <text class="profile-page__item-arrow">
          >
        </text>
      </view>
      <view class="profile-page__item">
        <text class="profile-page__item-text">
          设置
        </text>
        <text class="profile-page__item-arrow">
          >
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.profile-page {
  background: $color-bg-secondary;

  &__user {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $comp-user-info-padding-y 0;
    background: $color-bg-primary;
    margin-bottom: $spacing-md;
  }

  &__avatar {
    width: $comp-avatar-size-md;
    height: $comp-avatar-size-md;
    border-radius: $radius-full;
    background: $color-bg-tertiary;
  }

  &__nickname {
    margin-top: $spacing-sm;
    font-size: $font-title;
    color: $color-text-primary;
  }

  &__menu {
    background: $color-bg-primary;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: $comp-list-item-min-height;
    padding: 0 $comp-list-item-padding-x;
    border-bottom: $comp-list-item-border-width solid $color-border-light;

    &:active {
      background: $color-bg-secondary;
    }
  }

  &__item-text {
    font-size: $font-body;
    color: $color-text-primary;
  }

  &__item-arrow {
    font-size: $font-body;
    color: $color-text-tertiary;
  }
}
</style>
