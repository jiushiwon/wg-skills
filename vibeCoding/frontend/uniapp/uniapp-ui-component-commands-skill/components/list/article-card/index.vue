<template>
  <view class="article-card" @click="handleClick">
    <!-- 封面图模式 -->
    <view v-if="mode === 'cover' && image" class="article-card__cover">
      <image :src="image" mode="aspectFill" class="article-card__cover-img" />
    </view>

    <view class="article-card__body">
      <!-- 左侧图模式 -->
      <view v-if="mode === 'thumb' && image" class="article-card__thumb">
        <image :src="image" mode="aspectFill" />
      </view>

      <view class="article-card__content">
        <view v-if="title" class="article-card__title">{{ title }}</view>
        <view v-if="desc" class="article-card__desc">{{ desc }}</view>

        <view class="article-card__meta">
          <view v-if="author" class="article-card__author">{{ author }}</view>
          <view v-if="date" class="article-card__date">{{ date }}</view>
          <view v-if="views" class="article-card__views">👁 {{ views }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ArticleCard',
  props: {
    mode: {
      type: String,
      default: 'thumb',
      validator: v => ['thumb', 'cover'].includes(v)
    },
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
    author: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      default: ''
    },
    views: {
      type: [String, Number],
      default: ''
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
.article-card {
  background: var(--bg-primary, #fff);
  border-radius: var(--radius-md, 10px);
  overflow: hidden;

  &__cover {
    width: 100%;
    height: 180px;

    &-img {
      width: 100%;
      height: 100%;
    }
  }

  &__body {
    display: flex;
    padding: 12px;
  }

  &__thumb {
    width: 100px;
    height: 75px;
    border-radius: 6px;
    overflow: hidden;
    margin-right: 12px;
    flex-shrink: 0;

    image {
      width: 100%;
      height: 100%;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary, #1C1C1E);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__desc {
    margin-top: 4px;
    font-size: 13px;
    color: var(--text-secondary, #6C6C70);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: auto;
    font-size: 12px;
    color: var(--text-secondary, #6C6C70);
  }

  &__author {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
