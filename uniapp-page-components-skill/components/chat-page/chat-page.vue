<!--
  ChatPage 聊天组件化页面（参考微信聊天）
  ============================================================
  结构：自定义导航栏 + 消息滚动区 + 底部输入栏（＋ icon / 输入框 / 发送按钮）
  特性：
    - 我的消息：右侧、主题色高亮气泡；对方消息：左侧、白色气泡，均带"尾巴"圆角；
    - 头像自带 error 兜底（显示昵称首字）；
    - 新消息自动滚到底部，scrolltoupper 触发 loadMore 加载历史；
    - 点击 ＋ 展开 plus-panel slot（可放图片/语音/表情扩展面板）；
    - message slot 可完全自定义气泡内容。
-->
<template>
  <view class="chat-page">
    <view class="chat-header">
      <slot name="header">
        <view class="chat-navbar">
          <view class="chat-navbar-side" @click="$emit('back')">
            <text class="chat-navbar-back-icon">‹</text>
          </view>
          <text class="chat-navbar-title">{{ title }}</text>
          <view class="chat-navbar-side is-right">
            <slot name="navbar-right">
              <view v-if="showMore" class="chat-navbar-more" @click="$emit('moreClick')">
                <text class="chat-navbar-more-icon">⋯</text>
              </view>
            </slot>
          </view>
        </view>
      </slot>
    </view>

    <scroll-view
      class="chat-body"
      scroll-y
      :scroll-into-view="scrollIntoView"
      :scroll-with-animation="true"
      :scroll-anchoring="true"
      @scrolltoupper="onScrollTop"
    >
      <view class="chat-body-inner">
        <view v-if="loading" class="chat-history-loading">
          <text class="chat-history-loading-text">正在加载历史消息...</text>
        </view>

        <template v-if="messages.length">
          <view
            v-for="(msg, index) in messages"
            :id="`msg-${msg.id}`"
            :key="msg.id"
            class="chat-row"
            :class="msg.isSelf ? 'is-self' : 'is-other'"
          >
            <slot name="message" :msg="msg" :index="index">
              <view class="chat-avatar" @click="$emit('avatarClick', msg)">
                <base-avatar :src="msg.avatar" :nickname="msg.nickname || (msg.isSelf ? '我' : '友')" size="sm" />
              </view>

              <view class="chat-main">
                <view class="chat-bubble" @click="$emit('messageClick', msg)" @longpress="$emit('messageLongPress', msg)">
                  <text class="chat-bubble-text">{{ msg.content }}</text>
                </view>
                <view class="chat-extra">
                  <text v-if="msg.time" class="chat-time">{{ msg.time }}</text>
                  <text v-if="msg.status === 'failed'" class="chat-status is-failed" @click="$emit('retry', msg)">发送失败，点击重试</text>
                  <text v-else-if="msg.status === 'sending'" class="chat-status">发送中</text>
                </view>
              </view>
            </slot>
          </view>
        </template>

        <slot v-else name="empty">
          <view class="chat-empty">
            <text class="chat-empty-text">暂无消息，打个招呼吧～</text>
          </view>
        </slot>
      </view>
    </scroll-view>

    <view class="chat-footer">
      <view v-if="plusOpen && !inputFocus" class="chat-plus-panel">
        <slot name="plus-panel" :close="closePlus" />
      </view>

      <view class="chat-input-bar">
        <view v-if="showPlus" class="chat-plus" @click="onPlusClick">
          <text class="chat-plus-icon">＋</text>
        </view>
        <input
          v-model="inputText"
          class="chat-input"
          :placeholder="placeholder"
          placeholder-class="chat-input-ph"
          confirm-type="send"
          :cursor-spacing="20"
          :adjust-position="true"
          @focus="inputFocus = true"
          @blur="inputFocus = false"
          @confirm="onSend"
        />
        <view v-if="sendButtonVisible" class="chat-send" @click="onSend">
          <text class="chat-send-text">{{ sendButtonText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

interface ChatMessage {
  id: string | number
  content: string
  /** 是否本人发送（否则视为对方） */
  isSelf?: boolean
  time?: string
  avatar?: string
  nickname?: string
  status?: 'sending' | 'sent' | 'failed'
}

interface Props {
  /** 导航栏标题 */
  title?: string
  /** 消息列表 */
  messages?: ChatMessage[]
  /** 输入框占位文案 */
  placeholder?: string
  /** 是否显示 ＋ 号 */
  showPlus?: boolean
  /** 是否显示右上角更多（⋯） */
  showMore?: boolean
  /** 发送按钮文案 */
  sendButtonText?: string
  /** 发送按钮显示策略：always 始终显示 / auto 有内容时显示 */
  sendButtonMode?: 'always' | 'auto'
  /** 历史消息加载中（顶部显示 loading） */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '聊天',
  messages: () => [],
  placeholder: '输入消息',
  showPlus: true,
  showMore: false,
  sendButtonText: '发送',
  sendButtonMode: 'auto',
  loading: false,
})

const emit = defineEmits<{
  back: []
  moreClick: []
  plusClick: [open: boolean]
  avatarClick: [msg: ChatMessage]
  messageClick: [msg: ChatMessage]
  messageLongPress: [msg: ChatMessage]
  retry: [msg: ChatMessage]
  loadMore: []
  send: [text: string]
}>()

const inputText = ref('')
const inputFocus = ref(false)
const plusOpen = ref(false)
const scrollIntoView = ref('')
let upperGuard = 0

const sendButtonVisible = computed(
  () => props.sendButtonMode === 'always' || !!inputText.value.trim(),
)

function onPlusClick() {
  plusOpen.value = !plusOpen.value
  emit('plusClick', plusOpen.value)
}

function closePlus() {
  plusOpen.value = false
}

function onSend() {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
  plusOpen.value = false
}

function scrollToBottom() {
  const list = props.messages
  if (!list.length) return
  nextTick(() => {
    scrollIntoView.value = `msg-${list[list.length - 1].id}`
  })
}

function onScrollTop() {
  const now = Date.now()
  if (now - upperGuard < 600) return
  upperGuard = now
  emit('loadMore')
}

watch(() => props.messages.length, scrollToBottom)
onMounted(scrollToBottom)
</script>

<style lang="scss" scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-page);
}

/* ---- 导航栏 ---- */
.chat-navbar {
  display: flex;
  align-items: center;
  height: var(--height-btn-xl);
  padding: 0 var(--spacing-md);
  background: var(--color-bg-surface);
  border-bottom: 1rpx solid var(--color-border-light);
}

.chat-navbar-side {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 96rpx;

  &.is-right {
    justify-content: flex-end;
  }
}

.chat-navbar-back-icon {
  font-size: var(--font-2xl);
  color: var(--color-text-primary);
  line-height: 1;
  padding: var(--spacing-sm);
}

.chat-navbar-title {
  flex: 1;
  text-align: center;
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.chat-navbar-more {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 88rpx;
}

.chat-navbar-more-icon {
  font-size: var(--font-2xl);
  color: var(--color-text-secondary);
  line-height: 1;
}

/* ---- 消息区 ---- */
.chat-body {
  flex: 1;
  min-height: 0;
}

.chat-body-inner {
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-2xl);
  box-sizing: border-box;
}

.chat-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);

  &.is-self {
    flex-direction: row-reverse;
  }
}

.chat-avatar {
  flex-shrink: 0;
}

.chat-main {
  max-width: 68%;
  margin: 0 var(--spacing-md);
}

.is-self .chat-main {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-bubble {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-md);
  line-height: 1.5;
  word-break: break-all;
}

.is-other .chat-bubble {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  border-bottom-left-radius: var(--radius-sm);
}

.is-self .chat-bubble {
  background: var(--color-primary);
  color: var(--white);
  border-bottom-right-radius: var(--radius-sm);
}

.chat-extra {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: var(--spacing-xs);
}

.is-self .chat-extra {
  align-items: flex-end;
}

.chat-time {
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
}

.chat-status {
  margin-top: var(--spacing-xs);
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);

  &.is-failed {
    color: var(--color-error);
  }
}

.chat-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) 0;
}

.chat-empty-text {
  font-size: var(--font-md);
  color: var(--color-text-tertiary);
}

.chat-history-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) 0 var(--spacing-md);
}

.chat-history-loading-text {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

/* ---- 底部输入栏 ---- */
.chat-footer {
  flex-shrink: 0;
  background: var(--color-bg-surface);
  border-top: 1rpx solid var(--color-border-light);
  padding-bottom: env(safe-area-inset-bottom);
}

.chat-input-bar {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
}

.chat-plus {
  margin-right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--height-btn-lg);
  height: var(--height-btn-lg);
  flex-shrink: 0;
}

.chat-plus-icon {
  font-size: var(--font-2xl);
  color: var(--color-text-secondary);
  line-height: 1;
}

.chat-input {
  margin-right: var(--spacing-sm);
  flex: 1;
  min-width: 0;
  height: var(--height-btn-lg);
  padding: 0 var(--spacing-md);
  box-sizing: border-box;
  border-radius: var(--radius-btn);
  font-size: var(--font-md);
  color: var(--color-text-primary);
  background: var(--color-bg-page);
}

.chat-input-ph {
  color: var(--color-text-tertiary);
}

.chat-send {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--height-btn-md);
  padding: 0 var(--spacing-md);
  border-radius: var(--radius-btn);
  background: var(--color-primary);
}

.chat-send-text {
  font-size: var(--font-md);
  color: var(--white);
}

.chat-plus-panel {
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md);
}
</style>
