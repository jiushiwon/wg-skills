<template>
  <view class="moments-card">
    <!-- 头部 -->
    <view class="profile-card">
      <image class="cover" :src="profile.cover" mode="aspectFill" />
      <view class="profile-info">
        <image class="avatar" :src="profile.avatar" />
        <text class="name">{{ profile.name }}</text>
        <text class="desc">{{ profile.desc }}</text>
      </view>
    </view>

    <!-- 瀑布流 -->
    <view class="waterfall">
      <view class="waterfall-item" v-for="item in feed" :key="item.id">
        <image :src="item.img" mode="widthFix" />
        <view class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <view class="item-user">
            <image :src="item.userImg" class="user-img" />
            <text class="user-name">{{ item.user }}</text>
          </view>
          <view class="item-stats">
            <span>❤️ {{ item.like }}</span>
            <span>💬 {{ item.comment }}</span>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
// 通过 props 接收数据，结构参考同目录 mock.json（用户/动态列表可映射为瀑布流数据）
const props = defineProps({
  profile: {
    type: Object,
    default: () => ({
      cover: 'https://picsum.photos/750/200',
      avatar: 'https://picsum.photos/120/120',
      name: '小红书',
      desc: '记录美好生活'
    })
  },
  feed: {
    type: Array,
    default: () => [
      { id: 1, img: 'https://picsum.photos/300/400', title: '周末野餐好去处', user: '户外达人', userImg: 'https://picsum.photos/40/40', like: 234, comment: 45 },
      { id: 2, img: 'https://picsum.photos/300/350', title: '今日穿搭分享', user: '时尚博主', userImg: 'https://picsum.photos/40/41', like: 567, comment: 89 },
      { id: 3, img: 'https://picsum.photos/300/380', title: '美食制作教程', user: '厨房小能手', userImg: 'https://picsum.photos/40/42', like: 890, comment: 123 },
      { id: 4, img: 'https://picsum.photos/300/420', title: '旅行日记', user: '背包客', userImg: 'https://picsum.photos/40/43', like: 456, comment: 67 }
    ]
  }
})
</script>

<style lang="scss" scoped>
.moments-card { min-height: 100vh; background: #f8f8f8 }

.profile-card { position: relative; margin-bottom: 16px }
.cover { width: 100%; height: 180px }
.profile-info { position: absolute; bottom: -30px; left: 20px; display: flex; flex-direction: column }
.avatar { width: 70px; height: 70px; border-radius: 50%; border: 3px solid #fff; margin-bottom: 8px }
.name { font-size: 18px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.3) }
.desc { font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 2px }

.waterfall { display: flex; gap: 8px; padding: 40px 12px 12px }
.waterfall-item { flex: 1; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06) }
.waterfall-item image { width: 100% }
.item-info { padding: 10px }
.item-title { font-size: 13px; color: #333; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden }
.item-user { display: flex; align-items: center; gap: 6px; margin-top: 8px }
.user-img { width: 20px; height: 20px; border-radius: 50% }
.user-name { font-size: 11px; color: #666 }
.item-stats { display: flex; gap: 10px; margin-top: 6px }
.item-stats span { font-size: 11px; color: #999 }
</style>
