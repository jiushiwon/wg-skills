<!--
  CommentItem 评论条（业务组件）
  ============================================================
  基于 base-card 空壳组件组合实现，不改空壳。
  场景：评论列表、回复列表、评价列表项。
  触发词：评论条 / 评论项 / 回复列表项 / 评价项
-->
<template>
  <base-card :radius="radius" :padding="padding" :background="background" :margin="margin" :border="border" :shadow="shadow" :clickable="clickable" @click="$emit('click')">
    <view class="ci">
      <view class="ci-avatar" @click="$emit('avatarClick')">
        <base-avatar :src="avatar" :nickname="nickname" size="sm" />
      </view>

      <view class="ci-main">
        <view class="ci-head">
          <text class="ci-nickname">{{ nickname }}</text>
          <text class="ci-time">{{ time }}</text>
        </view>

        <view class="ci-content" @click="$emit('contentClick')">
          <slot>
            <template v-if="replyTo">
              <text class="ci-reply-name">{{ replyTo }}</text>
              <text class="ci-reply-sep">：</text>
            </template>
            <text class="ci-content-text">{{ content }}</text>
          </slot>
        </view>

        <view class="ci-foot">
          <view v-if="likeable" class="ci-like" :class="{ 'is-liked': liked }" @click="$emit('likeClick')">
            <text class="ci-like-icon">👍</text>
            <text v-if="likeCount" class="ci-like-count">{{ likeCount }}</text>
          </view>
          <view v-if="replyable" class="ci-reply" @click="$emit('replyClick')">
            <text class="ci-reply-btn">回复</text>
          </view>
        </view>
      </view>
    </view>
  </base-card>
</template>

<script setup lang="ts">
interface Props {
  avatar?: string
  nickname?: string
  time?: string
  content?: string
  /** 回复对象（显示 "XX：" 前缀） */
  replyTo?: string
  likeCount?: string | number
  liked?: boolean
  likeable?: boolean
  replyable?: boolean
  clickable?: boolean
  // base-card 透传入参
  radius?: string
  padding?: string
  background?: string
  margin?: string
  border?: boolean
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  avatar: '',
  nickname: '用户',
  time: '',
  content: '',
  replyTo: '',
  likeCount: '',
  liked: false,
  likeable: true,
  replyable: true,
  clickable: false,
  radius: 'var(--radius-card)',
  padding: 'var(--spacing-md)',
  background: 'var(--color-bg-surface)',
  margin: '0 0 var(--spacing-sm)',
  border: false,
  shadow: false,
})

const emit = defineEmits<{
  click: []
  avatarClick: []
  contentClick: []
  likeClick: []
  replyClick: []
}>()
</script>

<style lang="scss" scoped>
.ci {
  display: flex;
  align-items: flex-start;
  min-width: 0;
}

.ci-avatar {
  flex-shrink: 0;
}

.ci-main {
  flex: 1;
  min-width: 0;
  margin-left: var(--spacing-md);
}

.ci-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ci-nickname {
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-primary);
}

.ci-time {
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
}

.ci-content {
  margin-top: var(--spacing-xs);
  font-size: var(--font-md);
  line-height: 1.6;
  color: var(--color-text-primary);
  word-break: break-all;
}

.ci-reply-name {
  color: var(--color-primary);
}

.ci-reply-sep {
  color: var(--color-text-tertiary);
}

.ci-foot {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-sm);
}

.ci-like {
  display: flex;
  align-items: center;
  min-width: 88rpx;
  min-height: 88rpx;
  margin: calc(-1 * var(--spacing-md)) 0;

  &.is-liked .ci-like-icon {
    color: var(--color-primary);
  }
}

.ci-like-icon {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

.ci-like-count {
  margin-left: var(--spacing-xs);
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
}

.ci-reply {
  min-width: 88rpx;
  min-height: 88rpx;
  margin: calc(-1 * var(--spacing-md)) 0;
  display: flex;
  align-items: center;
}

.ci-reply-btn {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}
</style>
