# 业务场景对照 · 新增组件案例

本文档给出 7 个新增组件在实际业务中的具体用法，每个场景 = 场景描述 + 代码 + 效果对照。

---

## 1. `base-avatar` — 头像

**场景 A：评论区头像列表**

```vue
<!-- 5 个不同用户的头像，各自处理加载失败兜底 -->
<view class="comment-list">
  <view v-for="c in comments" :key="c.id" class="row">
    <base-avatar :src="c.avatar" :nickname="c.name" size="sm" />
    <text>{{ c.content }}</text>
  </view>
</view>
```

**场景 B：个人主页大号头像**

```vue
<base-avatar :src="user.avatar" :nickname="user.nickname" size="lg" @click="goProfile" />
```

**场景 C：消息列表小头像**

```vue
<base-avatar :src="chat.avatar" :nickname="chat.name" size="sm" />
```

| 尺寸 | 值 | 适用 |
|------|-----|------|
| sm | 64rpx | 列表项、聊天、评论 |
| md | 96rpx | 朋友圈动态 |
| lg | 128rpx | 个人主页、登录页 |

---

## 2. `user-card` — 用户卡片

**场景 A：关注列表**

```vue
<scroll-view scroll-y>
  <user-card
    v-for="u in followList" :key="u.id"
    :avatar="u.avatar" :nickname="u.name" :desc="u.bio"
    :action-text="u.followed ? '已关注' : '关注'"
    :action-type="u.followed ? 'text' : 'primary'"
    @action-click="toggleFollow(u)"
    @avatar-click="goProfile(u.id)"
  />
</scroll-view>
```

**场景 B：搜索结果作者卡**

```vue
<user-card
  :avatar="result.author.avatar" :nickname="result.author.name"
  action-text="私信" action-type="ghost"
  :clickable="true"
  @click="goArticle(result.id)" @action-click="openChat(result.author.id)"
/>
```

**场景 C：群成员列表（无按钮）**

```vue
<user-card
  v-for="m in members" :key="m.id"
  :avatar="m.avatar" :nickname="m.name" :desc="m.role"
  @click="showMemberDetail(m)"
/>
```

> `actionText` 为空时右侧按钮不显示，变成纯展示卡。

---

## 3. `comment-item` — 评论条

**场景 A：文章评论区**

```vue
<view class="comments">
  <comment-item
    v-for="c in comments" :key="c.id"
    :avatar="c.avatar" :nickname="c.name" :time="c.time"
    :content="c.content" :like-count="c.likes" :liked="c.liked"
    @like-click="toggleLike(c)" @reply-click="focusReply(c)"
    @avatar-click="goProfile(c.uid)"
  />
</view>
```

**场景 B：回复子楼（显示"回复 X"前缀）**

```vue
<comment-item
  :avatar="reply.avatar" :nickname="reply.name" :time="reply.time"
  :content="reply.content" :reply-to="reply.parentName"
  :likeable="true" :replyable="false"
/>
```

**场景 C：评价列表（不可回复）**

```vue
<comment-item
  v-for="r in reviews" :key="r.id"
  :avatar="r.avatar" :nickname="r.name" :time="r.time"
  :content="r.content" :like-count="r.likes"
  :replyable="false"
/>
```

---

## 4. `notice-bar` — 通知栏

**场景 A：首页活动公告（可关闭）**

```vue
<notice-bar
  v-if="showBanner"
  text="本周新品已上线，全场低至 5 折！"
  :closable="true"
  @click="goActivity" @close="showBanner = false"
/>
```

**场景 B：网络异常提示（不可关闭，醒目背景）**

```vue
<notice-bar
  text="网络连接失败，请检查网络设置"
  :closable="false"
  bg="#FEF2F2"
/>
```

**场景 C：系统维护跑马灯**

```vue
<notice-bar
  text="系统升级通知：今晚 02:00-04:00 服务器维护，部分功能暂不可用，敬请谅解。"
  :scrollable="true"
  :closable="false"
/>
```

---

## 5. `setting-item` — 设置行

**场景 A：设置页**

```vue
<base-card>
  <setting-item icon-text="设" label="个人资料" @click="goProfile" />
  <setting-item icon-text="通" label="消息通知" :show-switch="true" v-model="notify" />
  <setting-item icon-text="安" label="隐私设置" @click="goPrivacy" />
  <setting-item icon-text="关" label="关于我们" value="v1.2.0" :arrow="false" :clickable="false" />
</base-card>
```

**场景 B：文件管理行**

```vue
<setting-item
  :icon="file.icon" :label="file.name" :value="file.size"
  badge="新"
  @click="download(file)"
/>
```

**场景 C：收货地址列表**

```vue
<base-card>
  <setting-item
    v-for="addr in addresses" :key="addr.id"
    icon-text="址" :label="addr.full" :desc="addr.name + ' ' + addr.phone"
    @click="editAddress(addr)"
  />
</base-card>
```

---

## 6. `empty` — 空状态

**场景 A：空购物车**

```vue
<empty text="购物车是空的" description="去挑选心仪的商品吧" action-text="去逛逛" @action-click="goShop" />
```

**场景 B：无收藏**

```vue
<empty text="暂无收藏" icon="★" />
```

**场景 C：无网络**

```vue
<empty text="网络连接失败" description="请检查网络后重试" action-text="重试" @action-click="reload" />
```

> 在 `v-if="list.length === 0"` 的 `v-else` 分支里放 `<empty>`，替代"暂无数据"硬编码。

---

## 7. `result-page` — 结果页

**场景 A：支付成功**

```vue
<result-page
  status="success"
  title="支付成功"
  description="订单号 A20260804，预计 3 天内发货"
  primary-text="查看订单"
  secondary-text="返回首页"
  @primary-click="goOrder" @secondary-click="goHome"
/>
```

**场景 B：支付失败**

```vue
<result-page
  status="error"
  title="支付失败"
  description="余额不足，请更换支付方式或充值"
  primary-text="重新支付"
  secondary-text="换其他方式"
  @primary-click="retryPay" @secondary-click="switchPayMethod"
/>
```

**场景 C：提交成功反馈**

```vue
<result-page
  status="success"
  title="反馈已提交"
  description="感谢您的反馈，我们会尽快处理"
  primary-text="返回首页"
  @primary-click="goHome"
/>
```

**场景 D：操作提醒**

```vue
<result-page
  status="warning"
  title="确认删除？"
  description="删除后无法恢复"
  primary-text="确认删除"
  secondary-text="取消"
  @primary-click="doDelete" @secondary-click="goBack"
/>
```

---

## 全链路串联示例：电商 App 采购流程

用新增组件串一个完整业务流：

```
登录页(login-page)
  → 首页(home-page) + base-tabbar
    → notice-bar 顶部公告
    → search-page 搜商品
      → user-card 显示店铺作者
        → 点击店铺 → product-detail-page 商品详情
          → 底部按钮 → form-page 填写地址（setting-item 选择地址）
            → result-page 支付成功
              → profile-page(我的) → setting-item 查看订单

空态处理：
  搜索无结果 → empty
  购物车空 → empty + actionText
  网络错误 → notice-bar(bg="#FEF2F2") + empty(text="网络连接失败")
```
