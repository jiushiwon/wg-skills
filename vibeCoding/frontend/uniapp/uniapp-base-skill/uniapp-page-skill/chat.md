# chat-page 聊天页面

> ⚠️ **Demo 组件**：本文件是 demo 案例，非完美实现，仅供参考。展示如何基于 base-card 思想组合出聊天页面。

## 结构拆解

```
┌─────────────────────────────┐
│  导航栏（固定顶部）        │  ← headerHeight, headerBg
├─────────────────────────────┤
│                             │
│  消息列表（可滚动区域）     │  ← flex:1 撑满剩余空间
│  ┌─────────────────────┐  │
│  │ 头像 │ 气泡内容      │  │  ← avatar + bubble 卡片组合
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ 气泡内容 │ 头像       │  │
│  └─────────────────────┘  │
│                             │
├─────────────────────────────┤
│  输入框（固定底部）        │  ← footerHeight, footerBg + safe-area
└─────────────────────────────┘
```

## Props

| Prop | 默认值 | 说明 |
|------|--------|------|
| `pageBg` | `var(--color-bg)` | 页面背景色 |
| `headerHeight` | `88rpx` | 导航栏高度 |
| `headerBg` | `var(--color-bg-surface)` | 导航栏背景色 |
| `avatarSize` | `80rpx` | 头像尺寸 |
| `avatarRadius` | `50%` | 头像圆角（50%=圆，0=方） |
| `bubbleRadius` | `16rpx` | 气泡圆角 |
| `selfBubbleBg` | `var(--color-primary)` | 自己气泡背景色 |
| `otherBubbleBg` | `var(--color-bg-surface)` | 对方气泡背景色 |
| `footerHeight` | `100rpx` | 输入框高度 |
| `footerBg` | `var(--color-bg-surface)` | 输入框背景色 |
| `title` | `聊天` | 导航标题 |
| `placeholder` | `请输入...` | 输入框占位符 |

## 完整代码

```vue
<template>
  <!-- 页面根容器：撑满全屏 -->
  <view class="chat-page" :style="pageStyle">

    <!-- 导航栏：固定顶部 -->
    <view class="chat-header" :style="headerStyle">
      <text class="chat-title">{{ title }}</text>
    </view>

    <!-- 消息列表：flex:1 撑满剩余空间 -->
    <view class="chat-body">
      <view
        v-for="msg in messages"
        :key="msg.id"
        class="chat-row"
        :class="msg.isSelf ? 'is-self' : 'is-other'"
      >
        <!-- 头像：基于 base-card 思想 -->
        <view class="chat-avatar" :style="avatarStyle">
          <image :src="msg.avatar || defaultAvatar" mode="aspectFill" />
        </view>

        <!-- 气泡 -->
        <view class="chat-bubble" :style="bubbleStyle(msg)">
          <text>{{ msg.content }}</text>
        </view>
      </view>
    </view>

    <!-- 输入框：固定底部 -->
    <view class="chat-footer" :style="footerStyle">
      <input
        v-model="inputText"
        class="chat-input"
        :placeholder="placeholder"
        @confirm="onSend"
      />
      <view class="chat-send" @click="onSend">
        <text>发送</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

interface ChatMessage {
  id: string | number
  content: string
  isSelf?: boolean
  avatar?: string
}

// ===== 入参：控制宽高圆角背景色 =====
interface Props {
  pageBg?: string
  headerHeight?: string
  headerBg?: string
  avatarSize?: string
  avatarRadius?: string
  bubbleRadius?: string
  selfBubbleBg?: string
  otherBubbleBg?: string
  footerHeight?: string
  footerBg?: string
  title?: string
  messages?: ChatMessage[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  pageBg: 'var(--color-bg)',
  headerHeight: '88rpx',
  headerBg: 'var(--color-bg-surface)',
  avatarSize: '80rpx',
  avatarRadius: '50%',
  bubbleRadius: '16rpx',
  selfBubbleBg: 'var(--color-primary)',
  otherBubbleBg: 'var(--color-bg-surface)',
  footerHeight: '100rpx',
  footerBg: 'var(--color-bg-surface)',
  title: '聊天',
  messages: () => [],
  placeholder: '请输入...',
})

// ===== 计算样式 =====
const pageStyle = computed(() => ({
  background: props.pageBg,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: props.headerHeight,
  paddingBottom: props.footerHeight,
  boxSizing: 'border-box',
}))

const headerStyle = computed(() => ({
  position: 'fixed' as const,
  top: '0' as const,
  left: '0' as const,
  right: '0' as const,
  height: props.headerHeight,
  background: props.headerBg,
  zIndex: '100' as const,
}))

const avatarStyle = computed(() => ({
  width: props.avatarSize,
  height: props.avatarSize,
  borderRadius: props.avatarRadius,
}))

const bubbleStyle = computed(() => (msg: ChatMessage) => ({
  borderRadius: props.bubbleRadius,
  background: msg.isSelf ? props.selfBubbleBg : props.otherBubbleBg,
  color: msg.isSelf ? 'var(--white)' : 'var(--color-text-primary)',
}))

const footerStyle = computed(() => ({
  position: 'fixed' as const,
  bottom: '0' as const,
  left: '0' as const,
  right: '0' as const,
  height: props.footerHeight,
  background: props.footerBg,
  zIndex: '100' as const,
}))

// ===== 事件 =====
const emit = defineEmits<{
  send: [text: string]
}>()

const inputText = ref('')

function onSend() {
  if (!inputText.value.trim()) return
  emit('send', inputText.value)
  inputText.value = ''
  // 发送后自动滚到底部
  nextTick(() => {
    uni.pageScrollTo({ scrollTop: 999999, duration: 0 })
  })
}

// 监听消息变化自动滚到底部
watch(() => props.messages.length, () => {
  nextTick(() => {
    uni.pageScrollTo({ scrollTop: 999999, duration: 0 })
  })
})
</script>

<style scoped>
.chat-page { overflow: hidden; }

.chat-header {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid var(--color-border);
}

.chat-title { font-size: var(--font-lg); font-weight: 600; }

.chat-body {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.chat-row {
  display: flex;
  margin-bottom: 24rpx;
  align-items: flex-start;
}

.chat-row.is-self { flex-direction: row-reverse; }

.chat-avatar {
  flex-shrink: 0;
  overflow: hidden;
}

.chat-avatar image { width: 100%; height: 100%; }

.chat-bubble {
  max-width: 70%;
  padding: 16rpx 24rpx;
  margin: 0 16rpx;
}

.chat-footer {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  border-top: 1rpx solid var(--color-border);
}

.chat-input {
  flex: 1;
  height: 64rpx;
  padding: 0 16rpx;
  background: var(--color-bg);
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.chat-send {
  padding: 16rpx 32rpx;
  background: var(--color-primary);
  border-radius: 8rpx;
  color: var(--white);
}
</style>
```

## 参数化示例

```vue
<!-- 圆形头像聊天 -->
<chat-page avatar-radius="50%" />

<!-- 方形头像聊天 -->
<chat-page avatar-radius="0" />

<!-- 蓝色主题聊天 -->
<chat-page self-bubble-bg="var(--color-info)" />

<!-- 暗黑模式聊天 -->
<chat-page page-bg="#1a1a1a" header-bg="#2a2a2a" footer-bg="#2a2a2a" />
```

## 核心思想

1. **固定 header/footer**：使用 `position: fixed` + `zIndex` 层级
2. **内容区 flex:1**：自动撑满剩余空间
3. **气泡参数化**：背景色、圆角、颜色都可配置
4. **头像参数化**：尺寸、圆角独立控制
5. **自动滚动**：新消息后调用 `uni.pageScrollTo` 滚到底部
