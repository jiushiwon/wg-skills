<template>
  <view class="chat-wechat">
    <!-- 顶部 -->
    <view class="top-bar">
      <text class="top-title">{{ title }}</text>
    </view>

    <!-- 列表 -->
    <view class="chat-items">
      <view class="chat-item" v-for="item in conversations" :key="item.id">
        <view class="item-avatar">
          <image :src="item.avatar" />
          <view v-if="item.online" class="online-dot"></view>
        </view>
        <view class="item-content">
          <view class="item-header">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-time">{{ item.time }}</text>
          </view>
          <text class="item-msg">{{ item.lastMessage }}</text>
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
.chat-wechat { min-height: 100vh; background: #ededed }

.top-bar { padding: 12px 16px; background: #f7f7f7; text-align: center }
.top-title { font-size: 16px; font-weight: 600; color: #1a1a1a }

.chat-items { background: #fff }
.chat-item { display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e8e8e8 }
.item-avatar { position: relative; width: 44px; height: 44px; margin-right: 12px; flex-shrink: 0 }
.item-avatar image { width: 100%; height: 100%; border-radius: 4px }
.online-dot { position: absolute; right: -2px; bottom: -2px; width: 10px; height: 10px; background: #07c160; border-radius: 50%; border: 2px solid #fff }

.item-content { flex: 1; min-width: 0 }
.item-header { display: flex; justify-content: space-between; margin-bottom: 2px }
.item-name { font-size: 15px; color: #1a1a1a }
.item-time { font-size: 12px; color: #999 }
.item-msg { font-size: 13px; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block }
</style>
