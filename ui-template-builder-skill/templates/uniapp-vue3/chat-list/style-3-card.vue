<template>
  <view class="chat-card">
    <!-- 头部 -->
    <view class="header">
      <text class="title">{{ title }}</text>
      <view class="header-actions">
        <text class="action-icon">🔍</text>
        <text class="action-icon">➕</text>
      </view>
    </view>

    <!-- 消息列表 -->
    <view class="message-list">
      <view class="message-card" v-for="item in conversations" :key="item.id">
        <view class="card-left">
          <image class="card-avatar" :src="item.avatar" />
          <view v-if="item.unread" class="unread-dot"></view>
        </view>
        <view class="card-body">
          <view class="card-header">
            <text class="card-name">{{ item.name }}</text>
            <text class="card-time">{{ item.time }}</text>
          </view>
          <text class="card-msg">{{ item.lastMessage }}</text>
        </view>
        <view v-if="item.unread" class="card-badge">{{ item.unread }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
// 通过 props 接收数据，结构参考同目录 mock.json
const props = defineProps({
  title: {
    type: String,
    default: '消息'
  },
  conversations: {
    type: Array,
    default: () => [
      { id: 1, name: '工作群', avatar: 'https://picsum.photos/80/80', time: '15:20', lastMessage: '王五: 好的', unread: 5 },
      { id: 2, name: '产品设计', avatar: 'https://picsum.photos/80/81', time: '14:50', lastMessage: '新配色方案已更新', unread: 2 },
      { id: 3, name: '李经理', avatar: 'https://picsum.photos/80/82', time: '13:30', lastMessage: '收到，谢谢！', unread: 0 },
      { id: 4, name: '技术交流', avatar: 'https://picsum.photos/80/83', time: '12:00', lastMessage: '[代码片段]', unread: 8 },
      { id: 5, name: 'HR通知', avatar: 'https://picsum.photos/80/84', time: '11:20', lastMessage: '本周五团建', unread: 1 }
    ]
  }
})
</script>

<style lang="scss" scoped>
.chat-card { min-height: 100vh; background: #f8f9fa }

.header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #fff; border-bottom: 1px solid #eee }
.title { font-size: 22px; font-weight: 700; color: #1a1a1a }
.header-actions { display: flex; gap: 16px }
.action-icon { font-size: 18px }

.message-list { padding: 12px }
.message-card { display: flex; align-items: center; background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04) }

.card-left { position: relative; margin-right: 14px }
.card-avatar { width: 52px; height: 52px; border-radius: 14px }
.unread-dot { position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background: #ff4d4f; border-radius: 50%; border: 2px solid #fff }

.card-body { flex: 1; min-width: 0 }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px }
.card-name { font-size: 16px; font-weight: 600; color: #1a1a1a }
.card-time { font-size: 12px; color: #999 }
.card-msg { font-size: 13px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block }

.card-badge { min-width: 22px; height: 22px; padding: 0 6px; background: #ff4d4f; color: #fff; font-size: 12px; font-weight: 600; border-radius: 11px; text-align: center; line-height: 22px; margin-left: 8px }
</style>
