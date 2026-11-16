<template>
  <ProfileScenic :data="profile" :status-bar-height="statusHeight" @action="onAction" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ProfileScenic from './profile-scenic.vue'
import { createScenicProfile } from './mock'
import type { ProfileAction } from './types'

const statusHeight = ref('0px')
onLoad(() => {
  try { statusHeight.value = `${uni.getWindowInfo().statusBarHeight || 0}px` } catch {}
})
const profile = createScenicProfile('solid')
profile.nickname = '微信用户'

function onAction(item: ProfileAction) {
  // 接入项目时替换为真实路由或业务操作
  uni.showToast({ title: item.label, icon: 'none' })
}
</script>
