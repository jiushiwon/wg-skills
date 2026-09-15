---
name: vue-chat-skill
description: Vue3 高端 AI 聊天页技能。6 种差异化风格（Codex 终端、ChatGPT 极简、客服工单、消息气泡、IDE 对话、深色玻璃），全部组件强制引用 vue-base-skill 现有组件（base-card）+ vue-button-skill（base-button）。触发词："Vue 聊天"、"chat page"、"AI 对话"、"聊天页"、"codex"、"终端对话"。
---

# Vue3 Chat Skill

Vue3 高端 PC 端 AI 聊天页技能，6 种真正差异化的视觉风格。

## 容器原则（铁律）

> **所有助手消息容器必须基于 `base-card` 实现，无例外。**

```vue
<template>
  <base-card class="chat-message chat-message--assistant">
    <!-- 消息内容 -->
  </base-card>
</template>
```

## 组件依赖（全部走现有组件库）

| 用到 | 来源 | 文件 |
|------|------|------|
| 消息卡片容器 | vue-base-skill | [base-card.md](../base-card.md) |
| 发送按钮 | vue-button-skill | [base-button.md](../vue-button-skill/base-button.md) |
| 操作按钮 | vue-button-skill | [base-button.md](../vue-button-skill/base-button.md) |

**禁止**自定义 div 实现按钮。所有原子组件必须从上述技能引用。

## 6 种风格

| 风格 | 核心差异 | 触发词 |
|------|----------|--------|
| **Codex 暗色终端** | 暗色终端、等宽字体、代码块、绿色强调、流式输出 | 默认、"codex"、"终端" |
| **ChatGPT 极简** | 纯白简洁、ChatGPT 风格、无衬线 | "minimal"、"chatgpt" |
| **客服工单** | 侧边栏工单列表、客户信息面板 | "support"、"客服" |
| **消息气泡** | iMessage/微信气泡、圆润、多彩 | "bubble"、"气泡" |
| **IDE 对话** | VS Code 暗色主题、分栏布局、代码为主 | "ide"、"vscode" |
| **深色玻璃** | 暗色毛玻璃、微光晕、高级感 | "glass"、"暗黑" |

## 标准 ChatPage（所有风格共用）

完整模板见 [templates/ChatPage.vue](./templates/ChatPage.vue)。所有风格的差异**仅在 CSS 变体**上，模板结构不变。

```vue
<template>
  <div class="chat-page" :class="`chat-page--${variant}`">
    <!-- 侧边栏 -->
    <aside v-if="showSidebar" class="chat-sidebar">
      <div class="chat-sidebar__header">
        <slot name="sidebar-header">
          <button class="chat-sidebar__new-btn" @click="$emit('conversation-select', '')">+ 新对话</button>
        </slot>
      </div>
      <div class="chat-sidebar__search">
        <input type="text" placeholder="搜索对话..." v-model="searchQuery" />
      </div>
      <div class="chat-sidebar__list">
        <div
          v-for="conv in filteredConversations"
          :key="conv.id"
          class="chat-sidebar__item"
          :class="{ 'chat-sidebar__item--active': conv.id === currentConversationId }"
          @click="$emit('conversation-select', conv.id)"
        >
          <div class="chat-sidebar__item-title">{{ conv.title }}</div>
          <div class="chat-sidebar__item-preview">{{ conv.lastMessage }}</div>
          <div class="chat-sidebar__item-time">{{ conv.timestamp }}</div>
          <span v-if="conv.unread" class="chat-sidebar__item-badge">{{ conv.unread }}</span>
        </div>
      </div>
    </aside>

    <!-- 主聊天区域 -->
    <main class="chat-main">
      <!-- 头部 -->
      <header v-if="showHeader" class="chat-header">
        <div class="chat-header__title">{{ title }}</div>
        <div class="chat-header__model">
          <span class="chat-header__model-dot" />
          {{ modelLabel }}
        </div>
        <div class="chat-header__actions">
          <slot name="header-actions" />
        </div>
      </header>

      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesRef">
        <template v-for="msg in messages" :key="msg.id">
          <div v-if="msg.role === 'system'" class="chat-message chat-message--system">
            <span class="chat-message__system-text">{{ msg.content }}</span>
          </div>
          <div v-else-if="msg.role === 'user'" class="chat-message chat-message--user">
            <div class="chat-message__bubble chat-message__bubble--user">
              <div class="chat-message__content">{{ msg.content }}</div>
              <div class="chat-message__time">{{ msg.timestamp }}</div>
            </div>
          </div>
          <base-card v-else class="chat-message chat-message--assistant">
            <div class="chat-message__avatar"><!-- SVG bot icon --></div>
            <div class="chat-message__body">
              <div class="chat-message__content" v-html="formatContent(msg.content)" />
              <div v-if="msg.code" class="chat-code-block">
                <div class="chat-code-block__header">
                  <span class="chat-code-block__lang">{{ msg.language || 'code' }}</span>
                  <button class="chat-code-block__copy" @click="copyCode(msg.code!)">复制</button>
                </div>
                <pre class="chat-code-block__pre"><code>{{ msg.code }}</code></pre>
              </div>
              <div class="chat-message__footer">
                <span class="chat-message__time">{{ msg.timestamp }}</span>
                <span v-if="msg.status === 'error'" class="chat-message__error">发送失败</span>
              </div>
            </div>
            <slot name="message-custom" :message="msg" />
          </base-card>
        </template>
        <div v-if="loading" class="chat-message chat-message--assistant chat-message--loading">
          <div class="chat-message__avatar"><!-- SVG bot icon --></div>
          <div class="chat-message__body">
            <div class="chat-typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        </div>
        <div v-if="streaming" class="chat-streaming-cursor" />
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-area">
        <div class="chat-input-area__wrapper">
          <button class="chat-input-area__attach" title="附件"><!-- SVG attach icon --></button>
          <textarea
            ref="inputRef"
            v-model="inputText"
            :placeholder="inputPlaceholder"
            class="chat-input-area__textarea"
            @keydown.enter.exact="handleSend"
            @input="autoResize"
          />
          <base-button
            type="primary"
            size="sm"
            :disabled="!inputText.trim() || streaming"
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
        <span class="chat-status-bar__dot" :class="connectionClass" />
        {{ connectionLabel }}
      </span>
      <span class="chat-status-bar__tokens">Tokens: {{ tokenCount }}</span>
      <span class="chat-status-bar__latency">延迟: {{ responseTime }}ms</span>
    </footer>
  </div>
</template>
```

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | 'codex' \| 'minimal' \| 'support' \| 'bubble' \| 'ide' \| 'glass-dark' | 'codex' | 视觉风格 |
| title | string | '新对话' | 当前对话标题 |
| modelLabel | string | 'Claude Sonnet' | 模型名称 |
| conversations | Conversation[] | [] | 对话列表 |
| messages | ChatMessage[] | [] | 当前对话消息 |
| showSidebar | boolean | true | 显示侧边栏 |
| showHeader | boolean | true | 显示头部 |
| showStatusBar | boolean | true | 显示状态栏 |
| loading | boolean | false | 等待响应中 |
| streaming | boolean | false | 流式输出中 |
| currentConversationId | string | '' | 当前对话 ID |
| connectionStatus | 'connected' \| 'connecting' \| 'disconnected' | 'connected' | 连接状态 |
| tokenCount | number | 0 | Token 计数 |
| responseTime | number | 0 | 响应时间(ms) |
| inputPlaceholder | string | '输入消息...' | 输入框占位符 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| send | `(message: string)` | 发送消息 |
| conversation-select | `(id: string)` | 选择对话 |
| conversation-delete | `(id: string)` | 删除对话 |
| retry | `(messageId: string)` | 重试消息 |
| stop | — | 停止流式输出 |

### Slots

| 插槽 | 说明 |
|------|------|
| sidebar-header | 侧边栏头部（新建对话按钮区域） |
| message-custom | 自定义消息扩展（消息下方附加内容） |
| input-extra | 输入区域额外内容（如模型选择器） |
| header-actions | 头部操作按钮 |

### Types

```typescript
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
```

---

## 文件结构

```
vue-chat-skill/
├── SKILL.md                       # 本文件
├── README.md
├── templates/
│   └── ChatPage.vue               # 标准聊天页组件（所有风格共用）
└── demo-components/
    ├── shared/
    │   ├── tokens.css             # 设计 Token
    │   └── demo.css               # 共享基础样式
    └── chat-page/
        └── html/
            ├── 00-showcase.html   # 6 种风格画廊
            ├── 01-codex.html      # Codex 暗色终端
            ├── 02-minimal.html    # ChatGPT 极简
            ├── 03-support.html    # 客服工单
            ├── 04-bubble.html     # 消息气泡
            ├── 05-ide.html        # IDE 对话
            └── 06-glass-dark.html # 深色玻璃
```

---

## 风格 CSS 变体

> 以下只展示**视觉差异部分**。Vue 模板统一引用 `templates/ChatPage.vue`。

### 形态一：Codex 暗色终端（默认）

```css
.chat-page--codex {
  background: #0d1117;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  color: #c9d1d9;
}

.chat-page--codex .chat-sidebar {
  background: #010409;
  border-right: 1px solid #21262d;
}

.chat-page--codex .chat-sidebar__item {
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.chat-page--codex .chat-sidebar__item--active {
  border-left-color: #3fb950;
  background: #161b22;
}

.chat-page--codex .chat-header {
  background: #161b22;
  border-bottom: 1px solid #21262d;
}

.chat-page--codex .chat-header__model-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3fb950;
  display: inline-block;
  box-shadow: 0 0 6px rgba(63, 185, 80, 0.5);
}

.chat-page--codex .chat-message--user .chat-message__bubble--user {
  background: transparent;
  border: 1px solid #30363d;
  color: #c9d1d9;
}

.chat-page--codex .chat-message--assistant {
  background: transparent;
  border: none;
  box-shadow: none;
}

.chat-page--codex .chat-message__avatar {
  color: #3fb950;
  font-size: 16px;
}

.chat-page--codex .chat-message--user .chat-message__role::before {
  content: 'You:';
  color: #58a6ff;
  font-weight: 600;
}

.chat-page--codex .chat-message--assistant .chat-message__role::before {
  content: 'Assistant:';
  color: #3fb950;
  font-weight: 600;
}

.chat-page--codex .chat-code-block {
  background: #161b22;
  border: 1px solid #30363d;
}

.chat-page--codex .chat-code-block__header {
  background: #21262d;
  border-bottom: 1px solid #30363d;
}

.chat-page--codex .chat-code-block__header::before {
  content: '● ● ●';
  color: #f85149;
  letter-spacing: 4px;
  font-size: 10px;
}

.chat-page--codex .chat-input-area__wrapper {
  background: #161b22;
  border: 1px solid #30363d;
}

.chat-page--codex .chat-input-area__wrapper::before {
  content: '>';
  color: #3fb950;
  font-weight: 700;
  padding: 0 8px 0 12px;
}

.chat-page--codex .chat-input-area__textarea {
  background: transparent;
  color: #c9d1d9;
  caret-color: #3fb950;
}

.chat-page--codex .chat-streaming-cursor::after {
  content: '█';
  color: #3fb950;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.chat-page--codex .chat-status-bar {
  background: #161b22;
  border-top: 1px solid #21262d;
  font-family: inherit;
  font-size: 12px;
  color: #8b949e;
}
```

### 形态二：ChatGPT 极简

```css
.chat-page--minimal {
  background: #fff;
  font-family: 'Söhne', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #2d333a;
}

.chat-page--minimal .chat-sidebar {
  background: #f7f7f8;
  border-right: 1px solid #e5e5e5;
}

.chat-page--minimal .chat-sidebar__item {
  border-radius: 8px;
  margin: 2px 8px;
  transition: background 0.15s;
}

.chat-page--minimal .chat-sidebar__item:hover {
  background: #ececf1;
}

.chat-page--minimal .chat-sidebar__item--active {
  background: #e5e5e5;
}

.chat-page--minimal .chat-header {
  border-bottom: 1px solid #e5e5e5;
}

.chat-page--minimal .chat-message--user .chat-message__bubble--user {
  background: #10a37f;
  color: #fff;
  border-radius: 18px 18px 4px 18px;
}

.chat-page--minimal .chat-message--assistant {
  background: #f7f7f8;
  border-radius: 8px;
  border: none;
}

.chat-page--minimal .chat-code-block {
  background: #f7f7f8;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.chat-page--minimal .chat-code-block__copy {
  color: #10a37f;
}

.chat-page--minimal .chat-input-area__wrapper {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.chat-page--minimal .chat-input-area__textarea:focus {
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.2);
}
```

### 形态三：客服工单

```css
.chat-page--support {
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a2e;
}

.chat-page--support .chat-sidebar {
  background: #fff;
  border-right: 1px solid #e8e8e8;
}

.chat-page--support .chat-sidebar__item::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  position: absolute;
  top: 14px;
  left: 8px;
}

.chat-page--support .chat-sidebar__item--active {
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.chat-page--support .chat-header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
}

.chat-page--support .chat-header__customer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 24px;
  padding: 6px 16px;
  background: #fafafa;
  border-radius: 8px;
}

.chat-page--support .chat-header__customer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.chat-page--support .chat-header__customer-info {
  font-size: 13px;
}

.chat-page--support .chat-header__customer-name {
  font-weight: 600;
}

.chat-page--support .chat-header__customer-plan {
  color: #faad14;
  font-size: 12px;
}

.chat-page--support .chat-message--user .chat-message__bubble--user {
  background: #1890ff;
  color: #fff;
}

.chat-page--support .chat-input-area__quick-replies {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
```

### 形态四：消息气泡

```css
.chat-page--bubble {
  background: #ebe9e5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a2e;
}

.chat-page--bubble .chat-sidebar {
  background: #fff;
  border-right: 1px solid #e0ddd9;
}

.chat-page--bubble .chat-sidebar__item--active {
  background: #f0eeea;
}

.chat-page--bubble .chat-message--user .chat-message__bubble--user {
  background: #007aff;
  color: #fff;
  border-radius: 18px 18px 4px 18px;
  position: relative;
}

.chat-page--bubble .chat-message--user .chat-message__bubble--user::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: -8px;
  width: 12px;
  height: 12px;
  background: #007aff;
  clip-path: polygon(0 0, 0 100%, 100% 100%);
}

.chat-page--bubble .chat-message--assistant .chat-message__bubble--assistant {
  background: #fff;
  border-radius: 18px 18px 18px 4px;
  position: relative;
}

.chat-page--bubble .chat-message--assistant .chat-message__bubble--assistant::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -8px;
  width: 12px;
  height: 12px;
  background: #fff;
  clip-path: polygon(100% 0, 0 100%, 100% 100%);
}

.chat-page--bubble .chat-code-block {
  background: #1a1a2e;
  border-radius: 12px;
  color: #e0e0e0;
}

.chat-page--bubble .chat-message__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 形态五：IDE 对话

```css
.chat-page--ide {
  background: #1e1e1e;
  font-family: 'Segoe UI', -apple-system, sans-serif;
  color: #cccccc;
}

.chat-page--ide .chat-sidebar {
  background: #252526;
  border-right: 1px solid #3c3c3c;
  width: 260px;
}

.chat-page--ide .chat-sidebar__item {
  border-left: 3px solid transparent;
  font-size: 13px;
}

.chat-page--ide .chat-sidebar__item--active {
  background: #37373d;
  border-left-color: #007acc;
}

.chat-page--ide .chat-header {
  background: #323233;
  border-bottom: 1px solid #3c3c3c;
  min-height: 36px;
}

.chat-page--ide .chat-message--system {
  color: #6a9955;
  font-style: italic;
}

.chat-page--ide .chat-message--user .chat-message__bubble--user {
  background: #264f78;
  color: #cccccc;
}

.chat-page--ide .chat-message--assistant {
  background: #252526;
  border: 1px solid #3c3c3c;
}

.chat-page--ide .chat-code-block {
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
}

.chat-page--ide .chat-code-block__header {
  background: #2d2d2d;
  border-bottom: 1px solid #3c3c3c;
  display: flex;
  align-items: center;
}

.chat-page--ide .chat-code-block__header::before {
  content: '{}';
  color: #569cd6;
  margin-right: 8px;
}

.chat-page--ide .chat-input-area__wrapper {
  background: #252526;
  border: 1px solid #3c3c3c;
}

.chat-page--ide .chat-input-area__textarea {
  background: transparent;
  color: #cccccc;
}

.chat-page--ide .chat-status-bar {
  background: #007acc;
  color: #fff;
  font-size: 12px;
  height: 22px;
}
```

### 形态六：深色玻璃

```css
.chat-page--glass-dark {
  background: #0a0a0a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #e2e8f0;
}

.chat-page--glass-dark .chat-sidebar {
  background: rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
}

.chat-page--glass-dark .chat-sidebar__item {
  border-radius: 10px;
  margin: 2px 8px;
  transition: all 0.2s;
}

.chat-page--glass-dark .chat-sidebar__item:hover {
  background: rgba(139, 92, 246, 0.1);
}

.chat-page--glass-dark .chat-sidebar__item--active {
  background: rgba(139, 92, 246, 0.15);
  border-left: 3px solid #8b5cf6;
}

.chat-page--glass-dark .chat-header {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
}

.chat-page--glass-dark .chat-header__model-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
}

.chat-page--glass-dark .chat-message--user .chat-message__bubble--user {
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #e2e8f0;
  backdrop-filter: blur(10px);
}

.chat-page--glass-dark .chat-message--assistant {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
}

.chat-page--glass-dark .chat-message--assistant:hover {
  border-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.05);
}

.chat-page--glass-dark .chat-code-block {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
}

.chat-page--glass-dark .chat-input-area__wrapper {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
}

.chat-page--glass-dark .chat-input-area__wrapper:focus-within {
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
}
```

---

## 不做

- 不处理后端 AI 接口（业务层实现）
- 不处理 Markdown 渲染引擎（业务层引入 marked/markdown-it）
- 不内置文件上传逻辑（业务层实现）
- 不处理 WebSocket 连接管理（业务层实现）
- 不处理消息持久化（业务层负责）
- 不自定义 div 模拟按钮（必须用 base-button）

## 依赖关系

```markdown
vue-chat-skill
├── vue-base-skill
│   └── base-card (助手消息容器)
└── vue-button-skill
    └── base-button (发送/操作按钮)
```
