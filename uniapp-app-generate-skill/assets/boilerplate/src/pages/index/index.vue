<script setup lang="ts">
import { ref } from 'vue';
import AppButton from '@/components/AppButton/AppButton.vue';
import { PROJECT_NAME } from '@/constants/env';

const count = ref(0);

function increment() {
  count.value += 1;
}
</script>

<template>
  <view class="page home-page">
    <view class="home-page__header">
      <text class="home-page__title">
        首页
      </text>
      <text class="home-page__subtitle">
        欢迎使用 {{ PROJECT_NAME }}
      </text>
    </view>

    <view class="home-page__card">
      <text class="home-page__count">
        {{ count }}
      </text>
      <AppButton
        type="primary"
        @click="increment"
      >
        点击 +1
      </AppButton>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home-page {
  padding: $comp-page-padding;
  background: $color-bg-secondary;

  &__header {
    margin-bottom: $spacing-lg;
  }

  &__title {
    display: block;
    font-size: $font-headline;
    color: $color-text-primary;
    font-weight: 600;
  }

  &__subtitle {
    display: block;
    margin-top: $spacing-xs;
    font-size: $font-body;
    color: $color-text-secondary;
  }

  &__card {
    padding: $comp-card-padding;
    background: $color-bg-primary;
    border-radius: $comp-card-radius;
    box-shadow: $shadow-1;
    text-align: center;
  }

  &__count {
    display: block;
    margin-bottom: $spacing-md;
    font-size: $font-display;
    color: $color-primary;
    font-weight: 700;
  }
}
</style>
