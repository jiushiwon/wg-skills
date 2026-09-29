<template>
  <view class="moments-page">
    <!-- 顶部封面 -->
    <view class="moments-header">
      <image class="cover-image" :src="cover" mode="aspectFill" />
      <view class="user-bar">
        <text class="user-name">{{ user.nickname }}</text>
        <image class="user-avatar" :src="user.avatar" mode="aspectFill" />
      </view>
    </view>

    <!-- 动态列表 -->
    <view class="moments-list">
      <view class="moment-item" v-for="(item, index) in list" :key="item.id">
        <image class="moment-avatar" :src="item.user.avatar" mode="aspectFill" />
        <view class="moment-content">
          <text class="moment-name">{{ item.user.nickname }}</text>
          <text class="moment-text">{{ item.content }}</text>

          <!-- 图片网格 -->
          <view class="moment-images" v-if="item.images && item.images.length" :class="'grid-' + imageGridClass(item.images.length)">
            <image
              v-for="(img, imgIndex) in item.images"
              :key="imgIndex"
              class="moment-image"
              :src="img"
              mode="aspectFill"
              @click="previewImage(item.images, imgIndex)"
            />
          </view>

          <view class="moment-meta">
            <text class="moment-time">{{ item.time }}</text>
            <view class="moment-actions">
              <view class="action-btn" @click="toggleLike(index)">
                <view class="icon-svg">
                  <svg viewBox="0 0 24 24" :fill="item.isLiked ? '#FF2D55' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </view>
                <text class="action-count" :class="{ active: item.isLiked }">{{ item.likes }}</text>
              </view>
              <view class="action-btn" @click="showComment(index)">
                <view class="icon-svg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </view>
                <text class="action-count">{{ item.comments }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  cover: {
    type: String,
    default: 'https://picsum.photos/750/300'
  },
  user: {
    type: Object,
    default: () => ({
      nickname: '我',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'
    })
  },
  list: {
    type: Array,
    default: () => [
      {
        id: 'm001',
        user: {
          nickname: '好友A',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=friendA'
        },
        content: '今天天气不错，出去走走～',
        images: [
          'https://picsum.photos/300/300?random=1',
          'https://picsum.photos/300/300?random=2',
          'https://picsum.photos/300/300?random=3'
        ],
        time: '10分钟前',
        likes: 12,
        comments: 3,
        isLiked: false
      },
      {
        id: 'm002',
        user: {
          nickname: '好友B',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=friendB'
        },
        content: '分享一张喜欢的照片。',
        images: ['https://picsum.photos/300/300?random=4'],
        time: '1小时前',
        likes: 8,
        comments: 1,
        isLiked: true
      }
    ]
  }
})

const emit = defineEmits(['update:list'])

const momentList = ref(props.list.map(item => ({ ...item })))

watch(() => props.list, (val) => {
  momentList.value = val.map(item => ({ ...item }))
}, { deep: true })

function imageGridClass(count) {
  if (count === 1) return 'one'
  if (count === 2 || count === 4) return 'two'
  return 'three'
}

function previewImage(images, current) {
  uni.previewImage({
    current: images[current],
    urls: images
  })
}

function toggleLike(index) {
  const item = momentList.value[index]
  if (!item) return
  item.isLiked = !item.isLiked
  item.likes += item.isLiked ? 1 : -1
  emit('update:list', momentList.value)
}

function showComment(index) {
  uni.showToast({ title: '评论功能', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.moments-page {
  min-height: 100vh;
  background: #FFFFFF;
}

.icon-svg {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
  }
}

.moments-header {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.user-bar {
  position: absolute;
  bottom: -20px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 24px;
}

.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  border: 2px solid #FFFFFF;
  background: #F5F5F7;
}

.moments-list {
  padding: 36px 16px 20px;
}

.moment-item {
  display: flex;
  gap: 10px;
  padding: 16px 0;
  border-bottom: 1px solid #F5F5F7;

  &:last-child {
    border-bottom: none;
  }
}

.moment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #F5F5F7;
  flex-shrink: 0;
}

.moment-content {
  flex: 1;
  min-width: 0;
}

.moment-name {
  font-size: 14px;
  font-weight: 600;
  color: #576B95;
  margin-bottom: 6px;
  display: block;
}

.moment-text {
  font-size: 14px;
  color: #1D1D1F;
  line-height: 1.6;
  display: block;
  margin-bottom: 8px;
}

.moment-images {
  display: grid;
  gap: 4px;
  margin-bottom: 10px;

  &.grid-one {
    grid-template-columns: 1fr;
    max-width: 180px;
  }

  &.grid-two {
    grid-template-columns: repeat(2, 1fr);
    max-width: 220px;
  }

  &.grid-three {
    grid-template-columns: repeat(3, 1fr);
    max-width: 240px;
  }
}

.moment-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  background: #F5F5F7;
}

.moment-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.moment-time {
  font-size: 12px;
  color: #999999;
}

.moment-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666666;
}

.action-count {
  font-size: 12px;
  color: #666666;

  &.active {
    color: #FF2D55;
  }
}
</style>
