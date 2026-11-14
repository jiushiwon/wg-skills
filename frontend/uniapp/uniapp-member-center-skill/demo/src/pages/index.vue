<template>
  <view>
    <view class="demo-controls" aria-label="演示状态">
      <button v-for="option in modes" :key="option.id" size="mini" :type="mode === option.id ? 'primary' : 'default'"
        @tap="mode = option.id">{{ option.label }}</button>
    </view>
    <view v-if="mode === 'loading'" class="demo-state" aria-busy="true">
      <view class="skeleton" /><view class="skeleton skeleton-short" /><text>正在加载会员资料</text>
    </view>
    <view v-else-if="mode === 'error'" class="demo-state">
      <text>会员资料加载失败</text><button size="mini" @tap="mode = 'ready'">重试</button>
    </view>
    <view v-else-if="mode === 'guest'" class="demo-state">
      <text>登录后可查看会员权益</text><button size="mini" @tap="mode = 'ready'">模拟登录</button>
    </view>
    <MemberCenter v-else :member="member" :benefits="benefits" :tasks="tasks" :products="mode === 'empty' ? [] : products"
      @points="notify('积分余额为 ' + member.points)" @benefit="item => notify(item.name)"
      @tasks="notify('今日共有 ' + tasks.length + ' 个任务')" @task="completeTask"
      @mall="notify('这里展示演示商品')" @product="previewProduct" />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import MemberCenter from '@/skills/uniapp-member-center-skill/templates/member-center.vue'

const modes = [
  { id: 'ready', label: '默认' }, { id: 'loading', label: '加载' }, { id: 'empty', label: '空商品' },
  { id: 'error', label: '失败' }, { id: 'guest', label: '未登录' },
] as const
const mode = ref<(typeof modes)[number]['id']>('ready')
const member = reactive({ nickname: '山间来客', levelName: '青松会员', points: 1280, avatar: '' })
const benefits = [
  { id: 'coupon', name: '会员券', icon: '券' }, { id: 'gift', name: '生日礼', icon: '礼' },
  { id: 'delivery', name: '运费券', icon: '运' },
]
const tasks = reactive([
  { id: 'checkin', name: '每日签到', reward: 10, completed: false },
  { id: 'browse', name: '浏览好物', reward: 5, completed: true },
  { id: 'profile', name: '完善资料', reward: 20, completed: false },
])
const products = [{ id: 'bottle', name: '山径保温杯', points: 600, image: '/static/trail-bottle.webp' }]

function notify(title: string) {
  uni.showToast({ title, icon: 'none' })
}

function completeTask(item: (typeof tasks)[number]) {
  if (item.id !== 'checkin') return notify(item.completed ? '任务已完成' : '这里仅演示签到')
  if (item.completed) return notify('今日已签到')
  item.completed = true
  member.points += item.reward
  notify('签到成功 +' + item.reward + ' 积分')
}

function previewProduct(item: (typeof products)[number]) {
  uni.showModal({ title: item.name, content: item.points + ' 积分 · 演示页不提交兑换订单', showCancel: false })
}
</script>

<style scoped>
.demo-controls { display:flex; flex-wrap:wrap; gap:var(--space-2); padding:var(--space-3); background:var(--bg-card); }
.demo-controls button { margin:0; }
.demo-state { display:flex; flex-direction:column; align-items:center; gap:var(--space-4); padding:var(--space-8); color:var(--text-secondary); }
.skeleton { width:100%; height:128rpx; border-radius:var(--radius-lg); background:var(--bg-light); }
.skeleton-short { width:66%; height:40rpx; }
</style>
