# 各页面组件 API 速查

本文档给出 `components/` 下 7 个组件的 Props / Slots / Emits / 默认数据、mock 数据与完整页面示例。
所有组件默认使用 uniapp-theme-skill 主题变量，复制进项目后无需改样式。

## 通用使用前提

- **自定义导航栏**：`chat-page` / `product-detail-page` 内置简化导航栏（未做状态栏高度与胶囊对齐），页面 `pages.json` 需 `"navigationStyle": "custom"`；正式项目建议用项目 NavBar 或 `#header` / `#navbar` slot 替换。
- **容器高度**：`tab-list-page` / `chat-page` / `product-detail-page` 根容器 `height: 100%`，使用页面根元素需给高度（如 `height: 100vh`）。
- **主题系统**：组件样式依赖 `var(--xxx)`；无主题系统时按 `theme-integration.md` §2 fallback 表硬编码。
- **页面背景**：除 `base-card` / `image-card` 外，各页面组件自带页面级背景，外层无需再包容器。
- **数据对接**：组件只展示数据并 `emit` 事件；分页、加载更多、发送、点赞等副作用一律在页面层通过 request 封装（`uniapp-request-skill`）处理，组件内禁止直接请求。下方案例中的 `ref([...])` 数据为 mock，生产请从 store/API 获取。

---

## 1. base-card（空卡片托底组件）

> 所有卡片类布局的套壳。定义圆角 / 内边距 / 背景 / 描边 / 阴影 / 间距，内容由 slot 自由填充。

**目录**：`src/components/base-card/base-card.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `''` | 卡片标题（也可用 `#header` slot 自定义） |
| `radius` | `string` | `var(--radius-card)` | 圆角 |
| `padding` | `string` | `var(--spacing-lg)` | 内边距 |
| `background` | `string` | `var(--color-bg-surface)` | 背景色 |
| `margin` | `string` | `0 0 var(--spacing-md)` | 外边距 |
| `border` | `boolean` | `false` | 是否描边 |
| `shadow` | `boolean` | `false` | 是否阴影 |
| `clickable` | `boolean` | `false` | 可点击（触发 click + 按压反馈） |
| `gap` | `string` | `var(--spacing-sm)` | header/body/footer 垂直间距 |

### Slots

- 默认 `slot`：卡片主体内容
- `#header`：自定义头部（覆盖 title）
- `#footer`：底部内容

### Emits

- `click`：仅 `clickable` 时触发

### 使用示例

```vue
<template>
  <base-card :radius="'var(--radius-lg)'" :padding="'var(--spacing-md)'" :shadow="true" :clickable="true" @click="onTap">
    <text class="text-h3">订单标题</text>
    <text class="text-body">订单描述...</text>
    <template #footer>
      <text class="text-caption">2026-08-01</text>
    </template>
  </base-card>
</template>
```

---

## 2. image-card（图片卡片）

> BaseCard 之上：顶部图片 + 标题 + 描述 + 标签。入参包含 BaseCard 全部入参。

**目录**：`src/components/image-card/image-card.vue`

### Props（含 BaseCard 透传入参）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `image` | `string` | `''` | 图片地址 |
| `imageMode` | `string` | `aspectFill` | 图片裁剪模式 |
| `imageHeight` | `string` | `calc(var(--spacing-2xl) * 6)` | 图片高度（约 384rpx） |
| `lazyLoad` | `boolean` | `true` | 懒加载 |
| `title` | `string` | `''` | 标题 |
| `description` | `string` | `''` | 描述 |
| `tags` | `string[]` | `[]` | 标签列表 |
| `showTags` | `boolean` | `true` | 是否展示标签 |
| `radius` / `padding` / `background` / `margin` / `border` / `shadow` / `clickable` | — | 见 base-card | BaseCard 透传 |

### Slots / Emits

- 默认 `slot`：整体替换 title/description/tags 区
- `#image`：自定义图片区
- `#header` / `#footer`：透传 BaseCard
- Emits：`click`、`imageClick`

### 使用示例

```vue
<template>
  <image-card
    image="/static/goods/1.jpg"
    title="智能保温杯 500ml"
    description="316 不锈钢内胆，保温 12 小时"
    :tags="['热卖', '包邮']"
    :clickable="true"
    @click="onGoodsClick"
  />
</template>
```

---

## 3. tab-list-page（Tab + 列表组件化页面）

> 顶部 Tab 吸顶 + 滚动卡片列表，每项自动包一层 BaseCard。适合我的订单 / 消息中心 / 商品列表等一切「Tab 分组 + 卡片列表」页面。

**目录**：`src/components/tab-list-page/tab-list-page.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tabs` | `TabItem[]` | 全部/进行中/已完成 | `{ label, value, badge? }` |
| `modelValue` | `string \| number` | `''` | 当前激活 Tab（v-model） |
| `list` | `any[]` | `[]` | 列表数据 |
| `tabFixed` | `boolean` | `true` | Tab 是否吸顶 |
| `cardProps` | `Record<string, unknown>` | `{}` | **透传给内部 BaseCard 的入参** |
| `loading` | `boolean` | `false` | 底部"加载中..." |
| `finished` | `boolean` | `false` | 底部"没有更多了" |
| `itemKeyField` | `string` | `id` | 列表项 key 字段 |

### Slots

| Slot | 作用域 | 说明 |
|------|--------|------|
| `#item` | `{ item, index }` | **列表项内容**（默认自动包在 BaseCard 里） |
| `#tab` | `{ tabs, active }` | 自定义 Tab 栏 |
| `#empty` | — | 空列表 |
| `#header` | — | Tab 栏上方 |
| `#footer` | — | 列表下方 |

### Emits

- `update:modelValue` / `change`：切换 Tab
- `itemClick`：`(item, index)`
- `loadMore`：滚动到底部

### 完整页面示例（我的订单）

```vue
<template>
  <view class="page">
    <tab-list-page
      v-model="activeTab"
      :tabs="tabs"
      :list="filteredOrders"
      :loading="loading"
      :finished="finished"
      :card-props="{ padding: 'var(--spacing-md)' }"
      @change="onTabChange"
      @load-more="loadMore"
      @item-click="onOrderClick"
    >
      <template #item="{ item }">
        <view class="order-head">
          <text class="order-no">订单号：{{ item.no }}</text>
          <text class="order-status">{{ item.statusText }}</text>
        </view>
        <view class="order-goods">
          <image class="order-img" :src="item.image" mode="aspectFill" />
          <view class="order-info">
            <text class="order-title">{{ item.title }}</text>
            <text class="order-meta">共 {{ item.count }} 件</text>
          </view>
        </view>
        <view class="order-foot">
          <text class="order-price">¥{{ item.price }}</text>
        </view>
      </template>
    </tab-list-page>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const tabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: 'unpaid' },
  { label: '已发货', value: 'shipped', badge: 2 },
  { label: '已完成', value: 'done' },
]
const activeTab = ref('')
const loading = ref(false)
const finished = ref(false)

const orders = ref([
  { id: 1, no: 'A20260801001', statusText: '已发货', image: '/static/goods/1.jpg', title: '智能保温杯', count: 1, price: '129.00' },
  { id: 2, no: 'A20260801002', statusText: '待付款', image: '/static/goods/2.jpg', title: '无线耳机', count: 2, price: '399.00' },
])

const filteredOrders = computed(() =>
  activeTab.value ? orders.value.filter((o) => o.statusText === tabs.find((t) => t.value === activeTab.value)?.label) : orders.value,
)

function loadMore() {
  // 分页加载
}
function onTabChange(tab: any) {
  activeTab.value = tab.value
}
function onOrderClick(item: any) {
  uni.showToast({ title: item.no, icon: 'none' })
}
</script>

<style scoped lang="scss">
.order-head { display: flex; justify-content: space-between; }
.order-goods { display: flex; margin-top: var(--spacing-sm); }
.order-img { width: 120rpx; height: 120rpx; border-radius: var(--radius-image); margin-right: var(--spacing-md); }
.order-status { color: var(--color-primary); }
</style>
```

---

## 4. chat-page（聊天组件化页面）

> 参考微信聊天：导航栏 + 消息滚动区 + 底部输入栏（＋ / 输入框 / 发送）。自己的消息在右侧主题色高亮气泡，对方在左侧白色气泡。

**目录**：`src/components/chat-page/chat-page.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `聊天` | 导航栏标题 |
| `messages` | `ChatMessage[]` | `[]` | 消息列表 |
| `placeholder` | `string` | `输入消息` | 输入框占位 |
| `showPlus` | `boolean` | `true` | 是否显示 ＋ |
| `showMore` | `boolean` | `false` | 是否显示右上角 ⋯ |
| `sendButtonText` | `string` | `发送` | 发送按钮文案 |
| `sendButtonMode` | `always \| auto` | `auto` | 发送按钮显示策略 |

**ChatMessage**：`{ id, content, isSelf?, time?, avatar?, nickname?, status?: 'sending' | 'sent' | 'failed' }`

### Slots

- `#message`：`{ msg, index }` 自定义消息气泡
- `#header`：自定义导航栏
- `#navbar-right`：导航栏右侧
- `#empty`：无消息
- `#plus-panel`：＋ 展开的扩展面板（放图片/语音/表情，带 `{ close }` 关闭回调）

### Emits

- `back`、`moreClick`
- `plusClick`：`(open)`
- `send`：`(text)`
- `avatarClick`、`messageClick`、`messageLongPress`
- `retry`：`(msg)` 发送失败点击重试
- `loadMore`：滚动到顶部加载历史

### 完整页面示例

```vue
<template>
  <view class="page">
    <chat-page
      :messages="messages"
      title="小明"
      @send="onSend"
      @load-more="loadHistory"
      @plus-click="onPlus"
    >
      <template #plus-panel="{ close }">
        <view class="plus-grid">
          <view class="plus-item" @click="close(); pickImage()">图片</view>
          <view class="plus-item" @click="close(); pickVoice()">语音</view>
        </view>
      </template>
    </chat-page>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const messages = ref([
  { id: 1, content: '你好，在吗？', time: '10:01', isSelf: false, nickname: '小明', avatar: '/static/avatar/1.jpg' },
  { id: 2, content: '在的，刚忙完', time: '10:02', isSelf: true, nickname: '我', avatar: '/static/avatar/me.jpg' },
  { id: 3, content: '晚上一起吃饭？', time: '10:03', isSelf: false, nickname: '小明' },
])

function onSend(text: string) {
  messages.value.push({ id: Date.now(), content: text, time: '刚刚', isSelf: true, status: 'sending' })
  setTimeout(() => {
    messages.value[messages.value.length - 1].status = 'sent'
  }, 500)
}
function loadHistory() {
  // 加载历史消息，insert 到 messages 前面
}
function onPlus(open: boolean) {
  // 扩展面板开关
}
</script>
```

---

## 5. moments-page（朋友圈组件化页面）

> 参考微信朋友圈：封面头图（含本人头像昵称）+ 动态列表。每条动态 = 左头像 + 右昵称/正文(可折叠)/九宫格图/时间/位置/⋯ 按钮；点击 ⋯ 展开点赞 + 评论。

**目录**：`src/components/moments-page/moments-page.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `feedList` | `MomentsFeed[]` | `[]` | 动态列表 |
| `coverImage` | `string` | `''` | 封面图 |
| `myNickname` | `string` | `我` | 本人昵称 |
| `myAvatar` | `string` | `''` | 本人头像 |
| `collapseLongText` | `number` | `200` | 超过该字数折叠为"全文" |
| `imageColumns` | `number` | `3` | 图片宫格列数（1-3） |

**MomentsFeed**：`{ id, nickname, avatar?, content?, images?, time?, location?, likeList?: {id,nickname}[], commentList?: {id,nickname,content,replyTo?}[], expanded? }`

### Slots

- `#header`：自定义封面头图
- `#feed`：`{ feed }` 自定义整条动态
- `#like`：`{ feed }` 自定义点赞区
- `#comment`：`{ feed }` 自定义评论区
- `#empty`：无动态

### Emits

- `meClick`、`avatarClick`、`contentClick`
- `imageClick`：`(feed, index)`
- `moreClick`：`(feed)` 点击 ⋯
- `commentClick`：`(feed, comment)`

### 完整页面示例

```vue
<template>
  <view class="page">
    <moments-page
      :feed-list="feeds"
      cover-image="/static/moments/cover.jpg"
      my-nickname="阿伟"
      my-avatar="/static/avatar/me.jpg"
      @image-click="previewImage"
      @comment-click="onComment"
      @more-click="onMore"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const feeds = ref([
  {
    id: 1,
    nickname: '小李',
    avatar: '/static/avatar/1.jpg',
    content: '今天天气真好，出来走走',
    images: ['/static/moments/1.jpg', '/static/moments/2.jpg', '/static/moments/3.jpg'],
    time: '10 分钟前',
    location: '西湖',
    likeList: [{ id: 1, nickname: '阿伟' }, { id: 2, nickname: '小美' }],
    commentList: [{ id: 1, nickname: '小美', content: '好美！' }],
  },
  {
    id: 2,
    nickname: '小美',
    avatar: '/static/avatar/2.jpg',
    content: '打卡新开的咖啡馆',
    images: ['/static/moments/4.jpg'],
    time: '昨天',
  },
])

function previewImage(feed: any, index: number) {
  uni.previewImage({ urls: feed.images, current: index })
}
function onComment(feed: any, comment: any) {
  uni.showToast({ title: `${feed.nickname} 评论了这条动态`, icon: 'none' })
}
function onMore(feed: any) {
  // 更多操作（复制 / 举报 / 删除等）
}
</script>
```

---

## 6. product-detail-page（商品详情组件化页面）

> 导航 + 滚动区 + 底部操作栏。**核心思路：整个页面就是多张 BaseCard 依次排列**——`sections` slot 里自由堆卡片；`gallery` / `info` 也基于 BaseCard 且有默认实现，可整体替换。

**目录**：`src/components/product-detail-page/product-detail-page.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `商品详情` | 导航栏标题 |
| `navbarTransparent` | `boolean` | `false` | 透明导航栏（沉浸式头图） |
| `price` / `goodsTitle` / `goodsDesc` | — | 占位 | `info` slot 默认展示 |
| `bottomActions` | `BottomAction[]` | 客服/购物车/加入购物车/立即购买 | 底部操作栏 |
| `bottomBarVisible` | `boolean` | `true` | 是否显示底部栏 |

**BottomAction**：`{ key, text, icon?, type?: 'primary' | 'ghost' | 'text' }`

### Slots

- `#gallery`：头图/轮播（默认灰色占位）
- `#info`：价格/标题信息卡
- `#sections`：**多张 BaseCard 依次排列的区域**（核心扩展口）
- 默认 `slot`：滚动区兜底内容
- `#navbar` / `#navbar-right` / `#footer`：导航栏 / 底部栏自定义

### Emits

- `back`、`action`（`(act)` 底部按钮点击）、`reachBottom`

### 完整页面示例

```vue
<template>
  <view class="page">
    <product-detail-page
      :price="price"
      :goods-title="title"
      :goods-desc="desc"
      :bottom-actions="actions"
      @action="onAction"
      @back="goBack"
    >
      <template #gallery>
        <swiper class="gallery" indicator-dots autoplay circular>
          <swiper-item v-for="img in images" :key="img">
            <image class="gallery-img" :src="img" mode="aspectFill" />
          </swiper-item>
        </swiper>
      </template>

      <template #sections>
        <!-- 核心：自由堆叠的 BaseCard -->
        <base-card title="规格选择">
          <view class="spec-row">
            <text class="text-body">颜色</text>
            <view class="spec-dots">
              <view class="spec-dot" v-for="c in colors" :key="c" :style="{ background: c }" />
            </view>
          </view>
        </base-card>

        <base-card title="商品参数">
          <view class="param-row" v-for="p in params" :key="p.k">
            <text class="text-caption">{{ p.k }}</text>
            <text class="text-body">{{ p.v }}</text>
          </view>
        </base-card>

        <base-card title="商品详情">
          <image class="detail-img" :src="detailImg" mode="widthFix" />
        </base-card>
      </template>
    </product-detail-page>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const price = ref('129.00')
const title = ref('智能保温杯 500ml')
const desc = ref('316 不锈钢内胆，保温 12 小时')
const images = ref(['/static/goods/1.jpg', '/static/goods/2.jpg'])
const colors = ref(['#2563EB', '#EF4444', '#10B981'])
const params = [{ k: '容量', v: '500ml' }, { k: '材质', v: '316 不锈钢' }]
const detailImg = '/static/goods/detail.jpg'

const actions = [
  { key: 'service', text: '客服' },
  { key: 'cart', text: '购物车' },
  { key: 'add-cart', text: '加入购物车', type: 'ghost' },
  { key: 'buy', text: '立即购买', type: 'primary' },
]

function onAction(act: any) {
  uni.showToast({ title: act.text, icon: 'none' })
}
function goBack() {
  uni.navigateBack({ delta: 1 })
}
</script>
```

---

## 7. profile-page（我的 / 设置 / 通知 / 购物车组件化页面）

> 用户信息头 + 分组列表（每组一个 BaseCard，每行 = 图标/左图 + 标签 + 右侧 value/badge + 箭头）。把右侧箭头去掉换左侧图片，就是购物车列表；改分组数据就是设置/通知/收藏页。

**目录**：`src/components/profile-page/profile-page.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `userInfo` | `{ avatar?, nickname?, subtitle? }` | `{}` | 头区用户信息 |
| `headerBackground` | `string` | `var(--color-primary)` | 头区背景色 |
| `groups` | `ProfileGroup[]` | 我的订单/收货地址/... | 分组列表 |
| `itemArrow` | `boolean` | `true` | 是否显示右侧箭头 |
| `itemClickable` | `boolean` | `true` | 行是否可点击 |
| `cardProps` | `Record<string, unknown>` | `{}` | 透传给 BaseCard |

**ProfileGroup**：`{ id, items: ProfileItem[] }`
**ProfileItem**：`{ id, label, icon?, iconText?, iconColor?, iconTextColor?, value?, badge?, arrow? }`

### Slots

- `#header`：自定义头区
- `#group`：`{ group }` 自定义整组
- `#item`：`{ item, group }` 自定义行

### Emits

- `headerClick`、`itemClick`（`(item, group)`）

### 完整页面示例（我的 + 设置）

```vue
<template>
  <view class="page">
    <profile-page
      :user-info="userInfo"
      :groups="groups"
      @item-click="onItemClick"
      @header-click="goLogin"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userInfo = ref({
  avatar: '/static/avatar/me.jpg',
  nickname: '阿伟',
  subtitle: 'ID: 10086',
})

const groups = [
  {
    id: 'g1',
    items: [
      { id: 'order', label: '我的订单', iconText: '订', value: '3', iconColor: 'var(--color-bg-tinted)' },
      { id: 'address', label: '收货地址', iconText: '址' },
      { id: 'favorites', label: '我的收藏', iconText: '藏' },
    ],
  },
  {
    id: 'g2',
    items: [
      { id: 'coupon', label: '优惠券', iconText: '券', value: '5' },
      { id: 'setting', label: '设置', iconText: '设' },
    ],
  },
]

function onItemClick(item: any) {
  uni.showToast({ title: item.label, icon: 'none' })
}
function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}
</script>
```

---

## 扩展建议

1. **给组件加新入参**：直接在该组件 `interface Props` 中追加字段并给 `withDefaults` 默认值，再在模板中使用即可；不破坏既有用法（向后兼容）。
2. **整体换样式**：优先覆盖主题变量（改 `_theme-config.scss` 或 `data-theme`），而非改组件内部值。
3. **换图标**：用 `icon-image-catch-skill` 抓专业图标替换默认的字符占位/emoji。
4. **深度定制某块**：用对应 slot 完全重写，不需要动组件骨架。
5. **页面内部滚动**：`tab-list-page` / `chat-page` / `product-detail-page` 内置了局部 `scroll-view`（Tab 吸顶/底部栏固定场景）；若你的页面需要整页原生滚动，把内部 `scroll-view` 改为 `view` 并去掉高度约束即可。
