<!--
  ArticleCard 文章卡片
  ============================================================
  卡片外壳由根容器 BaseCard 提供（圆角/背景/边框），本组件只负责内部排布。
-->
<template>
  <BaseCard
    class="ac-card"
    :padding="'var(--space-0, 0rpx)'"
    :clickable="true"
    @click="onClick"
  >
    <!-- 封面图模式 -->
    <view v-if="mode === 'cover' && showImage" class="ac-cover">
      <image class="ac-cover-img" :src="image" mode="aspectFill" @error="onImgError" />
    </view>

    <view class="ac-body">
      <!-- 左侧缩略图模式 -->
      <view v-if="mode === 'thumb' && showImage" class="ac-thumb">
        <image class="ac-thumb-img" :src="image" mode="aspectFill" @error="onImgError" />
      </view>

      <view class="ac-content">
        <view v-if="title" class="ac-title">{{ title }}</view>
        <view v-if="desc" class="ac-desc">{{ desc }}</view>

        <view class="ac-meta">
          <text v-if="author" class="ac-author">{{ author }}</text>
          <text v-if="date" class="ac-date">{{ date }}</text>
          <text v-if="views" class="ac-views">阅读 {{ views }}</text>
        </view>
      </view>
    </view>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseCard from '../../containers/base-card/index.vue'

interface ArticleCardProps {
  /** 模式：thumb 左侧缩略图 / cover 顶部封面 */
  mode?: 'thumb' | 'cover'
  /** 封面图地址 */
  image?: string
  /** 标题 */
  title?: string
  /** 描述 */
  desc?: string
  /** 作者 */
  author?: string
  /** 日期 */
  date?: string
  /** 阅读量 */
  views?: string | number
}

const props = withDefaults(defineProps<ArticleCardProps>(), {
  mode: 'thumb',
  image: '',
  title: '',
  desc: '',
  author: '',
  date: '',
  views: '',
})

const emit = defineEmits<{ click: [] }>()

const imgError = ref(false)

// 换图后重置错误态
watch(
  () => props.image,
  () => {
    imgError.value = false
  },
)

// 图片缺失或加载失败时不再展示图片区
const showImage = computed(() => !!props.image && !imgError.value)

function onImgError() {
  imgError.value = true
}

function onClick() {
  emit('click')
}
</script>

<style scoped>
.ac-cover {
  width: 100%;
  height: 360rpx;
  background: var(--bg-light, #f5f5f5);
}

.ac-cover-img {
  width: 100%;
  height: 100%;
}

.ac-body {
  display: flex;
  gap: var(--space-4, 16rpx);
  padding: var(--space-4, 16rpx);
}

.ac-thumb {
  width: 200rpx;
  height: 150rpx;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-image, 16rpx);
  background: var(--bg-light, #f5f5f5);
}

.ac-thumb-img {
  width: 100%;
  height: 100%;
}

.ac-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ac-title {
  font-size: var(--font-lg, 30rpx);
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary, #171717);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ac-desc {
  margin-top: var(--space-2, 8rpx);
  font-size: var(--font-sm, 26rpx);
  color: var(--text-secondary, #525252);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ac-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4, 16rpx);
  margin-top: var(--space-3, 12rpx);
  font-size: var(--font-xs, 24rpx);
  color: var(--text-secondary, #525252);
}

.ac-author {
  max-width: 160rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
