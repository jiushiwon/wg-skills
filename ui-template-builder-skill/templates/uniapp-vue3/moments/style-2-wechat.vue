<template>
  <view class="moments-wechat">
    <!-- 头部 -->
    <view class="header">
      <image class="cover" :src="user.cover" mode="aspectFill" />
      <view class="user-row">
        <image class="avatar" :src="user.avatar" />
        <view class="user-info">
          <text class="nickname">{{ user.nickname }}</text>
        </view>
      </view>
    </view>

    <!-- 朋友圈列表 -->
    <view class="moments">
      <view class="moment" v-for="item in moments" :key="item.id">
        <image class="moment-avatar" :src="item.avatar" />
        <view class="moment-body">
          <text class="moment-name">{{ item.name }}</text>
          <text class="moment-text">{{ item.content }}</text>
          <view v-if="item.images && item.images.length" class="moment-pics">
            <image v-for="(pic, i) in item.images" :key="i" :src="pic" mode="aspectFill" />
          </view>
          <view class="moment-footer">
            <text class="moment-time">{{ item.time }}</text>
            <view class="moment-action">
              <text class="action-btn">👍 {{ item.likes }}</text>
              <text class="action-btn">💬 {{ item.comments }}</text>
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
        images: ['https://picsum.photos/200/200'],
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
          'https://picsum.photos/150/150',
          'https://picsum.photos/150/151',
          'https://picsum.photos/150/152'
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
.moments-wechat { min-height: 100vh; background: #ededed }

.header { position: relative; height: 180px; overflow: hidden }
.cover { width: 100%; height: 100% }
.user-row { position: absolute; bottom: -20px; left: 20px; display: flex; align-items: flex-end }
.avatar { width: 64px; height: 64px; border-radius: 6px; border: 2px solid #fff; margin-right: 12px }
.nickname { font-size: 18px; font-weight: 600; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5) }

.moments { padding: 30px 16px 16px }
.moment { display: flex; margin-bottom: 16px }
.moment-avatar { width: 40px; height: 40px; border-radius: 4px; margin-right: 10px; flex-shrink: 0 }
.moment-body { flex: 1; min-width: 0 }
.moment-name { font-size: 14px; font-weight: 500; color: #576b95; margin-right: 6px }
.moment-text { font-size: 14px; color: #333; line-height: 1.5; display: block }

.moment-pics { display: flex; flex-wrap: wrap; gap: 3px; margin: 8px 0 }
.moment-pics image { width: 31%; height: 100px; border-radius: 2px }

.moment-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 6px }
.moment-time { font-size: 12px; color: #999 }
.moment-action { display: flex; gap: 12px }
.action-btn { font-size: 12px; color: #777 }
</style>
