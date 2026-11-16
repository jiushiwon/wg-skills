<template>
 <view :data-theme="dark ? 'dark' : data.theme">
  <view v-if="!presentation" class="controls"><text class="heading">个人中心第二组 · 场景背景</text><text class="caption">共享模板 / 本地模拟交互，未连接业务服务</text><view class="options"><BaseButton v-for="option in scenicOptions" :key="option.id" size="lg" :type="data.id === option.id ? 'primary' : 'ghost'" :text="option.title" @click="switchScene(option.id)" /></view><view class="options"><BaseButton v-for="option in states" :key="option.id" type="ghost" size="lg" :text="option.title" @click="state=option.id" /><BaseButton type="ghost" size="lg" text="图片失败" @click="breakImages" /><BaseButton type="ghost" size="lg" text="长昵称" @click="data.nickname='昵称很长很长也不应该遮住操作按钮和头像'" /><BaseButton type="ghost" size="lg" text="切换深色" @click="dark=!dark" /><BaseButton size="lg" text="恢复默认" @click="switchScene(data.id)" /></view></view>
  <ProfileScenic :data="data" :state="state" :dark="dark" :checked-in="checkedIn" :busy="busy" :active-tab="activeTab" :status-bar-height="statusHeight" @action="openAction" @retry="state='ready'" @login="state='ready'" @checkin="checkin" @tab="onTab" />
  <BasePopup v-model:show="popup" :title="popupTitle" direction="bottom"><text class="popup-text">{{ popupText }}</text><BaseButton size="lg" block text="关闭" @click="popup=false" /></BasePopup>
 </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import ProfileScenic from '@/skills/uniapp-ui-template-builder-skill/templates/uniapp-vue3/profile-scenic/profile-scenic.vue'
import { createScenicProfile, scenicOptions } from '@/skills/uniapp-ui-template-builder-skill/templates/uniapp-vue3/profile-scenic/mock'
import type { ScenicId, PageState, ProfileAction } from '@/skills/uniapp-ui-template-builder-skill/templates/uniapp-vue3/profile-scenic/types'
import BaseButton from '@/skills/uniapp-base-skill/components/form/base-button/index.vue'
import BasePopup from '@/skills/uniapp-base-skill/containers/base-popup/index.vue'
const data=ref(createScenicProfile('glacier')), state=ref<PageState>('ready'), dark=ref(false), checkedIn=ref(false), busy=ref(false), activeTab=ref('profile'), statusHeight=ref('0px'), presentation=ref(false)
const popup=ref(false),popupTitle=ref(''),popupText=ref('')
const states: {id:PageState;title:string}[]=[{id:'ready',title:'默认'},{id:'guest',title:'未登录'},{id:'loading',title:'加载中'},{id:'error',title:'失败'},{id:'empty',title:'空记录'}]
let pending: ReturnType<typeof setTimeout> | undefined
onLoad(options=>{if(options?.scene&&scenicOptions.some(x=>x.id===options.scene))switchScene(options.scene as ScenicId);presentation.value=options?.preview==='1';try{statusHeight.value=`${uni.getWindowInfo().statusBarHeight||0}px`}catch{}})
onUnload(()=>{if(pending)clearTimeout(pending)})
function switchScene(id:ScenicId){if(pending)clearTimeout(pending);busy.value=false;checkedIn.value=false;data.value=createScenicProfile(id);state.value='ready';dark.value=false;activeTab.value='profile';popup.value=false}
function breakImages(){data.value.image.backgroundSrc='/static/missing-background.png';data.value.image.bannerSrc='/static/missing-banner.png';data.value.avatar='/static/missing-avatar.png'}
function openAction(item:ProfileAction){popupTitle.value=item.label;popupText.value=`你选择了「${item.label}」。当前为本地模拟反馈，未创建订单、扣费或提交真实业务。`;popup.value=true}
function onTab(key:string){activeTab.value=key;if(key!=='profile')openAction({id:key,label:'导航演示',icon:'house'})}
function checkin(){if(busy.value||checkedIn.value)return;busy.value=true;pending=setTimeout(()=>{checkedIn.value=true;busy.value=false;pending=undefined},300)}
</script>
<style scoped>
.controls{padding:var(--space-6,24rpx);background:var(--bg-card,#fff)}.heading{display:block;font-size:var(--font-xl,32rpx);font-weight:650}.caption{display:block;font-size:var(--font-xs,24rpx);color:var(--text-secondary,#525252)}.options{display:flex;flex-wrap:wrap;gap:var(--space-3,12rpx);margin-top:var(--space-4,16rpx)}.popup-text{display:block;padding:var(--space-6,24rpx) 0;font-size:var(--font-md,28rpx);line-height:1.8;color:var(--text-primary,#171717)}
</style>
