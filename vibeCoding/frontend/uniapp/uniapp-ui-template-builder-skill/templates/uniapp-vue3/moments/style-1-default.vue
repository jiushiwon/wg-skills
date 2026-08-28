<template>
  <view class="moments-page">
    <!-- 头部 -->
    <view class="moments-header">
      <image class="header-bg" :src="user.cover" mode="aspectFill" />
      <view class="header-info">
        <image class="avatar" :src="user.avatar" />
        <text class="username">{{ user.nickname }}</text>
      </view>
    </view>

    <!-- 动态列表 -->
    <view class="moments-list">
      <view class="moment-item" v-for="(item, index) in moments" :key="index">
        <image class="moment-avatar" :src="item.avatar" />
        <view class="moment-content">
          <view class="moment-header">
            <text class="moment-name">{{ item.name }}</text>
            <text class="moment-time">{{ item.time }}</text>
          </view>
          <view class="moment-text">{{ item.content }}</view>
          <!-- 单图 -->
          <view v-if="item.images && item.images.length === 1" class="moment-images moment-images--1">
            <image v-for="(img, i) in item.images" :key="i" :src="img" mode="aspectFill" />
          </view>
          <!-- 多图 -->
          <view v-if="item.images && item.images.length > 1" class="moment-images moment-images--multi">
            <image v-for="(img, i) in item.images" :key="i" :src="img" mode="aspectFill" />
          </view>
          <!-- 点赞评论 -->
          <view class="moment-actions">
            <view class="action-item">
              <text class="action-icon">👍</text>
              <text class="action-count">{{ item.likes }}</text>
            </view>
            <view class="action-item">
              <text class="action-icon">💬</text>
              <text class="action-count">{{ item.comments }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
// 通过 props 接收数据，结构参考同目录 mock.json
const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      nickname: '用户昵称',
      avatar: 'https://picsum.photos/100/100',
      cover: 'https://picsum.photos/750/300'
    })
  },
  moments: {
    type: Array,
    default: () => [
      {
        id: 1,
        name: '张三',
        avatar: 'https://picsum.photos/80/80',
        time: '2小时前',
        content: '今天天气真好，出去走走！',
        images: ['https://picsum.photos/300/300'],
        likes: 12,
        comments: 3
      },
      {
        id: 2,
        name: '李四',
        avatar: 'https://picsum.photos/80/81',
        time: '5小时前',
        content: '新买的手机到了，开心！🎉',
        images: [
          'https://picsum.photos/200/200',
          'https://picsum.photos/200/201',
          'https://picsum.photos/200/202',
          'https://picsum.photos/200/203'
        ],
        likes: 28,
        comments: 5
      },
      {
        id: 3,
        name: '王五',
        avatar: 'https://picsum.photos/80/82',
        time: '昨天',
        content: '学习Vue3中，组合式API真香！',
        images: [],
        likes: 45,
        comments: 8
      }
    ]
  }
})
</script>

<style lang="scss" scoped>
.moments-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.moments-header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.header-bg {
  width: 100%;
  height: 100%;
}

.header-info {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: flex-end;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  border: 2px solid #fff;
  margin-right: 12px;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.moments-list {
  padding: 16px;
}

.moment-item {
  display: flex;
  margin-bottom: 20px;
}

.moment-avatar {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  margin-right: 12px;
  flex-shrink: 0;
}

.moment-content {
  flex: 1;
  min-width: 0;
}

.moment-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.moment-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-right: 8px;
}

.moment-time {
  font-size: 12px;
  color: #999;
}

.moment-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 10px;
}

.moment-images {
  margin-bottom: 10px;
}

.moment-images--1 image {
  width: 200px;
  height: 200px;
  border-radius: 8px;
}

.moment-images--multi {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.moment-images--multi image {
  width: 110px;
  height: 110px;
  border-radius: 4px;
}

.moment-actions {
  display: flex;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-icon {
  font-size: 14px;
}

.action-count {
  font-size: 12px;
  color: #666;
}
</style>
