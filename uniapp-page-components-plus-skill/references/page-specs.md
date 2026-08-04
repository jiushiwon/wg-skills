# 各组件 API 速查

本文件给出 `components/` 下 8 个组件的 Props / Slots / Emits / 默认数据与完整示例。
所有组件默认使用 uniapp-theme-skill 主题变量，复制进项目后无需改样式。

## 通用使用前提

- **状态栏**：`base-navbar` 默认 `status-bar-height=0`；小程序自定义导航时在 `App.vue` 定义 `--status-bar-height: 44px`（或页面传 prop）。
- **容器高度**：`search-page` / `form-page` / `home-page` 根容器 `height: 100%`，页面根元素需给高度（如 `100vh`）。
- **内部依赖**：`form-page` 依赖 `base-navbar` + `base-button`；`home-page` 依赖 `base-navbar` + `base-tabbar`；`login-page` 依赖 `base-button`。复制时连带。
- **数据对接**：搜索/提交/登录/加载等副作用在页面层走 request 封装，组件只展示 + emit。

---

## 1. base-button（自定义按钮）

**目录**：`src/components/base-button/base-button.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `primary \| ghost \| text \| danger` | `primary` | 按钮类型 |
| `size` | `sm \| md \| lg` | `md` | 尺寸 |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 加载中（内置转圈 + 禁用） |
| `block` | `boolean` | `false` | 宽度 100% |
| `shape` | `radius \| round` | `radius` | 圆角风格 |
| `icon` | `string` | `''` | 左侧图标 URL |
| `text` | `string` | `按钮` | 文本（slot 优先） |

### Slots / Emits

- 默认 `slot`：按钮文本
- Emits：`click`

### 使用示例

```vue
<template>
  <view class="page">
    <base-button type="primary" size="lg" :block="true" :loading="submitting" @click="submit">立即购买</base-button>
    <base-button type="ghost" size="md" @click="cancel">取消</base-button>
  </view>
</template>
```

---

## 2. base-navbar（自定义头部导航）

**目录**：`src/components/base-navbar/base-navbar.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `''` | 标题 |
| `showBack` | `boolean` | `true` | 显示返回 |
| `transparent` | `boolean` | `false` | 透明背景（沉浸式） |
| `fixed` | `boolean` | `false` | 吸顶 |
| `placeholder` | `boolean` | `true` | 吸顶时占位 |
| `statusBarHeight` | `string` | `'0'` | 状态栏高度（建议 `var(--status-bar-height)`） |
| `showStatusBar` | `boolean` | `true` | 是否渲染状态栏占位行 |
| `rightText` | `string` | `''` | 右侧文字按钮 |

### Slots / Emits

- `#left` / `#title` / `#right`：左/中/右自定义
- `#status-bar`：状态栏行
- Emits：`back`、`rightClick`

### 使用示例

```vue
<base-navbar
  title="设置"
  :fixed="true"
  :placeholder="true"
  status-bar-height="var(--status-bar-height)"
  @back="goBack"
>
  <template #right>
    <text class="nav-more" @click="onMore">⋯</text>
  </template>
</base-navbar>
```

> 小程序胶囊对齐属 app-generate `AppNavbar` 强约束场景，本组件为简易通用版（标题与返回/右侧同排）；需要胶囊对齐请用 AppNavbar 或用 `#title` slot 自处理。

---

## 3. base-tabbar（自定义底部菜单）

**目录**：`src/components/base-tabbar/base-tabbar.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `TabbarItem[]` | 首页/发现/我的 | `{ key, text, icon?, activeIcon?, badge? }` |
| `modelValue` | `string \| number` | `home` | 激活 key（v-model） |
| `fixed` | `boolean` | `true` | 底部固定 |
| `safeArea` | `boolean` | `true` | 安全区适配 |

### Slots / Emits

- `#item`：`{ item, active }` 自定义菜单项
- Emits：`update:modelValue`、`change`

### 使用示例

```vue
<template>
  <base-tabbar v-model="activeTab" :items="tabs" @change="onTabChange" />
</template>

<script setup lang="ts">
const tabs = [
  { key: 'home', text: '首页', icon: '/static/tab/home.png', activeIcon: '/static/tab/home-active.png' },
  { key: 'cart', text: '购物车', icon: '/static/tab/cart.png', badge: 3 },
]
</script>
```

---

## 4. base-form-item（表单行）

**目录**：`src/components/base-form-item/base-form-item.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `string` | `''` | 标签文案 |
| `required` | `boolean` | `false` | 必填星号 |
| `error` | `string` | `''` | 错误提示（非空显示 + 行标红） |
| `labelWidth` | `string` | `160rpx` | 标签列宽 |

### Slots / Emits

- 默认 `slot`：控件（原生 input / picker / switch / textarea）
- `#label` / `#error`：自定义 label / 错误

### 使用示例

```vue
<base-form-item label="昵称" required :error="errors.nickname">
  <input class="form-input" v-model="form.nickname" placeholder="请输入昵称" />
</base-form-item>
<base-form-item label="性别">
  <picker :range="['男', '女']" @change="onGender">
    <text class="form-value">{{ form.gender || '请选择' }}</text>
  </picker>
</base-form-item>
```

---

## 5. search-page（搜索页）

**目录**：`src/components/search-page/search-page.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | `string` | `搜索` | 搜索框占位 |
| `searchText` | `string` | `搜索` | 右侧按钮文案 |
| `historyList` | `string[]` | `[]` | 历史搜索 |
| `hotList` | `string[]` | `[]` | 热门搜索 |
| `showHistory` | `boolean` | `true` | 显示历史区 |
| `showHot` | `boolean` | `true` | 显示热门区 |
| `resultList` | `any[]` | `[]` | 结果列表（非空/已搜索 → 结果态） |
| `focused` | `boolean` | `false` | 自动聚焦 |
| `itemField` | `string` | `title` | 结果项文本字段 |

### Slots / Emits

- `#result`：`{ item, index }` 结果项
- `#history` / `#hot`：自定义标签区
- `#empty`：空结果
- `#bar`：自定义搜索栏
- Emits：`input`（600ms 防抖）、`search`、`clearHistory`、`deleteHistory`、`hotClick`、`itemClick`、`clear`

### 完整示例

```vue
<view style="height:100vh">
  <search-page
    :history-list="history"
    :hot-list="['保温杯', '无线耳机', '数据线']"
    :result-list="results"
    @search="onSearch"
    @input="onInput"
    @clear-history="history = []"
    @item-click="onResultClick"
  >
    <template #result="{ item }">
      <view class="row">
        <text>{{ item.title }}</text>
        <text class="price">¥{{ item.price }}</text>
      </view>
    </template>
  </search-page>
</view>

<script setup lang="ts">
import { ref } from 'vue'

const history = ref<string[]>(['保温杯'])
const results = ref<any[]>([])
function onSearch(kw: string) {
  if (kw) history.value = [kw, ...history.value.filter((h) => h !== kw)].slice(0, 10)
  // 调 request 封装查结果 → results.value = res.data.list
}
function onInput(kw: string) {
  // 实时联想（可选）
}
function onResultClick(item: any) {
  // 跳转详情
}
</script>
```

---

## 6. form-page（表单页）

**目录**：`src/components/form-page/form-page.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `表单` | 导航栏标题 |
| `showBack` | `boolean` | `true` | 显示返回 |
| `submitText` | `string` | `提交` | 提交按钮文案 |
| `showFooter` | `boolean` | `true` | 显示底部提交栏 |
| `loading` | `boolean` | `false` | 提交中（按钮 loading） |
| `disabled` | `boolean` | `false` | 提交禁用 |

### Slots / Emits

- `#form`：表单区（放 base-form-item）
- `#footer`：自定义底部
- `#navbar`：自定义导航
- 默认 `slot`：表单区下方内容
- Emits：`back`、`submit`

### 完整示例

```vue
<form-page title="编辑资料" :loading="saving" :disabled="!valid" @submit="onSubmit">
  <template #form>
    <base-form-item label="昵称" required :error="errs.nickname">
      <input class="fi" v-model="form.nickname" placeholder="请输入昵称" />
    </base-form-item>
    <base-form-item label="简介">
      <textarea class="fi" v-model="form.bio" placeholder="介绍一下自己" />
    </base-form-item>
    <base-form-item label="性别">
      <picker :range="['男', '女']">
        <text>{{ form.gender || '请选择' }}</text>
      </picker>
    </base-form-item>
  </template>
</form-page>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const saving = ref(false)
const errs = reactive<Record<string, string>>({})
const form = reactive({ nickname: '', bio: '', gender: '' })
function onSubmit() {
  // 校验 → 调 request 封装提交 → saving 控制 loading
}
</script>
```

---

## 7. login-page（登录页）

**目录**：`src/components/login-page/login-page.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `欢迎登录` | 主标题 |
| `subtitle` | `string` | `''` | 副标题 |
| `submitText` | `string` | `登录` | 登录按钮文案 |
| `loading` | `boolean` | `false` | 提交中 |
| `showWechat` | `boolean` | `true` | 显示微信一键登录 |
| `showAgreement` | `boolean` | `true` | 显示协议勾选 |
| `agreementText` | `string` | 默认协议文案 | 协议文案 |

### Slots / Emits

- `#logo`：logo 区
- `#form`：表单区（整体替换默认的手机号+验证码）
- `#footer`：底部额外内容（如"忘记密码"）
- `#agreement`：协议行
- Emits：`submit({ phone, code })`、`wechatLogin`、`agreementChange`、`getCode(phone)`

### 完整示例

```vue
<view style="height:100vh">
  <login-page
    title="欢迎登录"
    subtitle="新用户默认注册"
    :loading="logging"
    @submit="onLogin"
    @wechat-login="onWechat"
    @get-code="sendCode"
  >
    <template #footer>
      <text class="forgot" @click="goFind">忘记密码？</text>
    </template>
  </login-page>
</view>

<script setup lang="ts">
import { ref } from 'vue'

const logging = ref(false)
function onLogin(data: { phone: string; code: string }) {
  // 调 auth-skill 登录接口（request 封装统一处理 401/防抖）
}
function sendCode(phone: string) {
  // 调验证码接口
}
</script>
```

> 注意：`showAgreement=true` 时，协议未勾选则 `submit` **不会触发**（组件内静默拦截，符合 R11 组件不弹提示）。页面层可通过 `@agreement-change` 监听勾选状态，未勾选时自行 toast 提示"请先阅读并同意协议"。

---

## 8. home-page（首页 / 商城首页）

**目录**：`src/components/home-page/home-page.vue`

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `navbarTitle` | `string` | `首页` | 导航标题 |
| `showNavbar` | `boolean` | `true` | 显示默认导航 |
| `tabbarItems` | `TabbarItem[]` | `[]` | 底部菜单（空不显示） |
| `activeTab` | `string \| number` | `home` | 底部激活 key（v-model） |
| `list` | `any[]` | `[]` | 列表数据（走 #list slot） |
| `loading` / `finished` | `boolean` | `false` | 加载提示 |
| `enablePullRefresh` | `boolean` | `true` | 启用下拉刷新 |
| `refreshing` | `boolean` | `false` | 下拉刷新中 |

### Slots / Emits

- `#search` / `#banner` / `#category` / `#grid` / `#sections`：各区块 slot
- `#list`：整个列表区（覆盖默认的 empty/listItem 分支）
- `#listItem`：`{ list }` 仅当 `list` 非空且未提供 `#list` 时，渲染列表项内容
- `#empty`：空列表（未提供 `#list` 时）
- `#navbar`：自定义导航
- Emits：`refresh`、`loadMore`、`tabChange`、`update:activeTab`

### 完整示例

```vue
<view style="height:100vh">
  <home-page
    navbar-title="商城"
    :tabbar-items="tabs"
    v-model:active-tab="activeTab"
    :loading="loading"
    :finished="finished"
    :refreshing="refreshing"
    @refresh="onRefresh"
    @load-more="onLoadMore"
    @tab-change="onTabChange"
  >
    <template #search>
      <view class="hp-search" @click="goSearch">🔍 搜索商品</view>
    </template>

    <template #banner>
      <swiper class="hp-banner" indicator-dots autoplay circular>
        <swiper-item v-for="b in banners" :key="b">
          <image class="hp-banner-img" :src="b" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </template>

    <template #category>
      <view class="hp-cats">
        <view v-for="c in cats" :key="c.name" class="hp-cat">
          <text class="hp-cat-text">{{ c.name }}</text>
        </view>
      </view>
    </template>

    <template #list>
      <view class="goods-grid">
        <image-card v-for="g in goods" :key="g.id" :image="g.image" :title="g.title" :price="g.price" />
      </view>
    </template>
  </home-page>
</view>
```

> `image-card` / `base-card` 来自 `uniapp-page-components-skill`，两技能可混用。

---

## 扩展建议

1. **加新入参**：在 `interface Props` 加字段 + `withDefaults` 给默认值，向后兼容。
2. **换样式**：优先覆盖主题变量（改 `data-theme` / `_theme-config.scss`），不改组件内部值。
3. **换图标**：用 `icon-image-catch-skill` 抓专业图标替换字符占位。
4. **自定义区块**：`home-page` 各区块 slot 自由替换；`login-page` 用 `#form` 整体换成密码登录。
5. **状态栏**：小程序端务必在 `App.vue` 定义 `--status-bar-height`，否则 `base-navbar` 贴顶。
