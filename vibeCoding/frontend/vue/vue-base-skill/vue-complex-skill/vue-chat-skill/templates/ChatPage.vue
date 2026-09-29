<!--
  ChatPage.vue - 标准 AI 聊天页组件

  所有 6 种风格共用此组件，通过 class 切换视觉风格：
  - chat-page--codex       Codex 暗色终端（默认）
  - chat-page--minimal     ChatGPT 极简
  - chat-page--support     客服工单
  - chat-page--bubble      消息气泡
  - chat-page--ide         IDE 对话
  - chat-page--glass-dark  深色玻璃

  容器：base-card（助手消息）
  按钮：base-button（发送/操作）

  零 HTML5 标签铁律：模板内只用 div + role，禁止 button/label/form（base-button 除外）。
-->
<template>
  <div class="chat-page" :class="`chat-page--${variant}`">
    <!-- 侧边栏 -->
    <aside v-if="showSidebar" class="chat-sidebar">
      <div class="chat-sidebar__header">
        <slot name="sidebar-header">
          <div class="chat-sidebar__new-btn" role="button" tabindex="0" @click="$emit('conversation-select', '')">
            + 新对话
          </div>
        </slot>
      </div>
      <div class="chat-sidebar__search">
        <div class="chat-sidebar__search-icon">
          <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="chat-sidebar__search-input"
          placeholder="搜索对话..."
        />
      </div>
      <div class="chat-sidebar__list">
        <div
          v-for="conv in filteredConversations"
          :key="conv.id"
          class="chat-sidebar__item"
          :class="{ 'chat-sidebar__item--active': conv.id === currentConversationId }"
          role="button"
          tabindex="0"
          @click="$emit('conversation-select', conv.id)"
        >
          <div class="chat-sidebar__item-content">
            <div class="chat-sidebar__item-title">{{ conv.title }}</div>
            <div class="chat-sidebar__item-preview">{{ conv.lastMessage }}</div>
          </div>
          <div class="chat-sidebar__item-meta">
            <span class="chat-sidebar__item-time">{{ conv.timestamp }}</span>
            <span v-if="conv.unread" class="chat-sidebar__item-badge">{{ conv.unread }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主聊天区域 -->
    <main class="chat-main">
      <!-- 头部 -->
      <header v-if="showHeader" class="chat-header">
        <div class="chat-header__left">
          <div class="chat-header__title">{{ title }}</div>
          <div class="chat-header__model">
            <span class="chat-header__model-dot" />
            <span>{{ modelLabel }}</span>
          </div>
        </div>
        <div class="chat-header__actions">
          <slot name="header-actions" />
        </div>
      </header>

      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesRef">
        <template v-for="msg in messages" :key="msg.id">
          <!-- 系统消息 -->
          <div v-if="msg.role === 'system'" class="chat-message chat-message--system">
            <span class="chat-message__system-text">{{ msg.content }}</span>
          </div>

          <!-- 用户消息 -->
          <div v-else-if="msg.role === 'user'" class="chat-message chat-message--user">
            <div class="chat-message__bubble chat-message__bubble--user">
              <div class="chat-message__content">{{ msg.content }}</div>
              <div class="chat-message__time">{{ msg.timestamp }}</div>
            </div>
          </div>

          <!-- 助手消息（必须用 base-card 包裹） -->
          <base-card v-else class="chat-message chat-message--assistant">
            <div class="chat-message__avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1"/></svg>
            </div>
            <div class="chat-message__body">
              <div class="chat-message__content" v-html="formatContent(msg.content)" />
              <!-- 代码块 -->
              <div v-if="msg.code" class="chat-code-block">
                <div class="chat-code-block__header">
                  <span class="chat-code-block__lang">{{ msg.language || 'code' }}</span>
                  <div
                    class="chat-code-block__copy"
                    role="button"
                    tabindex="0"
                    @click="copyCode(msg.code!)"
                  >
                    {{ copiedId === msg.id ? '已复制' : '复制' }}
                  </div>
                </div>
                <pre class="chat-code-block__pre"><code>{{ msg.code }}</code></pre>
              </div>
              <div class="chat-message__footer">
                <span class="chat-message__time">{{ msg.timestamp }}</span>
                <span v-if="msg.status === 'error'" class="chat-message__error">
                  发送失败
                  <span class="chat-message__retry" role="button" tabindex="0" @click="$emit('retry', msg.id)">重试</span>
                </span>
              </div>
            </div>
            <slot name="message-custom" :message="msg" />
          </base-card>
        </template>

        <!-- 加载指示器 -->
        <div v-if="loading && !streaming" class="chat-message chat-message--assistant chat-message--loading">
          <div class="chat-message__avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1"/></svg>
          </div>
          <div class="chat-message__body">
            <div class="chat-typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <!-- 流式光标 -->
        <div v-if="streaming" class="chat-streaming-cursor" />
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-area">
        <div class="chat-input-area__wrapper">
          <div class="chat-input-area__attach" role="button" tabindex="0" title="附件">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <textarea
            ref="inputRef"
            v-model="inputText"
            :placeholder="inputPlaceholder"
            class="chat-input-area__textarea"
            rows="1"
            @keydown.enter.exact.prevent="handleSend"
            @input="autoResize"
          />
          <base-button
            type="primary"
            size="sm"
            :disabled="streaming ? false : !inputText.trim()"
            @click="handleSend"
          >
            {{ streaming ? '停止' : '发送' }}
          </base-button>
        </div>
        <div class="chat-input-area__hint">Enter 发送 · Shift+Enter 换行</div>
        <slot name="input-extra" />
      </div>
    </main>

    <!-- 状态栏 -->
    <footer v-if="showStatusBar" class="chat-status-bar">
      <span class="chat-status-bar__connection">
        <span class="chat-status-bar__dot" :class="`chat-status-bar__dot--${connectionStatus}`" />
        {{ connectionLabel }}
      </span>
      <span class="chat-status-bar__divider">|</span>
      <span class="chat-status-bar__tokens">Tokens: {{ tokenCount.toLocaleString() }}</span>
      <span class="chat-status-bar__divider">|</span>
      <span class="chat-status-bar__latency">延迟: {{ responseTime }}ms</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'

// ---- Types ----

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  unread?: number
}

interface ChatMessage {
  id: string
  role: 'system' | 'user' | 'assistant'
  content: string
  code?: string
  language?: string
  timestamp: string
  status?: 'sending' | 'sent' | 'error'
}

// ---- Props ----

interface ChatPageProps {
  variant?: 'codex' | 'minimal' | 'support' | 'bubble' | 'ide' | 'glass-dark'
  title?: string
  modelLabel?: string
  conversations?: Conversation[]
  messages?: ChatMessage[]
  showSidebar?: boolean
  showHeader?: boolean
  showStatusBar?: boolean
  loading?: boolean
  streaming?: boolean
  currentConversationId?: string
  connectionStatus?: 'connected' | 'connecting' | 'disconnected'
  tokenCount?: number
  responseTime?: number
  inputPlaceholder?: string
}

const props = withDefaults(defineProps<ChatPageProps>(), {
  variant: 'codex',
  title: '新对话',
  modelLabel: 'Claude Sonnet',
  conversations: () => [],
  messages: () => [],
  showSidebar: true,
  showHeader: true,
  showStatusBar: true,
  loading: false,
  streaming: false,
  currentConversationId: '',
  connectionStatus: 'connected',
  tokenCount: 0,
  responseTime: 0,
  inputPlaceholder: '输入消息...',
})

// ---- Emits ----

const emit = defineEmits<{
  send: [message: string]
  'conversation-select': [id: string]
  'conversation-delete': [id: string]
  retry: [messageId: string]
  stop: []
}>()

// ---- State ----

const inputText = ref('')
const searchQuery = ref('')
const copiedId = ref<string | null>(null)
const messagesRef = ref<HTMLElement>()
const inputRef = ref<HTMLTextAreaElement>()

// ---- Computed ----

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return props.conversations
  const query = searchQuery.value.toLowerCase()
  return props.conversations.filter(
    c => c.title.toLowerCase().includes(query) || c.lastMessage.toLowerCase().includes(query)
  )
})

const connectionLabel = computed(() => {
  const map = { connected: '已连接', connecting: '连接中...', disconnected: '已断开' }
  return map[props.connectionStatus]
})

// ---- Methods ----

function handleSend() {
  if (props.streaming) {
    emit('stop')
    return
  }
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
  nextTick(() => autoResize())
}

function autoResize() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

function formatContent(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    const msgId = props.messages.find(m => m.code === code)?.id
    if (msgId) {
      copiedId.value = msgId
      setTimeout(() => { copiedId.value = null }, 2000)
    }
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = code
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

// ---- Watch ----

watch(() => props.messages.length, () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
})
</script>

<style>
/* ===================== 全局变量 ===================== */
.chat-page {
  --chat-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --chat-mono-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  --chat-spacing-xs: 4px;
  --chat-spacing-sm: 8px;
  --chat-spacing-md: 16px;
  --chat-spacing-lg: 24px;
  --chat-spacing-xl: 32px;
  --chat-radius-sm: 6px;
  --chat-radius-base: 10px;
  --chat-radius-lg: 16px;
  --chat-radius-xl: 20px;
  --chat-transition-fast: 0.15s ease;
  --chat-transition-base: 0.3s ease;

  /* 颜色变量（被各风格覆写） */
  --chat-bg-primary: #fff;
  --chat-bg-secondary: #f7f7f8;
  --chat-bg-tertiary: #ececf1;
  --chat-text-primary: #2d333a;
  --chat-text-secondary: #6b7280;
  --chat-text-muted: #9ca3af;
  --chat-border-color: #e5e5e5;
  --chat-accent-color: #10a37f;
  --chat-accent-hover: #0d8c6d;
  --chat-user-bubble-bg: #10a37f;
  --chat-user-bubble-color: #fff;
  --chat-assistant-bg: #f7f7f8;
  --chat-sidebar-bg: #f7f7f8;
  --chat-sidebar-active: #e5e5e5;
  --chat-header-bg: #fff;
  --chat-input-bg: #fff;
  --chat-input-border: #d1d5db;
  --chat-code-bg: #1e1e1e;
  --chat-code-header-bg: #2d2d2d;
  --chat-code-color: #d4d4d4;

  display: flex;
  height: 100vh;
  width: 100%;
  font-family: var(--chat-font-family);
  font-size: 14px;
  color: var(--chat-text-primary);
  background: var(--chat-bg-primary);
  overflow: hidden;
}

/* ===================== 侧边栏 ===================== */
.chat-sidebar {
  width: 260px;
  min-width: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--chat-sidebar-bg);
  border-right: 1px solid var(--chat-border-color);
  overflow: hidden;
}

.chat-sidebar__header {
  padding: var(--chat-spacing-md);
  border-bottom: 1px solid var(--chat-border-color);
}

.chat-sidebar__new-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  border-radius: var(--chat-radius-sm);
  border: 1px dashed var(--chat-border-color);
  color: var(--chat-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--chat-transition-fast);
  background: transparent;
}

.chat-sidebar__new-btn:hover {
  border-color: var(--chat-accent-color);
  color: var(--chat-accent-color);
  background: rgba(16, 163, 127, 0.05);
}

.chat-sidebar__search {
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
}

.chat-sidebar__search-icon {
  color: var(--chat-text-muted);
  flex-shrink: 0;
  display: flex;
}

.chat-sidebar__search-input {
  flex: 1;
  height: 32px;
  padding: 0 var(--chat-spacing-sm);
  border: 1px solid var(--chat-border-color);
  border-radius: var(--chat-radius-sm);
  background: var(--chat-bg-primary);
  font-size: 13px;
  color: var(--chat-text-primary);
  outline: none;
  transition: border-color var(--chat-transition-fast);
}

.chat-sidebar__search-input::placeholder {
  color: var(--chat-text-muted);
}

.chat-sidebar__search-input:focus {
  border-color: var(--chat-accent-color);
}

.chat-sidebar__list {
  flex: 1;
  overflow-y: auto;
  padding: var(--chat-spacing-sm) 0;
}

.chat-sidebar__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--chat-spacing-md);
  cursor: pointer;
  transition: background var(--chat-transition-fast);
  border-left: 3px solid transparent;
}

.chat-sidebar__item:hover {
  background: var(--chat-bg-tertiary);
}

.chat-sidebar__item--active {
  background: var(--chat-sidebar-active);
  border-left-color: var(--chat-accent-color);
}

.chat-sidebar__item-content {
  flex: 1;
  min-width: 0;
}

.chat-sidebar__item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--chat-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.chat-sidebar__item-preview {
  font-size: 12px;
  color: var(--chat-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-sidebar__item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  margin-left: var(--chat-spacing-sm);
}

.chat-sidebar__item-time {
  font-size: 11px;
  color: var(--chat-text-muted);
  white-space: nowrap;
}

.chat-sidebar__item-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--chat-accent-color);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}

/* ===================== 主区域 ===================== */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

/* ===================== 头部 ===================== */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 var(--chat-spacing-lg);
  background: var(--chat-header-bg);
  border-bottom: 1px solid var(--chat-border-color);
  flex-shrink: 0;
}

.chat-header__left {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-md);
}

.chat-header__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--chat-text-primary);
}

.chat-header__model {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--chat-text-muted);
  padding: 3px 10px;
  background: var(--chat-bg-secondary);
  border-radius: 999px;
}

.chat-header__model-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--chat-accent-color);
}

.chat-header__actions {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
}

/* ===================== 消息列表 ===================== */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--chat-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--chat-spacing-md);
}

/* 系统消息 */
.chat-message--system {
  display: flex;
  justify-content: center;
  padding: var(--chat-spacing-sm) 0;
}

.chat-message__system-text {
  font-size: 12px;
  color: var(--chat-text-muted);
  padding: 4px 16px;
  background: var(--chat-bg-secondary);
  border-radius: 999px;
}

/* 用户消息 */
.chat-message--user {
  display: flex;
  justify-content: flex-end;
}

.chat-message__bubble--user {
  max-width: 70%;
  padding: var(--chat-spacing-md) var(--chat-spacing-lg);
  background: var(--chat-user-bubble-bg);
  color: var(--chat-user-bubble-color);
  border-radius: var(--chat-radius-lg) var(--chat-radius-lg) var(--chat-radius-sm) var(--chat-radius-lg);
  word-break: break-word;
}

.chat-message__content {
  font-size: 14px;
  line-height: 1.6;
}

.chat-message__time {
  font-size: 11px;
  opacity: 0.6;
  margin-top: var(--chat-spacing-xs);
}

/* 助手消息（base-card） */
.chat-message--assistant {
  display: flex;
  align-items: flex-start;
  gap: var(--chat-spacing-md);
  background: var(--chat-assistant-bg);
  border-radius: var(--chat-radius-base);
  padding: var(--chat-spacing-md) var(--chat-spacing-lg);
  border: 1px solid var(--chat-border-color);
  box-shadow: none;
  max-width: 80%;
}

.chat-message__avatar {
  flex-shrink: 0;
  font-size: 20px;
  line-height: 1;
  margin-top: 2px;
}

.chat-message__body {
  flex: 1;
  min-width: 0;
}

.chat-inline-code {
  font-family: var(--chat-mono-family);
  font-size: 13px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  color: #e83e8c;
}

.chat-message__footer {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
  margin-top: var(--chat-spacing-sm);
}

.chat-message__error {
  font-size: 12px;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
}

.chat-message__retry {
  color: var(--chat-accent-color);
  cursor: pointer;
  text-decoration: underline;
}

/* 代码块 */
.chat-code-block {
  margin: var(--chat-spacing-md) 0;
  border-radius: var(--chat-radius-sm);
  overflow: hidden;
  background: var(--chat-code-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-code-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  background: var(--chat-code-header-bg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-code-block__lang {
  font-size: 12px;
  color: var(--chat-text-muted);
  font-family: var(--chat-mono-family);
}

.chat-code-block__copy {
  font-size: 12px;
  color: var(--chat-accent-color);
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background var(--chat-transition-fast);
}

.chat-code-block__copy:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chat-code-block__pre {
  padding: var(--chat-spacing-md);
  margin: 0;
  overflow-x: auto;
  font-family: var(--chat-mono-family);
  font-size: 13px;
  line-height: 1.6;
  color: var(--chat-code-color);
}

.chat-code-block__pre code {
  font-family: inherit;
}

/* 加载指示器 */
.chat-message--loading {
  display: flex;
  align-items: flex-start;
  gap: var(--chat-spacing-md);
  padding: var(--chat-spacing-md) var(--chat-spacing-lg);
}

.chat-typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.chat-typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chat-text-muted);
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.chat-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* 流式光标 */
.chat-streaming-cursor {
  display: flex;
  align-items: center;
  padding: 0 var(--chat-spacing-lg);
  min-height: 24px;
}

.chat-streaming-cursor::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 16px;
  background: var(--chat-accent-color);
  animation: cursor-blink 1s step-end infinite;
}

@keyframes cursor-blink {
  50% { opacity: 0; }
}

/* ===================== 输入区域 ===================== */
.chat-input-area {
  padding: var(--chat-spacing-md) var(--chat-spacing-lg);
  border-top: 1px solid var(--chat-border-color);
  background: var(--chat-bg-primary);
  flex-shrink: 0;
}

.chat-input-area__wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--chat-spacing-sm);
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  border: 1px solid var(--chat-input-border);
  border-radius: var(--chat-radius-base);
  background: var(--chat-input-bg);
  transition: border-color var(--chat-transition-fast), box-shadow var(--chat-transition-fast);
}

.chat-input-area__wrapper:focus-within {
  border-color: var(--chat-accent-color);
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.1);
}

.chat-input-area__attach {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--chat-radius-sm);
  color: var(--chat-text-muted);
  cursor: pointer;
  transition: all var(--chat-transition-fast);
  flex-shrink: 0;
}

.chat-input-area__attach:hover {
  color: var(--chat-accent-color);
  background: rgba(16, 163, 127, 0.05);
}

.chat-input-area__textarea {
  flex: 1;
  min-height: 24px;
  max-height: 160px;
  padding: 4px 0;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  font-family: var(--chat-font-family);
  font-size: 14px;
  line-height: 1.5;
  color: var(--chat-text-primary);
}

.chat-input-area__textarea::placeholder {
  color: var(--chat-text-muted);
}

.chat-input-area__hint {
  text-align: center;
  font-size: 11px;
  color: var(--chat-text-muted);
  margin-top: var(--chat-spacing-xs);
}

/* ===================== 状态栏 ===================== */
.chat-status-bar {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 var(--chat-spacing-lg);
  background: var(--chat-bg-secondary);
  border-top: 1px solid var(--chat-border-color);
  font-size: 12px;
  color: var(--chat-text-muted);
  flex-shrink: 0;
}

.chat-status-bar__connection {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-status-bar__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
}

.chat-status-bar__dot--connected { background: #22c55e; }
.chat-status-bar__dot--connecting { background: #f59e0b; animation: pulse-dot 1s ease-in-out infinite; }
.chat-status-bar__dot--disconnected { background: #ef4444; }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.chat-status-bar__divider {
  margin: 0 var(--chat-spacing-md);
  opacity: 0.3;
}

/* ===================== 风格覆写 ===================== */

/* 1. Codex 暗色终端 */
.chat-page--codex {
  --chat-bg-primary: #0d1117;
  --chat-bg-secondary: #161b22;
  --chat-bg-tertiary: #1c2128;
  --chat-text-primary: #c9d1d9;
  --chat-text-secondary: #8b949e;
  --chat-text-muted: #6e7681;
  --chat-border-color: #21262d;
  --chat-accent-color: #3fb950;
  --chat-accent-hover: #2ea043;
  --chat-user-bubble-bg: transparent;
  --chat-user-bubble-color: #c9d1d9;
  --chat-assistant-bg: transparent;
  --chat-sidebar-bg: #010409;
  --chat-sidebar-active: #161b22;
  --chat-header-bg: #161b22;
  --chat-input-bg: #161b22;
  --chat-input-border: #30363d;
  --chat-code-bg: #161b22;
  --chat-code-header-bg: #21262d;
  --chat-code-color: #c9d1d9;
  font-family: var(--chat-mono-family);
}

.chat-page--codex .chat-sidebar__item--active {
  border-left-color: #3fb950;
}

.chat-page--codex .chat-sidebar__new-btn {
  border-style: solid;
  border-color: #30363d;
  color: #3fb950;
}

.chat-page--codex .chat-sidebar__new-btn:hover {
  background: rgba(63, 185, 80, 0.1);
  border-color: #3fb950;
}

.chat-page--codex .chat-header__model-dot {
  box-shadow: 0 0 6px rgba(63, 185, 80, 0.5);
}

.chat-page--codex .chat-message--user .chat-message__bubble--user {
  border: 1px solid #30363d;
  border-radius: var(--chat-radius-sm);
}

.chat-page--codex .chat-message--assistant {
  background: transparent;
  border: none;
  padding: var(--chat-spacing-sm) 0;
  border-radius: 0;
}

.chat-page--codex .chat-message__avatar {
  font-size: 14px;
  color: #3fb950;
}

.chat-page--codex .chat-inline-code {
  background: rgba(63, 185, 80, 0.1);
  color: #79c0ff;
}

.chat-page--codex .chat-code-block {
  border: 1px solid #30363d;
}

.chat-page--codex .chat-code-block__header::before {
  content: '● ● ●';
  color: #f85149;
  letter-spacing: 4px;
  font-size: 10px;
  margin-right: 12px;
}

.chat-page--codex .chat-input-area__wrapper::before {
  content: '>';
  color: #3fb950;
  font-weight: 700;
  font-size: 16px;
  padding: 4px 4px 4px 4px;
  font-family: var(--chat-mono-family);
}

.chat-page--codex .chat-input-area__textarea {
  caret-color: #3fb950;
}

.chat-page--codex .chat-streaming-cursor::after {
  content: '█';
  background: none;
  color: #3fb950;
  width: auto;
  height: auto;
  font-family: var(--chat-mono-family);
  font-size: 16px;
  animation: cursor-blink 1s step-end infinite;
}

.chat-page--codex .chat-status-bar {
  background: #161b22;
  font-family: var(--chat-mono-family);
}

.chat-page--codex .chat-sidebar__search-input {
  background: #0d1117;
  border-color: #21262d;
  color: #c9d1d9;
}

/* 2. ChatGPT 极简 */
.chat-page--minimal {
  --chat-accent-color: #10a37f;
  --chat-user-bubble-bg: #10a37f;
  --chat-user-bubble-color: #fff;
  --chat-assistant-bg: #f7f7f8;
}

.chat-page--minimal .chat-sidebar {
  background: #f7f7f8;
}

.chat-page--minimal .chat-sidebar__item {
  border-radius: 8px;
  margin: 2px 8px;
  border-left: none;
}

.chat-page--minimal .chat-sidebar__item--active {
  background: #e5e5e5;
  border-left: none;
}

.chat-page--minimal .chat-message__bubble--user {
  border-radius: 18px 18px 4px 18px;
}

.chat-page--minimal .chat-message--assistant {
  border: none;
  border-radius: 8px;
}

.chat-page--minimal .chat-code-block {
  border: 1px solid #e5e5e5;
  background: #f7f7f8;
}

.chat-page--minimal .chat-code-block__header {
  background: #ececf1;
  border-bottom-color: #e5e5e5;
}

.chat-page--minimal .chat-code-block__pre {
  color: #2d333a;
}

.chat-page--minimal .chat-input-area__wrapper {
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #d1d5db;
}

.chat-page--minimal .chat-input-area__wrapper:focus-within {
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.2);
  border-color: #10a37f;
}

.chat-page--minimal .chat-inline-code {
  background: rgba(0, 0, 0, 0.05);
  color: #e83e8c;
}

/* 3. 客服工单 */
.chat-page--support {
  --chat-bg-primary: #f0f2f5;
  --chat-bg-secondary: #fff;
  --chat-accent-color: #1890ff;
  --chat-user-bubble-bg: #1890ff;
  --chat-user-bubble-color: #fff;
  --chat-sidebar-bg: #fff;
  --chat-sidebar-active: #e6f7ff;
  --chat-header-bg: #fff;
}

.chat-page--support .chat-sidebar__item::before {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  top: 18px;
  left: 12px;
}

.chat-page--support .chat-sidebar__item {
  position: relative;
  padding-left: 28px;
}

.chat-page--support .chat-header__customer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 16px;
  padding: 4px 14px;
  background: var(--chat-bg-primary);
  border-radius: 8px;
  font-size: 13px;
}

.chat-page--support .chat-header__customer-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.chat-page--support .chat-header__customer-plan {
  color: #faad14;
  font-size: 11px;
}

.chat-page--support .chat-input-area__quick-replies {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.chat-page--support .chat-input-area__quick-reply {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-page--support .chat-input-area__quick-reply:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.chat-page--support .chat-message--assistant {
  border-left: 3px solid #1890ff;
}

/* 4. 消息气泡 */
.chat-page--bubble {
  --chat-bg-primary: #ebe9e5;
  --chat-bg-secondary: #fff;
  --chat-accent-color: #007aff;
  --chat-user-bubble-bg: #007aff;
  --chat-user-bubble-color: #fff;
  --chat-assistant-bg: #fff;
  --chat-sidebar-bg: #fff;
  --chat-sidebar-active: #f0eeea;
}

.chat-page--bubble .chat-message__bubble--user {
  border-radius: 18px 18px 4px 18px;
  position: relative;
}

.chat-page--bubble .chat-message__bubble--user::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: -6px;
  width: 10px;
  height: 10px;
  background: var(--chat-user-bubble-bg);
  clip-path: polygon(0 0, 0 100%, 100% 100%);
}

.chat-page--bubble .chat-message--assistant {
  border: none;
  border-radius: 18px 18px 18px 4px;
  position: relative;
}

.chat-page--bubble .chat-message--assistant::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -6px;
  width: 10px;
  height: 10px;
  background: var(--chat-assistant-bg);
  clip-path: polygon(100% 0, 0 100%, 100% 100%);
}

.chat-page--bubble .chat-message__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--chat-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.chat-page--bubble .chat-code-block {
  background: #1a1a2e;
  border-radius: 12px;
  color: #e0e0e0;
}

.chat-page--bubble .chat-sidebar__item {
  border-radius: 10px;
  margin: 2px 8px;
  border-left: none;
}

.chat-page--bubble .chat-sidebar__item--active {
  border-left: none;
}

/* 5. IDE 对话 */
.chat-page--ide {
  --chat-bg-primary: #1e1e1e;
  --chat-bg-secondary: #252526;
  --chat-bg-tertiary: #2d2d2d;
  --chat-text-primary: #cccccc;
  --chat-text-secondary: #9d9d9d;
  --chat-text-muted: #6a6a6a;
  --chat-border-color: #3c3c3c;
  --chat-accent-color: #007acc;
  --chat-accent-hover: #1a8ad4;
  --chat-user-bubble-bg: #264f78;
  --chat-user-bubble-color: #cccccc;
  --chat-assistant-bg: #252526;
  --chat-sidebar-bg: #252526;
  --chat-sidebar-active: #37373d;
  --chat-header-bg: #323233;
  --chat-input-bg: #252526;
  --chat-input-border: #3c3c3c;
  --chat-code-bg: #1e1e1e;
  --chat-code-header-bg: #2d2d2d;
  --chat-code-color: #d4d4d4;
  font-family: 'Segoe UI', -apple-system, sans-serif;
}

.chat-page--ide .chat-sidebar__item {
  border-left: 3px solid transparent;
  font-size: 13px;
}

.chat-page--ide .chat-sidebar__item--active {
  border-left-color: #007acc;
}

.chat-page--ide .chat-header {
  min-height: 36px;
}

.chat-page--ide .chat-message--system .chat-message__system-text {
  color: #6a9955;
  font-style: italic;
  background: transparent;
}

.chat-page--ide .chat-message--assistant {
  border-radius: 0;
}

.chat-page--ide .chat-code-block__header::before {
  content: '{}';
  color: #569cd6;
  margin-right: 8px;
  font-weight: 700;
}

.chat-page--ide .chat-status-bar {
  background: #007acc;
  color: #fff;
  height: 22px;
  border: none;
}

.chat-page--ide .chat-status-bar__dot {
  background: #fff;
}

.chat-page--ide .chat-status-bar__divider {
  opacity: 0.5;
}

.chat-page--ide .chat-inline-code {
  background: rgba(206, 145, 120, 0.1);
  color: #ce9178;
}

/* 6. 深色玻璃 */
.chat-page--glass-dark {
  --chat-bg-primary: #0a0a0a;
  --chat-bg-secondary: rgba(255, 255, 255, 0.03);
  --chat-bg-tertiary: rgba(255, 255, 255, 0.06);
  --chat-text-primary: #e2e8f0;
  --chat-text-secondary: #94a3b8;
  --chat-text-muted: #64748b;
  --chat-border-color: rgba(255, 255, 255, 0.06);
  --chat-accent-color: #8b5cf6;
  --chat-accent-hover: #7c3aed;
  --chat-user-bubble-bg: rgba(139, 92, 246, 0.2);
  --chat-user-bubble-color: #e2e8f0;
  --chat-assistant-bg: rgba(255, 255, 255, 0.03);
  --chat-sidebar-bg: rgba(255, 255, 255, 0.02);
  --chat-sidebar-active: rgba(139, 92, 246, 0.15);
  --chat-header-bg: rgba(255, 255, 255, 0.02);
  --chat-input-bg: rgba(255, 255, 255, 0.03);
  --chat-input-border: rgba(255, 255, 255, 0.08);
  --chat-code-bg: rgba(0, 0, 0, 0.4);
  --chat-code-header-bg: rgba(0, 0, 0, 0.3);
  --chat-code-color: #d4d4d4;
}

.chat-page--glass-dark .chat-sidebar {
  backdrop-filter: blur(20px);
}

.chat-page--glass-dark .chat-sidebar__item {
  border-radius: 10px;
  margin: 2px 8px;
  border-left: none;
}

.chat-page--glass-dark .chat-sidebar__item:hover {
  background: rgba(139, 92, 246, 0.08);
}

.chat-page--glass-dark .chat-sidebar__item--active {
  border-left: none;
  box-shadow: inset 3px 0 0 #8b5cf6;
}

.chat-page--glass-dark .chat-header {
  backdrop-filter: blur(20px);
}

.chat-page--glass-dark .chat-header__model-dot {
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
}

.chat-page--glass-dark .chat-message--user .chat-message__bubble--user {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 18px 18px 4px 18px;
}

.chat-page--glass-dark .chat-message--assistant {
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.chat-page--glass-dark .chat-message--assistant:hover {
  border-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.05);
}

.chat-page--glass-dark .chat-code-block {
  backdrop-filter: blur(10px);
}

.chat-page--glass-dark .chat-input-area__wrapper {
  backdrop-filter: blur(20px);
}

.chat-page--glass-dark .chat-input-area__wrapper:focus-within {
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
}

.chat-page--glass-dark .chat-inline-code {
  background: rgba(139, 92, 246, 0.1);
  color: #c4b5fd;
}

.chat-page--glass-dark .chat-sidebar__search-input {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
}
</style>
