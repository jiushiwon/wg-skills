<script setup lang="ts"></script>

<template>
  <view class="app-card">
    <slot />
  </view>
</template>

<style lang="scss" scoped>
.app-card {
  padding: $comp-card-padding;
  background: $color-bg-primary;
  border-radius: $comp-card-radius;
  box-shadow: $shadow-1;
}
</style>
