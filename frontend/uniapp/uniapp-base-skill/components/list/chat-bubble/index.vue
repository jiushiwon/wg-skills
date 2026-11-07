<!--
  ChatBubble 聊天气泡
  ============================================================
  纯展示件，不套卡片容器；头像统一用 BaseAvatar 渲染。
-->
<template>
  <view class="cb" :class="`is-${position}`">
    <!-- 头像 -->
    <view v-if="showAvatar" class="cb-avatar">
      <BaseAvatar :src="avatar" :name="name" size="md" />
    </view>

    <!-- 内容 -->
    <view class="cb-content">
      <view v-if="showName && name" class="cb-name">{{ name }}</view>

      <view class="cb-message" :class="`is-${type}`">
        <image
          v-if="type === 'image' && message && !imgError"
          class="cb-img"
          :src="message"
          mode="aspectFill"
          @error="onImgError"
        />
        <view v-else-if="type === 'image'" class="cb-img cb-img--ph">
          <text class="cb-ph-text">图片加载失败</text>
        </view>
        <text v-else class="cb-text">{{ message }}</text>
      </view>

      <view v-if="time" class="cb-time">{{ time }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseAvatar from '../../../containers/base-avatar/index.vue'

interface ChatBubbleProps {
  /** 位置：left 接收方 / right 发送方 */
  position?: 'left' | 'right'
  /** 类型：text 文本 / image 图片 / voice 语音 */
  type?: 'text' | 'image' | 'voice'
  /** 消息内容（image 类型时为图片地址） */
  message?: string
  /** 头像地址 */
  avatar?: string
  /** 用户名（同时用于头像文字兜底） */
  name?: string
  /** 时间 */
  time?: string
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 是否显示用户名 */
  showName?: boolean
}

const props = withDefaults(defineProps<ChatBubbleProps>(), {
  position: 'left',
  type: 'text',
  message: '',
  avatar: '',
  name: '',
  time: '',
  showAvatar: true,
  showName: false,
})

const imgError = ref(false)

// 换图后重置错误态
watch(
  () => props.message,
  () => {
    imgError.value = false
  },
)

function onImgError() {
  imgError.value = true
}
</script>

<style scoped>
.cb {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--space-4, 16rpx);
}

.cb.is-right {
  flex-direction: row-reverse;
}

.cb-avatar {
  flex-shrink: 0;
  margin: 0 var(--space-3, 12rpx);
}

.cb-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.cb-name {
  margin-bottom: var(--space-2, 8rpx);
  font-size: var(--font-xs, 24rpx);
  color: var(--text-secondary, #525252);
}

.cb-message {
  padding: var(--space-3, 12rpx) var(--space-4, 16rpx);
  background: var(--bg-card, #ffffff);
  border-radius: var(--radius-md, 16rpx);
  border: 1rpx solid var(--border-light, #f5f5f5);
}

.is-right .cb-message {
  background: var(--color-primary, #14b8a6);
  border-color: transparent;
}

.cb-text {
  font-size: var(--font-md, 28rpx);
  line-height: 1.4;
  color: var(--text-primary, #171717);
  word-break: break-word;
}

.is-right .cb-text {
  color: var(--text-inverse, #ffffff);
}

.cb-message.is-voice {
  background: var(--bg-light, #f5f5f5);
  border-color: transparent;
}

.is-right .cb-message.is-voice {
  background: var(--color-primary, #14b8a6);
}

.cb-img {
  width: 360rpx;
  height: 360rpx;
  border-radius: var(--radius-md, 16rpx);
  background: var(--bg-light, #f5f5f5);
}

.cb-img--ph {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cb-ph-text {
  font-size: var(--font-sm, 26rpx);
  color: var(--text-tertiary, #a3a3a3);
}

.cb-time {
  margin-top: var(--space-2, 8rpx);
  font-size: var(--font-2xs, 20rpx);
  color: var(--text-tertiary, #a3a3a3);
}
</style>
