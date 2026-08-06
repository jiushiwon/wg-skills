<!--
  UserCard 用户卡片（业务组件）
  ============================================================
  基于 base-card 空壳组件组合实现，不改空壳。颗粒度 < 页面组件。
  场景：作者卡片、好友卡片、关注列表项、用户主页头部等。
  触发词：用户卡片 / 作者卡 / 好友卡 / 关注列表项
-->
<template>
  <base-card :radius="radius" :padding="padding" :background="background" :margin="margin" :border="border" :shadow="shadow" :clickable="clickable" @click="$emit('click')">
    <view class="uc">
      <view class="uc-avatar" @click="$emit('avatarClick')">
        <base-avatar :src="avatar" :nickname="nickname" size="sm" />
      </view>

      <view class="uc-main">
        <text class="uc-nickname">{{ nickname }}</text>
        <text v-if="subtitle" class="uc-subtitle">{{ subtitle }}</text>
        <view v-if="$slots.default || desc" class="uc-desc">
          <slot>
            <text class="uc-desc-text">{{ desc }}</text>
          </slot>
        </view>
      </view>

      <view class="uc-action">
        <slot name="action">
          <base-button v-if="actionText" :type="actionType" size="sm" :loading="actionLoading" @click="$emit('actionClick')">
            {{ actionText }}
          </base-button>
        </slot>
      </view>
    </view>
  </base-card>
</template>

<script setup lang="ts">
interface Props {
  avatar?: string
  nickname?: string
  subtitle?: string
  desc?: string
  /** 右侧按钮文案（空则不显示） */
  actionText?: string
  /** 右侧按钮类型 */
  actionType?: 'primary' | 'ghost' | 'text'
  actionLoading?: boolean
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
  subtitle: '',
  desc: '',
  actionText: '',
  actionType: 'ghost',
  actionLoading: false,
  clickable: false,
  radius: 'var(--radius-card)',
  padding: 'var(--spacing-md)',
  background: 'var(--color-bg-surface)',
  margin: '0 0 var(--spacing-md)',
  border: false,
  shadow: false,
})

const emit = defineEmits<{ click: []; avatarClick: []; actionClick: [] }>()
</script>

<style lang="scss" scoped>
.uc {
  display: flex;
  align-items: center;
  min-width: 0;
}

.uc-avatar {
  flex-shrink: 0;
}

.uc-main {
  flex: 1;
  min-width: 0;
  margin: 0 var(--spacing-md);
}

.uc-nickname {
  display: block;
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.uc-subtitle {
  display: block;
  margin-top: 2rpx;
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
}

.uc-desc {
  margin-top: var(--spacing-xs);
}

.uc-desc-text {
  font-size: var(--font-sm);
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.uc-action {
  flex-shrink: 0;
}
</style>
