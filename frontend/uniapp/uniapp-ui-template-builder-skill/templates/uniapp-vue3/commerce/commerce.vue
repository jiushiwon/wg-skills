<template>
 <view :data-commerce-theme="commerceThemeId" class="commerce">
  <view class="shell">

   <view v-if="!preview" class="controls"><BaseButton v-for="item in commerceThemes" :key="item.id" :text="item.name" type="ghost" @click="setCommerceTheme(item.id)" /><BaseButton v-for="option in styleOptions" :key="option.id" :text="option.label" type="ghost" @click="applyStyle(option.id)" /><BaseButton v-for="option in layouts" :key="option.id" :text="option.label" type="ghost" @click="layout = option.id" /></view>
   <view v-if="page === 'products'" class="catalog-search"><view v-if="listProfile.mode !== 'none'" class="channel-head"><text class="name">{{ layout === 'category' ? '分类选购' : '数码好物' }}</text><BaseButton text="全部分类" type="text" size="sm" @click="channelsOpen = true" /></view><SearchBar v-model="keyword" placeholder="搜索电脑、手机、耳机" /></view>
   <scroll-view v-if="page === 'products' && listProfile.mode === 'scroll'" scroll-x class="category-scroll"><view class="image-categories"><view v-for="item in categories.filter(c => c.id !== 'all' && c.depth === 0)" :key="item.id" class="image-category" :class="{ selected: category === item.id }" @click="category = item.id"><image v-if="item.image" :src="item.image" mode="aspectFill" /><text>{{ item.label }}</text></view></view></scroll-view>
   <view v-if="page === 'products' && listProfile.mode !== 'none'" class="filter-row"><text class="muted">{{ category === 'all' ? '全部好物' : categories.find(c => c.id === category)?.label }} · {{ filteredProducts.length }}件</text><BaseButton :text="sort === 'price' ? '价格从低到高' : '综合排序'" type="text" size="sm" @click="sort = sort === 'price' ? 'default' : 'price'" /></view>
   <view v-if="!preview || page !== 'products'" class="tabs"><BaseButton v-for="item in pages" :key="item.id" :type="page === item.id ? 'primary' : 'ghost'" :text="item.label" @click="page = item.id" /></view>
   <view v-if="page === 'products'">

    <Empty v-if="!filteredProducts.length" text="没有找到相关商品" description="试试其他关键词或分类" />
    <view class="catalog-body" :class="layout"><view v-if="layout === 'category'" class="category-rail"><BaseButton v-for="item in categories" :key="item.id" :text="'　'.repeat(item.depth) + item.label" size="sm" :type="category === item.id ? 'primary' : 'ghost'" @click="category = item.id" /></view><view class="products" :class="layout"><view v-for="(column, index) in productColumns" :key="index" class="product-column"><BaseCard v-for="item in column" :key="item.id" padding="var(--commerce-card-padding)" radius="var(--radius-card)"><view class="product" :class="layout"><image class="art" :class="{ tall: layout === 'waterfall' && (item.id === 'laptop' || item.id === 'watch') }" :src="item.image" mode="aspectFill" /><view class="info"><text class="name">{{ item.name }}</text><text class="muted">{{ item.description }}</text><text v-if="layout === 'waterfall'" class="seller">{{ item.tag }} · 严选好物</text><view class="purchase-row"><text class="price">¥{{ money(item.price) }}</text><BaseButton class="add-cart" icon="/static/commerce/cart-white.svg" text="" :aria-label="'加购' + item.name" size="sm" @click="add(item.id)" /></view></view></view></BaseCard></view></view></view>
   </view>
   <view v-else-if="page === 'cart'" class="sections" :class="layout">
    <text class="title">购物车 / {{ count }} 件</text>
    <Empty v-if="!cart.length" text="购物车还是空的" description="去商品页挑选喜欢的好物" />
    <BaseCard v-for="row in cart" :key="row.id" padding="var(--space-4)" radius="var(--radius-card)"><image class="cart-image" :src="row.image" mode="aspectFill" /><text class="name">{{ row.name }}</text><text class="price">¥{{ money(row.price) }}</text><view class="controls"><BaseButton text="减少" type="ghost" @click="change(row.id, -1)" /><text>{{ row.quantity }}</text><BaseButton text="增加" type="ghost" :disabled="row.quantity >= 99" @click="change(row.id, 1)" /></view></BaseCard>
    <BaseCard title="费用明细" padding="var(--space-4)" radius="var(--radius-card)"><text class="muted">共 {{ count }} 件商品 / 不含运费</text><text class="price">合计 ¥{{ money(total) }}</text><BaseButton text="去结算" :disabled="!cart.length" @click="notice('请先完善收货地址')" /></BaseCard>
   </view>
   <view v-else class="sections" :class="layout">
    <BaseCard padding="var(--space-4)" radius="var(--radius-card)"><text class="muted">我的钱包 / 可用余额</text><text class="balance">¥{{ money(walletMock.available) }}</text><text class="muted">冻结金额 ¥{{ money(walletMock.frozen) }}</text><view class="controls"><BaseButton text="充值" @click="notice('暂不可充值')" /><BaseButton text="提现" type="ghost" @click="notice('暂不可提现')" /></view></BaseCard>
    <BaseCard title="钱包服务" padding="var(--space-4)" radius="var(--radius-card)"><text class="name">账单、银行卡与安全设置</text><text class="muted">查看收支明细，管理账户与资金安全</text><BaseButton text="查看账单" type="ghost" @click="notice('暂无账单')" /></BaseCard>
   </view>

   <BasePopup v-model:show="channelsOpen" direction="top" title="全部分类" padding="sm" radius="var(--radius-card)"><view class="channel-grid"><BaseButton v-for="item in categories" :key="item.id" :text="'　'.repeat(item.depth) + item.label" :icon="item.image" type="ghost" @click="category = item.id; channelsOpen = false; page = 'products'" /></view><BaseButton text="收起分类" type="text" block @click="channelsOpen = false" /></BasePopup>
   <BaseTabbar :items="navigation" :model-value="page === 'products' && layout === 'category' ? 'categories' : page" max-width="800px" @change="navigate" />
  </view>
 </view>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import BaseCard from '../../../../uniapp-base-skill/containers/base-card/index.vue'
import BaseTabbar from '../../../../uniapp-base-skill/containers/base-tabbar/index.vue'
import BasePopup from '../../../../uniapp-base-skill/containers/base-popup/index.vue'
import SearchBar from '../../../../uniapp-base-skill/components/form/search-bar/index.vue'
import BaseButton from '../../../../uniapp-base-skill/components/form/base-button/index.vue'
import Empty from '../../../../uniapp-page-components-skill/components/empty/empty.vue'
import { commerceThemes, commerceThemeId, setCommerceTheme } from '../../../../uniapp-theme-skill/templates/src/commerce-theme'
import { products, walletMock, money } from './mock'
const pages = [{id:'products',label:'商品'},{id:'cart',label:'购物车'},{id:'wallet',label:'钱包'}]
const page=ref('products'), layout=ref('grid'), preview=ref(true)
const styleId=ref('S1')
const styleOptions=[{id:'S1',label:'简洁平铺',layout:'grid',mode:'none'},{id:'S2',label:'精细横滑',layout:'grid',mode:'scroll'},{id:'S3',label:'树形精细',layout:'category',mode:'tree'},{id:'S4',label:'下拉瀑布',layout:'waterfall',mode:'dropdown'},{id:'S5',label:'横滑瀑布',layout:'waterfall',mode:'scroll'},{id:'S6',label:'下拉平铺',layout:'grid',mode:'dropdown'},{id:'S7',label:'横滑横排',layout:'editorial',mode:'scroll'},{id:'S8',label:'下拉横排',layout:'editorial',mode:'dropdown'}]
const listProfile=computed(()=>styleOptions.find(x=>x.id===styleId.value)||styleOptions[0])
function applyStyle(id:string){const p=styleOptions.find(x=>x.id===id);if(p){styleId.value=id;layout.value=p.layout;homeLayout.value=p.layout;category.value='all'}}
watch(()=>props.listStyle,id=>{if(id)applyStyle(id)})
const channelsOpen=ref(false), homeLayout=ref('grid'), sort=ref('default')
const navigation=computed(()=>[{key:'products',text:'首页',icon:'/static/commerce/home.svg'},{key:'categories',text:'分类',icon:'/static/commerce/grid.svg'},{key:'cart',text:'购物车',icon:'/static/commerce/cart.svg',badge:count.value||''},{key:'wallet',text:'钱包',icon:'/static/commerce/wallet.svg'}])
function navigate(item:{key:string|number}){if(item.key==='categories'){page.value='products';applyStyle('S3')}else {page.value=String(item.key);if(item.key==='products')layout.value=homeLayout.value}}
const layouts=[{id:'grid',label:'双栏'},{id:'editorial',label:'横排'},{id:'waterfall',label:'瀑布流'},{id:'category',label:'分类点单'}]
const keyword=ref(''), category=ref('all')
interface CategoryNode { id:string; label:string; image?:string; productIds?:string[]; children?:CategoryNode[] }
const props=defineProps<{categories?:CategoryNode[];listStyle?:string}>()
const defaultCategories:CategoryNode[]=products.map(p=>({id:p.id,label:({laptop:'电脑',phone:'手机',headphones:'耳机',watch:'腕表'} as Record<string,string>)[p.id],image:p.image,productIds:[p.id]}))
function flatten(nodes:CategoryNode[],depth=0):Array<CategoryNode & {depth:number}>{return nodes.flatMap(n=>[{...n,depth},...flatten(n.children||[],depth+1)])}
const categories=computed(()=>[{id:'all',label:'全部',depth:0},...flatten(props.categories ?? defaultCategories)])
function includedIds(node:CategoryNode):string[]{return [...(node.productIds||[node.id]),...(node.children||[]).flatMap(includedIds)]}
const allowedIds=computed(()=>category.value==='all'?null:includedIds(categories.value.find(n=>n.id===category.value)||{id:'',label:''}))
watch(categories,rows=>{if(!rows.some(n=>n.id===category.value))category.value='all'})
const filteredProducts=computed(()=>{const rows=products.filter(item=>(allowedIds.value===null||allowedIds.value.includes(item.id))&&`${item.name} ${item.description}`.includes(keyword.value.trim()));return sort.value==='price' ? rows.slice().sort((a,b)=>a.price-b.price) : rows})
const productColumns=computed(()=>layout.value==='waterfall' ? [filteredProducts.value.filter((_,i)=>i%2===0),filteredProducts.value.filter((_,i)=>i%2===1)] : [filteredProducts.value])
const quantities=ref<Record<string, number>>({laptop:1,phone:1})
const profile=computed(()=>commerceThemes.find(x=>x.id===commerceThemeId.value) || commerceThemes[0])
const cart=computed(()=>products.filter(x=>(quantities.value[x.id]||0)>0).map(x=>({...x,quantity:quantities.value[x.id]})))
const count=computed(()=>cart.value.reduce((n,x)=>n+x.quantity,0))
const total=computed(()=>cart.value.reduce((n,x)=>n+x.quantity*x.price,0))
function add(id:string){quantities.value[id]=Math.min(99,(quantities.value[id]||0)+1)}
function change(id:string,delta:number){quantities.value[id]=Math.max(0,Math.min(99,(quantities.value[id]||0)+delta))}
function notice(title:string){uni.showToast({title,icon:'none'})}
onLoad(options=>{if(options?.design==='B'){setCommerceTheme('ink');layout.value='waterfall'}if(options?.design==='C'){setCommerceTheme('forest');layout.value='category'}if(options?.theme)setCommerceTheme(options.theme);if(layouts.some(x=>x.id===options?.layout))layout.value=options!.layout!;if(pages.some(x=>x.id===options?.page))page.value=options!.page!;homeLayout.value=layout.value;preview.value=options?.settings!=='1';applyStyle(props.listStyle||options?.style||({A:'S1',B:'S4',C:'S3'} as Record<string,string>)[options?.design||'']||'S1');if(options?.layout && layouts.some(x=>x.id===options.layout))layout.value=options.layout})
</script>
<style scoped>
.commerce{background:var(--bg-page);color:var(--text-primary);min-height:100vh}.shell{max-width:800px;margin:auto;padding:var(--commerce-gutter)}
.title,.balance{display:block;font-size:var(--font-2xl);font-weight:700}.name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:var(--font-md);font-weight:600;line-height:1.5}.muted,.seller{display:block;color:var(--text-secondary);font-size:var(--font-sm);line-height:1.5}.seller{margin-top:var(--space-2)}
.channel-head,.filter-row,.purchase-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}.channel-head{margin-bottom:var(--space-2)}.filter-row{margin:var(--space-2) 0}.controls,.tabs{display:flex;flex-wrap:wrap;gap:var(--space-2);margin:var(--space-2) 0}.tabs :deep(.btn),.controls :deep(.btn){padding:0 var(--space-3)}.catalog-search :deep(.search-bar){background:transparent;padding:0}.catalog-search :deep(.search-bar__wrap){border:2rpx solid var(--text-primary);background:var(--bg-card)}
.products{min-width:0;flex:1}.product-column{display:flex;flex-direction:column;gap:var(--commerce-gap);min-width:0}.products.grid .product-column{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.products.waterfall{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--commerce-gap);align-items:start}
.art{display:block;width:100%;height:240rpx;border-radius:var(--commerce-image-radius);margin-bottom:var(--space-2)}.art.tall{height:340rpx}.info{min-width:0;flex:1}.price{font-weight:700;color:var(--commerce-price);font-size:var(--font-lg);white-space:nowrap}.purchase-row{margin-top:var(--space-2);flex-wrap:wrap}.add-cart{padding:0;min-width:44px;min-height:44px;border-radius:50%}.add-cart :deep(.btn-text){display:none}.add-cart :deep(.btn-icon){margin:0;width:36rpx;height:36rpx}
.product.editorial,.product.category{display:flex;gap:var(--space-3)}.product.editorial .art{width:34%;height:220rpx;flex-shrink:0}.product.category .art{width:112rpx;height:144rpx;flex-shrink:0}.product.category .muted{font-size:var(--font-xs)}.product.category .name{font-size:var(--font-sm)}.catalog-body.category{display:flex;align-items:flex-start;gap:var(--space-2)}.category-rail{width:var(--commerce-rail-width);flex-shrink:0;position:sticky;top:var(--space-2);display:flex;flex-direction:column;gap:var(--space-2)}.category-rail :deep(.btn){padding:0 var(--space-2);min-width:0;border-radius:var(--commerce-category-radius)}
.image-categories{display:flex;gap:var(--space-3);margin:var(--space-4) 0;justify-content:space-around}.image-category{min-width:0;text-align:center;font-size:var(--font-sm);padding:var(--space-1);border-bottom:4rpx solid transparent}.image-category image{display:block;width:88rpx;height:88rpx;border-radius:var(--commerce-image-radius);margin-bottom:var(--space-2)}.image-category.selected{color:var(--color-primary);border-color:var(--color-primary)}
.channel-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}.channel-grid :deep(.btn){padding:var(--space-2);border-radius:var(--commerce-category-radius)}.channel-grid :deep(.btn-icon){width:48rpx;height:48rpx;border-radius:var(--commerce-image-radius)}.sections{display:flex;flex-direction:column;gap:var(--commerce-gap)}.cart-image{width:112rpx;height:112rpx;float:left;margin-right:var(--space-3);border-radius:var(--commerce-image-radius)}.balance{margin:var(--space-4) 0}.sections .price{display:block;margin:var(--space-3) 0}
/* #ifdef H5 */
.shell{padding-top:var(--commerce-gutter)}.category-rail{top:calc(44px + var(--space-2))}
/* #endif */
@media(min-width:640px){.products.grid .product-column{grid-template-columns:repeat(3,minmax(0,1fr))}.product.category .art{width:180rpx;height:180rpx}}
/* #ifdef H5 */
.commerce :deep(.popup-mask){z-index:10000;inset:0;height:100dvh}.commerce :deep(.popup){z-index:10001;max-height:85dvh;overflow-y:auto}
/* #endif */
.category-scroll{width:100%;white-space:nowrap}.image-categories{display:inline-flex;justify-content:flex-start;min-width:100%;gap:var(--space-4)}.image-category{flex:0 0 auto;min-width:100rpx}.image-category text{display:block}.channel-grid{max-height:60vh;overflow-y:auto}
</style>
