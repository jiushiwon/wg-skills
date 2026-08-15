---
name: uniapp-base-skill
description: 基于"一切皆卡片"思想，通过参数组合生成页面。核心是 base-card 基础卡片，chat/product 等案例展示如何组合。
trigger: |
  # 基础组件
  帮我做一个按钮组件 | 生成一个设置项 | 做一个输入框 | 做一个头像 | 做一个卡片
  # 完整页面
  帮我做一个聊天页面 | 做一个商品详情页 | 做一个个人中心页
  # 列表页（六类）
  做一个好友列表 | 做一个关注列表 | 做一个获赞与收藏列表
  做一个设置列表 | 做一个订单列表 | 做一个积分中心
  # 详情页（六类）
  做一个商品详情页 | 做一个活动详情页 | 做一个帖子详情页
  做一个个人中心页 | 做一个钱包详情页 | 做一个结果页 | 做一个支付成功页
  # 通用列表
  做一个列表页 | 做一个带图片的列表 | 做一个分组设置的列表
  # 通用详情
  做一个详情页 | 做一个带大图头的详情 | 做一个带操作按钮的详情
  # 参数化调整
  改成方形头像 | 改成圆角图片 | 改成暗黑模式 | 改成蓝色主题
  列表改成圆角+间距风格 | 改成大卡片套小卡片样式
  # 组合使用
  加一个输入框组件 | 加一个规格选择卡片 | 页面改成XX主题
---

# uniapp-base-skill

> 核心观点：**所有页面都是由"卡片容器 + 内容"组成**

## 架构图

```
base-card（基础卡片）
    ↓ 组合
base-btn / base-list-item / base-input / base-avatar（基础组件）
    ↓ 组合
chat-page / product-page（页面案例）
```

## 核心：base-card

**base-card 是所有组件的基石**，它提供：
- 宽高控制
- 背景色
- 圆角
- 内边距
- 外边距
- 边框
- 阴影

[查看 base-card 完整文档](base-card.md)

## 强制规范 ⚠️

### 1. 必须使用 uniapp-theme-skill 主题系统

```ts
// ✅ 正确：使用主题变量
:style="{ background: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }"

// ❌ 错误：禁止写死颜色
:style="{ background: '#07c160' }"
```

**主题变量清单**：
- 颜色：`var(--color-primary)`、`var(--color-bg-surface)`、`var(--color-text-primary)`
- 尺寸：`var(--height-btn-md)`、`var(--spacing-lg)`、`var(--radius-md)`
- 详见 [uniapp-theme-skill](../uniapp-theme-skill/)

### 2. 禁止使用 H5 标签

```vue
<!-- ❌ 错误：H5 标签在 APP 端不兼容 -->
<div>...</div>
<p>...</p>
<span>...</span>

<!-- ✅ 正确：使用 uniapp 基础组件 -->
<view>...</view>
<text>...</text>
```

**原因**：div/p/span 是 H5 标签，在 App 端 uni-app 会转换为原生组件，表现可能不一致。

### 3. 禁止使用 scroll-view 组件

```vue
<!-- ❌ 错误：scroll-view 存在右边距问题 -->
<scroll-view scroll-y>...</scroll-view>

<!-- ✅ 正确：页面级滚动 -->
<view class="page-container">
  <!-- 内容自然滚动 -->
</view>
```

**原因**：scroll-view 在某些机型存在右边距问题，且与页面级滚动混用时会有层级冲突。

### 4. 禁止使用原生 button 组件

```vue
<!-- ❌ 错误：原生 button 样式难统一 -->
<button>按钮</button>

<!-- ✅ 正确：使用 view + clickable 模拟 -->
<view class="base-btn" @click="onClick">按钮</view>
```

**原因**：原生 button 样式难以统一，且在 uniapp 中各平台表现不一致。

### 5. 推荐使用 uniapp 基础组件

| 推荐 ✅ | 避免 ❌ |
|---------|----------|
| `view` | `div`、`p`、`span`（H5 标签） |
| `text` | `span`（H5 标签） |
| `image` | `img`（H5 标签） |
| `input` | 原生 `textarea`（长文本除外） |
| `picker` | 自定义日期选择器（除非特殊需求） |

### 6. APP 端兼容性规范

```vue
<!-- ✅ 正确：明确指定尺寸，避免依赖内容撑开 -->
<view class="btn" style="height: 80rpx; line-height: 80rpx;">按钮</view>

<!-- ❌ 错误：App 端可能显示异常 -->
<view class="btn">按钮</view>

<!-- ✅ 正确：flex 布局明确主轴方向 -->
<view style="display: flex; align-items: center;">
  <text>文字</text>
</view>

<!-- ❌ 错误：App 端 align-items 可能不生效 -->
<view style="display: inline-flex;">
  <text>文字</text>
</view>
```

**APP 端常见问题**：
- **高度不固定**：App 端 view 默认高度为 0，必须指定 height 或使用 flex
- **flex 失效**：确保父容器有明确宽高或使用 `flex: 1`
- **点击区域**：点击区域至少 44px（44rpx * 2 ≈ 88rpx），符合交互规范
- **文字换行**：text 组件默认不换行，需设置 `decode` 或 `selectable`

```vue
<!-- 文字换行问题 -->
<text decode>&nbsp;</text>  <!-- 解决 App 端 nbsp 不显示 -->
<text selectable>可选择文本</text>
```

## Demo 案例

> ⚠️ demo-components 目录下的案例是 demo 示例，非完美实现，仅供参考。

### 聊天/商品

| 案例 | 说明 | 文档 |
|------|------|------|
| chat-page | 聊天页面 | [demo-components/chat.md](demo-components/chat.md) |
| product-page | 商品详情页 | [demo-components/product.md](demo-components/product.md) |

### 列表页（六类风格）

| 案例 | 风格 | 触发词 | 文档 |
|------|------|--------|------|
| friend-list | 圆角+圆形头像+间距 | 好友列表、联系人 | [list/friend-list.md](demo-components/list/friend-list.md) |
| follow-list | 圆角+方形封面+间距 | 关注列表、订阅号 | [list/follow-list.md](demo-components/list/follow-list.md) |
| like-list | 圆角+Tab切换+间距 | 获赞收藏、互动消息 | [list/like-list.md](demo-components/list/like-list.md) |
| points-center | 圆角+渐变头部+间距 | 积分中心、资产中心 | [list/points-center.md](demo-components/list/points-center.md) |
| collection-settings | 大卡片套小卡片 | 设置列表、分组设置 | [list/collection-settings.md](demo-components/list/collection-settings.md) |
| order-after-sale | 圆角+状态栏+间距 | 订单列表、售后列表 | [list/order-after-sale.md](demo-components/list/order-after-sale.md) |

### 详情页（六类风格）

| 案例 | 风格 | 触发词 | 文档 |
|------|------|--------|------|
| product-detail | 轮播大图+信息卡片+底部操作 | 商品详情、服务详情 | [detail/README.md](demo-components/detail/README.md) |
| activity-detail | 头图角标+时间地点+底部报名 | 活动详情、线路详情 | [detail/README.md](demo-components/detail/README.md) |
| post-detail | 作者信息+内容+互动评论 | 帖子详情、日记详情 | [detail/README.md](demo-components/detail/README.md) |
| profile-detail | 渐变头部+统计+VIP+功能网格 | 个人中心、创作者中心 | [detail/README.md](demo-components/detail/README.md) |
| wallet-detail | 渐变余额+交易明细 | 钱包、资产、积分 | [detail/README.md](demo-components/detail/README.md) |
| result-detail | 状态图标+操作+推荐 | 支付结果、空状态、404 | [detail/README.md](demo-components/detail/README.md) |

[查看详情页案例集](demo-components/detail/README.md)

## 实用提示词案例

### 基础组件
```
帮我做一个按钮组件
生成一个设置项，左侧图标+文字+右侧箭头
需要一个输入框，带placeholder
做一个头像，圆形80rpx
```

### 完整页面
```
帮我做一个聊天页面，包含顶部导航、消息列表、底部输入框
做一个商品详情页，需要轮播图、价格区域、底部操作栏
```

### 列表页
```
做一个好友列表，圆形头像，圆角卡片
做一个关注列表，方形封面图
做一个获赞与收藏列表，带Tab切换
做一个设置列表，分组样式，大卡片套小卡片
做一个订单列表，带状态和操作按钮
做一个积分中心，带渐变头部
```

### 参数化调整
```
聊天页改成方形头像
商品页改成圆角图片
把当前页面改成暗黑模式
列表改成圆角+间距风格
改成大卡片套小卡片样式
```

### 组合使用
```
在聊天页底部加一个输入框组件
给商品页加一个规格选择的卡片
页面改成蓝色主题
```

## 基础组件

基于 base-card 组合的基础组件：

| 组件 | 触发词 | 说明 |
|------|--------|------|
| base-btn | 按钮 | view 模拟，非原生 button |
| base-list-item | 设置项 | 列表行 |
| base-input | 输入框 | 表单输入 |
| base-avatar | 头像 | 头像组件 |
| base-tag | 标签 | 标签角标 |

## 参数化思想

通过调整参数组合出不同形态：

```
┌─────────┐  ← 小卡片（padding小）
│ 内容    │
└─────────┘

┌─────────────────────────┐  ← 大卡片（padding大）
│         内容            │
└─────────────────────────┘

┌─────────┐  ← 圆形（radius: 50%）
│   头像   │
└─────────┘
```

## 使用前提

1. **必须安装** uniapp-theme-skill（主题变量）
2. 了解基础 CSS（flex、padding、margin、border-radius）
3. 测试时兼顾小程序和 App 端

## 文件结构

```
uniapp-base-skill/
├── SKILL.md              # 本文件：系统介绍 + 规范
├── README.md             # 用户文档
├── base-card.md          # 核心：基础卡片
└── demo-components/      # Demo 案例（参考，非完美实现）
    ├── chat.md           # 聊天页案例
    ├── product.md        # 商品页案例
    ├── list/             # 列表页案例集（6类）
    │   ├── README.md
    │   ├── friend-list.md
    │   ├── follow-list.md
    │   ├── like-list.md
    │   ├── points-center.md
    │   ├── collection-settings.md
    │   ├── order-after-sale.md
    │   ├── html/          # HTML 演示
    │   └── images/        # 示例图片
    └── detail/           # 详情页案例集（6类）
        ├── README.md
        ├── html/          # HTML 演示
        └── static/        # 示例图标/图片
```

## 版本日志

### v1.2.0 (2026-08-15)

**新增功能**

- ✅ 新增详情页案例集（6类风格）
- ✅ 使用 icon-image-catch-skill 抓取真实图标/图片素材
- ✅ 覆盖商品详情、活动详情、帖子详情、个人中心、钱包详情、结果页

**详情页案例**

- ✅ product-detail（商品详情）
- ✅ activity-detail（活动详情）
- ✅ post-detail（帖子详情）
- ✅ profile-detail（个人中心）
- ✅ wallet-detail（钱包详情）
- ✅ result-detail（结果页）

### v1.1.0 (2025-08-12)

**新增功能**

- ✅ base-card 新增图片属性：image / imageSize / imageRadius
- ✅ 新增列表页案例集（6类风格）
- ✅ 完整触发词覆盖

**列表页案例**

- ✅ friend-list（好友列表）
- ✅ follow-list（关注列表）
- ✅ like-list（获赞与收藏）
- ✅ points-center（积分中心）
- ✅ collection-settings（设置列表）
- ✅ order-after-sale（订单列表）

### v1.0.0 (2025-08-07)

**初始版本**

- ✅ 发布 base-card 基础卡片
- ✅ 发布 demo-components/chat.md 聊天页案例
- ✅ 发布 demo-components/product.md 商品页案例
- ✅ 强制规范：必须使用 uniapp-theme-skill 主题系统
- ✅ 强制规范：禁止使用 H5 标签（div/p/span/img）
- ✅ 强制规范：禁止使用 scroll-view
- ✅ 强制规范：禁止使用原生 button
- ✅ APP 端兼容性规范
