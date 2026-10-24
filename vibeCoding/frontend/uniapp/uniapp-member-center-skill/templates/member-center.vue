<template>
  <view class="member-page">
    <view class="member-hero">
      <text class="member-title">会员中心</text>
      <view class="member-card">
        <view class="member-user">
          <view class="avatar">
            <image v-if="member.avatar && !avatarError" class="avatar-img" :src="member.avatar" mode="aspectFill" @error="avatarError = true" />
            <text v-else class="avatar-ph">会员</text>
          </view>
          <view><text class="name">{{ member.nickname }}</text><text class="level">{{ member.levelName }}</text></view>
        </view>
        <view class="points" @tap="emit('points')"><text>我的积分</text><text class="strong">{{ member.points }}</text></view>
        <view class="benefits"><view v-for="item in benefits" :key="item.id" class="benefit" @tap="emit('benefit', item)"><text class="benefit-icon">{{ item.icon }}</text><text>{{ item.name }}</text></view></view>
      </view>
    </view>
    <view class="content">
      <view class="task-card"><view class="progress"><text>{{ completedTaskCount }}/{{ tasks.length }}</text><text>今日任务</text></view><view class="task-main"><view class="section-head"><text>完成任务领积分</text><text @tap="emit('tasks')">查看全部 ›</text></view><view class="task-list"><view v-for="task in tasks.slice(0, 3)" :key="task.id" class="task" @tap="emit('task', task)"><text>{{ task.name }}</text><text class="reward">+{{ task.reward }}</text></view></view></view></view>
      <view class="section-head mall-head"><text>积分商城</text><text @tap="emit('mall')">更多好物 ›</text></view>
      <view v-if="products.length" class="product-grid"><view v-for="product in products" :key="product.id" class="product" @tap="emit('product', product)"><view class="product-img"><image v-if="product.image && !productErrors[product.id]" class="product-img-el" :src="product.image" mode="aspectFill" @error="onProductError(product.id)" /><text v-else class="product-img-ph">暂无图片</text></view><text>{{ product.name }}</text><text class="strong">{{ product.points }} 积分</text></view></view>
      <empty v-else title="暂时没有可兑换商品" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Member = { nickname: string; levelName: string; points: number; avatar: string }
type Task = { id: string; name: string; reward: number; completed?: boolean }
type Product = { id: string; name: string; points: number; image: string }
type Benefit = { id: string; name: string; icon: string }

defineOptions({ name: 'MemberCenter' })
const props = withDefaults(defineProps<{ member: Member; benefits?: Benefit[]; tasks?: Task[]; products?: Product[] }>(), { benefits: () => [], tasks: () => [], products: () => [] })
const emit = defineEmits<{ points: []; benefit: [item: Benefit]; tasks: []; task: [task: Task]; mall: []; product: [product: Product] }>()
const completedTaskCount = computed(() => props.tasks.filter((item) => item.completed).length)

// 图片加载失败：走状态兜底，不操作事件对象（小程序端 image 事件没有 src 字段）
const avatarError = ref(false)
const productErrors = ref<Record<string, boolean>>({})

function onProductError(id: string) {
  productErrors.value[id] = true
}</script>

<style scoped>
.member-page{min-height:100vh;background:var(--bg-page);color:var(--text-primary)}.member-hero{padding:calc(var(--space-8) + env(safe-area-inset-top)) var(--space-4) var(--space-8);background:linear-gradient(145deg,var(--primary-900),var(--primary-600))}.member-title{display:block;font-size:var(--font-xl);font-weight:700;color:var(--text-inverse);margin-bottom:var(--space-4)}.member-card,.task-card,.product{background:var(--bg-card);border-radius:var(--radius-lg);box-shadow:var(--shadow-md)}.member-card{padding:var(--space-5)}.member-user,.benefits,.task-card,.section-head,.task-list{display:flex}.member-user{align-items:center;gap:var(--space-3)}.avatar{width:88rpx;height:88rpx;border-radius:var(--radius-full);background:var(--bg-light);overflow:hidden;display:flex;align-items:center;justify-content:center}.avatar-img{width:100%;height:100%}.avatar-ph{font-size:var(--font-sm);color:var(--text-secondary)}.name,.level{display:block}.name{font-size:var(--font-lg);font-weight:700}.level{font-size:var(--font-sm);color:var(--text-secondary)}.points{margin:var(--space-5) 0;border-bottom:1rpx solid var(--border-light);padding-bottom:var(--space-4)}.points text{font-size:var(--font-sm);color:var(--text-secondary)}.points .strong{display:block;font-size:56rpx;margin-top:var(--space-1);color:inherit}.benefits{justify-content:space-between}.benefit{min-width:88rpx;text-align:center;font-size:var(--font-sm)}.benefit-icon{display:block;font-size:40rpx;margin-bottom:var(--space-2)}.content{padding:var(--space-4) var(--space-4) calc(var(--space-8) + env(safe-area-inset-bottom))}.task-card{padding:var(--space-4);gap:var(--space-4);align-items:center}.progress{width:128rpx;height:128rpx;border-radius:var(--radius-full);border:12rpx solid var(--primary-200);display:flex;flex-direction:column;align-items:center;justify-content:center}.progress text:first-child{font-size:var(--font-xl);font-weight:700}.progress text:last-child{font-size:var(--font-xs);color:var(--text-secondary)}.task-main{flex:1}.section-head{justify-content:space-between;align-items:center;font-size:var(--font-lg);font-weight:700}.section-head text:last-child{font-size:var(--font-sm);font-weight:400;color:var(--text-secondary)}.task-list{gap:var(--space-2);margin-top:var(--space-3)}.task{flex:1;min-height:88rpx;padding:var(--space-2);background:var(--bg-light);border-radius:var(--radius-md);font-size:var(--font-xs)}.task text{display:block}.reward{color:var(--color-primary);margin-top:var(--space-1)}.mall-head{margin:var(--space-6) 0 var(--space-3)}.product-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}.product{overflow:hidden;padding-bottom:var(--space-3)}.product-img{width:100%;height:220rpx;background:var(--bg-light);display:flex;align-items:center;justify-content:center}.product-img-el{width:100%;height:100%}.product-img .product-img-ph{padding:0;margin-top:0;font-size:var(--font-sm);color:var(--text-secondary)}.product text{display:block;padding:0 var(--space-3);margin-top:var(--space-2);font-size:var(--font-sm)}.product .strong{color:var(--color-primary);font-size:var(--font-md)}
</style>
