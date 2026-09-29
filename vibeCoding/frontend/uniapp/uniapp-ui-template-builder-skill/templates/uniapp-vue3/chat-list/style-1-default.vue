<template>
  <view class="chat-list-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input type="text" placeholder="搜索" />
      </view>
    </view>

    <!-- 会话列表 -->
    <view class="conversation-list">
      <view class="conversation-item" v-for="item in conversations" :key="item.id">
        <image class="avatar" :src="item.avatar" />
        <view class="conversation-info">
          <view class="conversation-header">
            <text class="name">{{ item.name }}</text>
            <text class="time">{{ item.time }}</text>
          </view>
          <view class="conversation-preview">
            <text class="preview-text">{{ item.lastMessage }}</text>
            <view v-if="item.unread > 0" class="badge">{{ item.unread }}</view>
          </view>
        </view>
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
      { id: 1, name: '文件传输助手', avatar: 'https://picsum.photos/80/80', time: '14:20', lastMessage: '文件已接收', unread: 0, online: false },
      { id: 2, name: '产品经理', avatar: 'https://picsum.photos/80/81', time: '13:45', lastMessage: '好的，明白了', unread: 2, online: true },
      { id: 3, name: 'UI设计组', avatar: 'https://picsum.photos/80/82', time: '11:30', lastMessage: '[图片]', unread: 5, online: false },
      { id: 4, name: '前端开发', avatar: 'https://picsum.photos/80/83', time: '昨天', lastMessage: '接口好了', unread: 0, online: true },
      { id: 5, name: '测试组', avatar: 'https://picsum.photos/80/84', time: '星期一', lastMessage: '测试报告已发送', unread: 1, online: false }
    ]
  }
})
</script>

<style lang="scss" scoped>
.chat-list-page { min-height: 100vh; background: #f5f5f5 }

.search-bar { padding: 12px 16px; background: #fff }
.search-input { display: flex; align-items: center; height: 36px; background: #f0f0f0; border-radius: 8px; padding: 0 12px }
.search-icon { font-size: 14px; margin-right: 8px }
.search-input input { flex: 1; font-size: 14px }

.conversation-list { background: #fff }
.conversation-item { display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f0f0f0 }
.avatar { width: 48px; height: 48px; border-radius: 8px; margin-right: 12px; flex-shrink: 0 }
.conversation-info { flex: 1; min-width: 0 }
.conversation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px }
.name { font-size: 15px; font-weight: 500; color: #1a1a1a }
.time { font-size: 12px; color: #999 }
.conversation-preview { display: flex; justify-content: space-between; align-items: center }
.preview-text { font-size: 13px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1 }
.badge { min-width: 18px; height: 18px; padding: 0 5px; background: #ff4d4f; color: #fff; font-size: 11px; border-radius: 9px; text-align: center; line-height: 18px; margin-left: 8px }
</style>
