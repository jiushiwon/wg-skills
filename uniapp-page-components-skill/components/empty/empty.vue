<!--
  Empty 空状态（业务组件）
  ============================================================
  轻量业务组件（不依赖 base-card）。
  场景：空列表、空收藏、空订单、无搜索结果、无网络。
  触发词：空状态 / 空列表 / 暂无数据 / 空购物车 / 没有内容
-->
<template>
  <view class="empty">
    <image
      v-if="image && !imgError"
      class="empty-img"
      :src="image"
      mode="aspectFit"
      @error="imgError = true"
    />
    <view v-else class="empty-img-ph">
      <text class="empty-img-ph-text">{{ icon || '空' }}</text>
    </view>

    <text class="empty-text">{{ text }}</text>
    <text v-if="description" class="empty-desc">{{ description }}</text>

    <slot />

    <base-button
      v-if="actionText"
      class="empty-action"
      type="ghost"
      size="sm"
      @click="$emit('actionClick')"
    >
      {{ actionText }}
    </base-button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  /** 主文案 */
  text?: string
  /** 描述 */
  description?: string
  /** 图片地址（无则显示 icon 字符占位） */
  image?: string
  /** 占位字符 */
  icon?: string
  /** 操作按钮文案（空则不显示） */
  actionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '暂无数据',
  description: '',
  image: '',
  icon: '空',
  actionText: '',
})

const emit = defineEmits<{ actionClick: [] }>()

const imgError = ref(false)
</script>

<style lang="scss" scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.empty-img {
  width: 240rpx;
  height: 240rpx;
}

.empty-img-ph {
  width: 200rpx;
  height: 200rpx;
  border-radius: var(--radius-full);
  background: var(--color-bg-tinted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-img-ph-text {
  font-size: var(--font-2xl);
  color: var(--color-text-tertiary);
}

.empty-text {
  margin-top: var(--spacing-md);
  font-size: var(--font-md);
  color: var(--color-text-secondary);
}

.empty-desc {
  margin-top: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

.empty-action {
  margin-top: var(--spacing-lg);
}
</style>
