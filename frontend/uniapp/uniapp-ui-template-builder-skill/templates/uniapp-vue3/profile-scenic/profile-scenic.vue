<template>
  <view class="scenic-shell" :data-theme="effectiveTheme">
    <view class="scenic-stage" :class="{ 'is-solid': data.backgroundMode === 'solid-rings' }">
      <view v-if="data.backgroundMode === 'solid-rings'" class="solid-decoration" aria-hidden="true"><view class="solid-circle circle-one" /><view class="solid-circle circle-two" /><view class="solid-circle circle-three" /></view>
      <image v-if="data.backgroundMode !== 'solid-rings' && data.image.backgroundSrc && !backgroundFailed" class="scenic-art" :src="data.image.backgroundSrc" mode="widthFix" aria-hidden="true" @error="backgroundFailed = true" />
      <view class="scenic-layer">
        <BaseNavbar :title="data.title" :show-back="false" transparent :status-bar-height="statusBarHeight"><template #title><text class="nav-title">{{ data.title }}</text></template></BaseNavbar>
        <view class="scenic-content">
          <BaseCard v-if="state !== 'ready' && state !== 'empty'" :padding="padding">
            <Empty v-if="state === 'error'" text="页面加载失败" description="请稍后重试" action-text="重试" @action-click="emit('retry')" />
            <Empty v-else-if="state === 'guest'" text="登录后查看你的个人中心" action-text="模拟登录" @action-click="emit('login')" />
            <text v-else class="copy" aria-busy="true">正在加载个人中心…</text>
          </BaseCard>
          <template v-else>
            <BaseCard :padding="padding" :background="heroBackground" :radius="radius">
              <text class="eyebrow">{{ data.english }}</text><text class="slogan">{{ data.slogan }}</text><text class="copy">{{ data.description }}</text>
              <view class="identity"><BaseAvatar :src="data.avatar" :name="data.nickname" size="lg" @click="action('profile', '个人资料')" /><view class="grow"><text class="name">{{ data.nickname }}</text><text class="caption">{{ data.subtitle }}</text></view><BaseButton type="ghost" size="lg" text="编辑" @click="action('profile', '个人资料')" /></view>
            </BaseCard>
            <BaseCard v-if="state === 'empty'" :padding="padding"><Empty text="还没有相关记录" description="资料仍可编辑，去发现更多内容" /></BaseCard>
            <template v-else v-for="module in data.modules" :key="module.id">
              <view v-if="module.kind === 'duo'" class="duo">
                <BaseCard v-for="item in module.items" :key="item.id" :padding="padding" :radius="radius" clickable @click="emit('action', item)"><image class="icon" :src="icon(item.icon)" mode="aspectFit" /><text class="name">{{ item.label }}</text><text class="caption">{{ item.description }}</text></BaseCard>
              </view>
              <BaseCard v-else :title="module.kind === 'banner' ? '' : module.title" :padding="padding" :radius="radius" :background="module.kind === 'banner' ? bannerBackground : cardBackground">
                <template v-if="module.kind === 'banner'">
                  <image v-if="data.image.bannerSrc && !bannerFailed" class="banner-image" :src="data.image.bannerSrc" mode="aspectFill" @error="bannerFailed = true" />
                  <view class="banner-copy"><text class="name">{{ module.title }}</text><text class="copy">{{ module.subtitle }}</text><BaseButton v-if="module.action" type="ghost" size="lg" :text="module.action.label" @click="emit('action', module.action)" /></view>
                </template>
                <view v-else-if="module.kind === 'stats'" class="stats"><view v-for="item in module.items" :key="item.id" class="stat"><text class="value">{{ item.value }}</text><text class="caption">{{ item.label }}</text></view></view>
                <view v-else-if="module.kind === 'grid'" class="grid"><view v-for="item in module.items" :key="item.id" role="button" tabindex="0" class="grid-action" :aria-label="item.label" @tap="emit('action', item)" @keydown.enter="emit('action', item)" @keydown.space.prevent="emit('action', item)"><image class="icon" :src="icon(item.icon)" mode="aspectFit" /><text class="caption">{{ item.label }}</text></view></view>
                <view v-else-if="module.kind === 'list'"><view v-for="item in module.items" :key="item.id" role="button" tabindex="0" class="menu-action" :aria-label="item.label" @tap="emit('action', item)" @keydown.enter="emit('action', item)" @keydown.space.prevent="emit('action', item)"><image class="icon" :src="icon(item.icon)" mode="aspectFit" /><text class="grow copy">{{ item.label }}</text><text class="caption">{{ item.value }} ›</text></view></view>
                <template v-else-if="module.kind === 'progress'"><text class="value">{{ (module.streakDays || 0) + (checkedIn ? 1 : 0) }} 天</text><text class="copy">{{ module.subtitle }}</text><progress :percent="Math.min(100, Math.max(0, module.progress || 0))" :activeColor="progressColor" :backgroundColor="progressTrack" :stroke-width="6" /><BaseButton size="lg" :disabled="busy || checkedIn" :text="checkedIn ? '今日已打卡' : busy ? '正在打卡' : '今日打卡'" @click="emit('checkin')" /></template>
                <template v-else><text class="feature-title">{{ module.subtitle }}</text><BaseButton v-if="module.action" type="ghost" size="lg" :text="module.action.label" @click="emit('action', module.action)" /></template>
              </BaseCard>
            </template>
          </template>
        </view>
        <BaseTabbar :items="tabs" :model-value="activeTab" max-width="560px" @update:model-value="emit('tab', String($event))"><template #item="{ item, active }"><image class="tab-icon" :src="active && item.activeIcon ? item.activeIcon : item.icon" mode="aspectFit" /><text class="tab-label">{{ item.text }}</text></template></BaseTabbar>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseCard from '../../../../uniapp-base-skill/containers/base-card/index.vue'
import BaseAvatar from '../../../../uniapp-base-skill/containers/base-avatar/index.vue'
import BaseNavbar from '../../../../uniapp-base-skill/containers/base-navbar/index.vue'
import BaseTabbar from '../../../../uniapp-base-skill/containers/base-tabbar/index.vue'
import BaseButton from '../../../../uniapp-base-skill/components/form/base-button/index.vue'
import Empty from '../../../../uniapp-page-components-skill/components/empty/empty.vue'
import type { ScenicProfile, PageState, ProfileAction } from './types'
const props = withDefaults(defineProps<{data: ScenicProfile; state?: PageState; busy?: boolean; checkedIn?: boolean; activeTab?: string; statusBarHeight?: string; dark?: boolean; iconRoot?: string}>(), {state:'ready',busy:false,checkedIn:false,activeTab:'profile',statusBarHeight:'0px',iconRoot:'/static/profile-icons'})
const emit = defineEmits<{action:[item:ProfileAction];retry:[];login:[];checkin:[];tab:[key:string]}>()
const effectiveTheme = computed(()=>props.dark ? 'dark' : props.data.theme)
const isDark = computed(()=>effectiveTheme.value === 'dark')
const backgroundFailed = ref(false), bannerFailed = ref(false)
watch(()=>props.data.image.backgroundSrc,()=>{backgroundFailed.value=false})
watch(()=>props.data.image.bannerSrc,()=>{bannerFailed.value=false})
const padding='var(--space-8, 32rpx)', radius='var(--radius-xl, 32rpx)'
const heroBackground=computed(()=>props.data.backgroundMode === 'solid-rings' ? 'transparent' : isDark.value?'var(--bg-card, #262626)':'rgba(255,255,255,0.78)')
const cardBackground='var(--bg-card, #ffffff)'
const bannerBackground='var(--primary-50, #f0fdfa)'
const progressColor='var(--primary-600, #0d9488)', progressTrack='var(--bg-light, #f5f5f5)'
function icon(name:string){return `${props.iconRoot}/${isDark.value?'dark/':''}${name}.png`}
function action(id:string,label:string){emit('action',{id,label,icon:'user'})}
const tabs=computed(()=>[{key:'home',text:'发现',icon:icon('house')},{key:'services',text:'服务',icon:icon('layout-grid')},{key:'messages',text:'消息',icon:icon('message-square')},{key:'profile',text:'我的',icon:icon('user'),activeIcon:icon('user-active')}])
</script>
<style scoped lang="scss">
.nav-title{color:var(--text-primary,#171717);font-size:var(--font-lg,30rpx);font-weight:600}
.scenic-shell{min-height:100vh;background:var(--bg-page,#fafafa);color:var(--text-primary,#171717);font-size:var(--font-md,28rpx)}
.scenic-stage{position:relative;max-width:560px;margin:0 auto;overflow:hidden;min-height:100vh}
.solid-decoration{position:absolute;top:0;left:0;right:0;height:calc(var(--height-avatar-xl,160rpx) * 4);background:var(--bg-page,#fafafa);overflow:hidden;pointer-events:none}
.solid-circle{position:absolute;border-radius:var(--radius-full,9999rpx);background:var(--primary-500,#14b8a6)}
.circle-one{width:calc(var(--height-avatar-xl,160rpx) * 4);height:calc(var(--height-avatar-xl,160rpx) * 4);right:calc(var(--height-avatar-xl,160rpx) * -2);top:calc(var(--height-avatar-xl,160rpx) * -2);opacity:.07}
.circle-two{width:calc(var(--height-avatar-xl,160rpx) * 3);height:calc(var(--height-avatar-xl,160rpx) * 3);right:calc(var(--height-avatar-xl,160rpx) * -1);top:var(--height-avatar-md,80rpx);opacity:.06}
.circle-three{width:calc(var(--height-avatar-xl,160rpx) * 2);height:calc(var(--height-avatar-xl,160rpx) * 2);left:calc(var(--height-avatar-xl,160rpx) * -1);top:calc(var(--height-avatar-xl,160rpx) * 2);opacity:.05}
.scenic-art{position:absolute;top:0;left:0;width:100%;pointer-events:none}
.scenic-layer{position:relative}
.scenic-content{padding:var(--space-6,24rpx);padding-left:max(var(--space-6,24rpx),env(safe-area-inset-left));padding-right:max(var(--space-6,24rpx),env(safe-area-inset-right));display:flex;flex-direction:column;gap:var(--space-6,24rpx)}
.eyebrow{display:block;font-size:var(--font-2xs,20rpx);letter-spacing:2px;font-weight:600;color:var(--text-secondary,#525252)}
.slogan{display:block;font-size:var(--font-3xl,48rpx);font-weight:700;line-height:1.4;margin:var(--space-3,12rpx) 0;overflow-wrap:anywhere}
.copy{display:block;font-size:var(--font-sm,26rpx);line-height:1.7;overflow-wrap:anywhere}
.caption{display:block;font-size:var(--font-xs,24rpx);line-height:1.7;color:var(--text-secondary,#525252);overflow-wrap:anywhere}
.identity{display:flex;align-items:center;gap:var(--space-4,16rpx);margin-top:var(--space-8,32rpx)}
.grow{flex:1;min-width:0}.name{display:block;font-weight:650;font-size:var(--font-lg,30rpx);line-height:1.6;overflow-wrap:anywhere}
.stats{display:flex;gap:var(--space-2,8rpx);padding:var(--space-4,16rpx) 0}.stat{flex:1;min-width:0;text-align:center}.value{display:block;font-size:var(--font-3xl,48rpx);font-weight:650;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-2,8rpx)}.grid-action{min-height:var(--height-btn-xl,96rpx);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:var(--space-3,12rpx);text-align:center}
.icon,.tab-icon{width:var(--icon-md,48rpx);height:var(--icon-md,48rpx);flex-shrink:0}.tab-label{font-size:var(--font-2xs,20rpx);color:var(--text-primary,#171717);margin-top:var(--space-1,4rpx)}
.menu-action{display:flex;align-items:center;gap:var(--space-4,16rpx);min-height:var(--height-btn-xl,96rpx)}.menu-action+.menu-action{border-top:1px solid var(--border-light,#f5f5f5)}
.duo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4,16rpx)}.duo .name{margin-top:var(--space-3,12rpx)}
.feature-title{display:block;font-size:var(--font-xl,32rpx);line-height:1.6;font-weight:600;overflow-wrap:anywhere}.banner-copy{display:flex;flex-direction:column;gap:var(--space-3,12rpx)}.banner-image{display:block;width:100%;height:var(--height-avatar-xl,160rpx);margin-bottom:var(--space-4,16rpx)}
@media(prefers-reduced-motion:reduce){.scenic-shell :deep(*){animation:none!important;transition:none!important}}
</style>
