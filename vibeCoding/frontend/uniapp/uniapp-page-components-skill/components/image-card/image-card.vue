<!--
  ImageCard 图片卡片
  ============================================================
  结构：BaseCard 托底 -> 顶部图片（可自定义高度/裁剪） -> 标题 -> 描述 -> 标签
  特性：
    - 入参继承 BaseCard（radius / padding / margin / background / border / shadow / clickable）；
    - 图片自带 error 兜底占位（D28）；
    - title / description / tags 为默认数据，可整体用 default slot 替换。
-->
<template>
  <base-card
    :title="title"
    :radius="radius"
    :padding="padding"
    :background="background"
    :margin="margin"
    :border="border"
    :shadow="shadow"
    :clickable="clickable"
    @click="$emit('click')"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <view v-if="$slots.image || image" class="ic-image-wrap" @click.stop="$emit('imageClick')">
      <slot name="image">
        <image
          v-if="image && !imgError"
          class="ic-image"
          :src="image"
          :mode="imageMode"
          :style="{ height: imageHeight }"
          :lazy-load="lazyLoad"
          @error="imgError = true"
        />
        <view v-else class="ic-image-ph" :style="{ height: imageHeight }">
          <text class="ic-image-ph-text">暂无图片</text>
        </view>
      </slot>
    </view>

    <view class="ic-content">
      <slot>
        <text v-if="title" class="ic-title">{{ title }}</text>
        <text v-if="description" class="ic-desc">{{ description }}</text>
        <view v-if="showTags && tags && tags.length" class="ic-tags">
          <text v-for="tag in tags" :key="tag" class="ic-tag">{{ tag }}</text>
        </view>
      </slot>
    </view>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </base-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  /** 图片地址 */
  image?: string
  /** 图片裁剪模式 */
  imageMode?: 'aspectFill' | 'aspectFit' | 'widthFix' | 'scaleToFill'
  /** 图片高度（rpx / 主题变量），默认 calc(var(--spacing-2xl) * 6) ≈ 384rpx */
  imageHeight?: string
  /** 是否懒加载 */
  lazyLoad?: boolean
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 标签列表 */
  tags?: string[]
  /** 是否展示标签 */
  showTags?: boolean

  // ---- BaseCard 透传入参 ----
  radius?: string
  padding?: string
  background?: string
  margin?: string
  border?: boolean
  shadow?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  image: '',
  imageMode: 'aspectFill',
  imageHeight: 'calc(var(--spacing-2xl) * 6)',
  lazyLoad: true,
  title: '',
  description: '',
  tags: () => [],
  showTags: true,
  radius: 'var(--radius-card)',
  padding: '0 0 var(--spacing-md)',
  background: 'var(--color-bg-surface)',
  margin: '0 0 var(--spacing-md)',
  border: false,
  shadow: false,
  clickable: false,
})

const emit = defineEmits<{ click: []; imageClick: [] }>()

const imgError = ref(false)

watch(
  () => props.image,
  () => {
    imgError.value = false
  },
)
</script>

<style lang="scss" scoped>
.ic-image-wrap {
  display: block;
  width: 100%;
}

.ic-image {
  display: block;
  width: 100%;
  border-radius: var(--radius-image);
}

.ic-image-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: var(--color-bg-tinted);
  border-radius: var(--radius-image);
}

.ic-image-ph-text {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

.ic-content {
  padding: var(--spacing-md) var(--spacing-lg) 0;
}

.ic-title {
  display: block;
  font-size: var(--font-lg);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text-primary);
}

.ic-desc {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-sm);
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.ic-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--spacing-sm);
}

.ic-tag {
  margin-right: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-tag);
  font-size: var(--font-xs);
  line-height: 1.4;
  color: var(--color-primary);
  background: var(--color-bg-tinted);
}
</style>
