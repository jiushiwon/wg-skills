<template>
  <view :data-theme="dark ? 'dark' : data.theme">
    <view v-if="!presentation" class="demo-panel">
      <text class="demo-heading">个人中心 · 五种业务布局</text><text class="demo-caption">可交互演示 / 本地模拟数据，无真实业务请求</text>
      <view class="demo-options"><BaseButton v-for="item in scenarios" :key="item.id" :type="scene === item.id ? 'primary' : 'ghost'" size="lg" :text="item.label" @click="switchScene(item.id)" /></view>
      <view class="demo-options"><BaseButton v-for="item in states" :key="item.id" :type="state === item.id ? 'primary' : 'ghost'" size="lg" :text="item.label" @click="setState(item.id)" /></view>
      <view class="demo-options"><BaseButton type="ghost" size="lg" :text="dark ? '浅色' : '暗色'" @click="dark = !dark" /><BaseButton type="ghost" size="lg" text="长昵称" @click="longName" /><BaseButton type="ghost" size="lg" text="图片失败" @click="brokenImages" /><BaseButton type="ghost" size="lg" text="恢复默认" @click="reset" /></view>
    </view>
    <ProfileGallery :data="data" :dark="dark" :state="state" :busy="busy" :active-tab="activeTab" :status-bar-height="statusHeight" @action="openAction" @product="openProduct" @checkin="checkin" @retry="setState('ready')" @login="setState('ready')" @tab="changeTab" />
    <BasePopup v-model:show="popupOpen" :title="popupTitle" direction="bottom">
      <view class="popup-content"><text class="popup-copy">{{ popupText }}</text><text class="demo-caption">当前是本地交互样例；未连接真实后端。</text><BaseButton size="lg" block text="关闭" @click="popupOpen = false" /></view>
    </BasePopup>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import ProfileGallery from '@/skills/uniapp-ui-template-builder-skill/templates/uniapp-vue3/profile-gallery/profile-gallery.vue'
import BaseButton from '@/skills/uniapp-base-skill/components/form/base-button/index.vue'
import BasePopup from '@/skills/uniapp-base-skill/containers/base-popup/index.vue'
import { createMockProfile, scenarios } from '../api/_mocks_/profiles'
import type { Scenario, PageState, ProfileAction, ProfileProduct } from '@/skills/uniapp-ui-template-builder-skill/templates/uniapp-vue3/profile-gallery/types'
const dark = ref(false)
const scene = ref<Scenario>('simple')
const data = ref(createMockProfile(scene.value))
const state = ref<PageState>('ready')
const presentation = ref(false)
const activeTab = ref('profile')
const busy = ref(false)
const popupOpen = ref(false)
const popupTitle = ref('')
const popupText = ref('')
const statusHeight = ref('0px')
const states: { id: PageState; label: string }[] = [{id:'ready',label:'默认'},{id:'guest',label:'未登录'},{id:'loading',label:'加载'},{id:'error',label:'失败'},{id:'empty',label:'空商品'}]
function handleTheme(event: { theme: string }) { dark.value = event.theme === 'dark' }
onUnload(() => { if (typeof uni.offThemeChange === 'function') uni.offThemeChange(handleTheme) })
onLoad(options => {
  try { dark.value = uni.getSystemInfoSync().theme === 'dark' } catch {}
  if (typeof uni.onThemeChange === 'function') uni.onThemeChange(handleTheme)
  if (options && scenarios.some(item => item.id === options.scene)) switchScene(options.scene as Scenario)
  presentation.value = options?.preview === '1'
  try { statusHeight.value = `${uni.getWindowInfo().statusBarHeight || 0}px` } catch { statusHeight.value = '0px' }
})
function switchScene(value: Scenario) { scene.value=value; data.value=createMockProfile(value); state.value='ready'; activeTab.value='profile'; popupOpen.value=false }
function setState(value: PageState) { state.value=value }
function reset() { if (busy.value) return; switchScene(scene.value) }
function longName() { data.value.nickname='这是一位昵称很长很长但仍应完整显示的用户' }
function brokenImages() { data.value.avatar='/static/missing-avatar.png'; data.value.products=data.value.products.map(item=>({...item,image:'/static/missing-product.png'})) }
function show(title: string, content: string) { popupTitle.value=title;popupText.value=content;popupOpen.value=true }
function openAction(item: ProfileAction) {
  const descriptions: Record<string,string> = {tracking:'包裹已到达配送站，预计明日送达。',appointment:data.value.appointment,approval:'共有 3 条待审批记录，可在接入项目后连接审批列表。',organization:'当前企业：'+data.value.organization+'。企业切换应由真实组织权限决定。',profile:'当前用户：'+data.value.nickname+'。可在业务项目接入资料编辑表单。',security:'账号与权限应由认证服务管理，此处仅展示入口反馈。'}
  show(item.label, descriptions[item.id] || `你选择了「${item.label}」。业务列表或详情接口尚未接入。`)
}
function openProduct(item: ProfileProduct) { show(item.name, `${item.price} ${item.unit}。这里只展示详情，不创建订单、不扣减积分。`) }
function changeTab(key: string) { activeTab.value=key;if(key!=='profile')show('导航演示', '已选择'+({home:'首页',services:'服务',messages:'消息'}[key]||key)+'。当前交付个人中心页面，其余业务页面待接入。') }
async function checkin() {
  if (busy.value || data.value.checkedIn) return
  busy.value=true
  const current=data.value
  try {
    await new Promise(resolve=>setTimeout(resolve,350))
    current.checkedIn=true;current.points+=10;current.progress=Math.min(100,Math.round(current.points/3000*100))
    if(data.value===current)uni.showToast({title:'签到成功，积分 +10',icon:'none'})
  } finally { busy.value=false }
}
</script>
<style scoped>
.demo-panel { padding: var(--space-6, 24rpx); background: var(--bg-card, #ffffff); border-bottom: 1px solid var(--border, #e5e5e5); }
.demo-heading { display:block;font-size:var(--font-xl, 32rpx);font-weight:650;color:var(--text-primary, #171717); }
.demo-caption { display:block;font-size:var(--font-xs, 24rpx);line-height:1.7;color:var(--text-secondary, #525252); }
.demo-options { display:flex;flex-wrap:wrap;gap:var(--space-3, 12rpx);margin-top:var(--space-4, 16rpx); }
.popup-content { display:flex;flex-direction:column;gap:var(--space-6, 24rpx);padding:var(--space-4, 16rpx) 0; }
.popup-copy { font-size:var(--font-md, 28rpx);color:var(--text-primary, #171717);line-height:1.8; }
</style>
