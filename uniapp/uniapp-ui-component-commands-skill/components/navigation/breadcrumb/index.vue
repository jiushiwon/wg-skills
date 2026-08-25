<template>
  <view class="breadcrumb">
    <view
      v-for="(item, index) in items"
      :key="index"
      class="breadcrumb__item"
    >
      <view
        :class="['breadcrumb__link', { 'breadcrumb__link--clickable': item.path && index < items.length - 1 }]"
        @click="handleClick(item, index)"
      >
        {{ item.name }}
      </view>
      <view v-if="index < items.length - 1" class="breadcrumb__separator">
        <text>{{ separator }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Breadcrumb',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    separator: {
      type: String,
      default: '/'
    }
  },
  methods: {
    handleClick(item, index) {
      if (item.path && index < this.items.length - 1) {
        this.$emit('click', item, index)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 12px 16px;
  font-size: 14px;

  &__item {
    display: flex;
    align-items: center;
  }

  &__link {
    color: var(--text-secondary, #6C6C70);

    &--clickable {
      color: var(--primary, #007AFF);
    }
  }

  &__separator {
    margin: 0 8px;
    color: var(--text-secondary, #999);
  }
}
</style>
