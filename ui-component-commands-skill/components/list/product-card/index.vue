<template>
  <view class="product-card" @click="handleClick">
    <!-- 图片 -->
    <view class="product-card__image">
      <image v-if="image" :src="image" mode="aspectFill" />
      <view v-else class="product-card__placeholder">暂无图片</view>
    </view>

    <!-- 内容 -->
    <view class="product-card__content">
      <view v-if="title" class="product-card__title">{{ title }}</view>
      <view v-if="desc" class="product-card__desc">{{ desc }}</view>

      <view class="product-card__bottom">
        <view class="product-card__price">
          <text class="product-card__price-symbol">¥</text>
          <text class="product-card__price-value">{{ price }}</text>
        </view>
        <view v-if="sales" class="product-card__sales">销量 {{ sales }}</view>
      </view>

      <view v-if="tags && tags.length" class="product-card__tags">
        <text v-for="(tag, i) in tags" :key="i" class="product-card__tag">{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    image: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    desc: {
      type: String,
      default: ''
    },
    price: {
      type: [String, Number],
      default: '0.00'
    },
    originalPrice: {
      type: [String, Number],
      default: ''
    },
    sales: {
      type: [String, Number],
      default: ''
    },
    tags: {
      type: Array,
      default: () => []
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
.product-card {
  background: var(--bg-primary, #fff);
  border-radius: var(--radius-md, 10px);
  overflow: hidden;

  &__image {
    width: 100%;
    height: 160px;
    background: var(--bg-secondary, #f2f2f7);

    image {
      width: 100%;
      height: 100%;
    }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 14px;
  }

  &__content {
    padding: 12px;
  }

  &__title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary, #1C1C1E);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__desc {
    margin-top: 4px;
    font-size: 13px;
    color: var(--text-secondary, #6C6C70);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }

  &__price {
    display: flex;
    align-items: baseline;
  }

  &__price-symbol {
    font-size: 12px;
    color: #ff4d4f;
  }

  &__price-value {
    font-size: 18px;
    font-weight: 600;
    color: #ff4d4f;
  }

  &__sales {
    font-size: 12px;
    color: var(--text-secondary, #6C6C70);
  }

  &__tags {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  &__tag {
    padding: 2px 6px;
    font-size: 11px;
    color: #ff4d4f;
    background: rgba(255, 77, 79, 0.1);
    border-radius: 4px;
  }
}
</style>
