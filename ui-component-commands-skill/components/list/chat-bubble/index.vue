<template>
  <view :class="['chat-bubble', `chat-bubble--${position}`]">
    <!-- 头像 -->
    <view v-if="showAvatar" class="chat-bubble__avatar">
      <image v-if="avatar" :src="avatar" mode="aspectFill" />
      <view v-else class="chat-bubble__avatar-placeholder">{{ name ? name[0] : '?' }}</view>
    </view>

    <!-- 内容 -->
    <view class="chat-bubble__content">
      <view v-if="showName && name" class="chat-bubble__name">{{ name }}</view>
      <view :class="['chat-bubble__message', `chat-bubble__message--${type}`]">
        <text>{{ message }}</text>
      </view>
      <view v-if="time" class="chat-bubble__time">{{ time }}</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChatBubble',
  props: {
    position: {
      type: String,
      default: 'left',
      validator: v => ['left', 'right'].includes(v)
    },
    type: {
      type: String,
      default: 'text',
      validator: v => ['text', 'image', 'voice'].includes(v)
    },
    message: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      default: ''
    },
    showAvatar: {
      type: Boolean,
      default: true
    },
    showName: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-bubble {
  display: flex;
  margin-bottom: 16px;

  &--right {
    flex-direction: row-reverse;

    .chat-bubble__message {
      background: var(--primary, #007AFF);
      color: #fff;
    }
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    overflow: hidden;
    margin: 0 12px;
    flex-shrink: 0;

    image {
      width: 100%;
      height: 100%;
    }
  }

  &__avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary, #f2f2f7);
    color: var(--text-secondary, #6C6C70);
    font-size: 16px;
    font-weight: 600;
  }

  &__content {
    max-width: 70%;
  }

  &__name {
    font-size: 12px;
    color: var(--text-secondary, #6C6C70);
    margin-bottom: 4px;
  }

  &__message {
    padding: 10px 14px;
    background: #fff;
    border-radius: 8px;
    font-size: 15px;
    line-height: 1.4;
    color: var(--text-primary, #1C1C1E);
    word-break: break-word;

    &--image {
      padding: 4px;
      background: transparent;

      image {
        max-width: 200px;
        max-height: 200px;
        border-radius: 8px;
      }
    }
  }

  &__time {
    margin-top: 4px;
    font-size: 11px;
    color: var(--text-secondary, #999);
  }
}
</style>
