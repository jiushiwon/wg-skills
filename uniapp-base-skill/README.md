# uniapp-base-skill

> 基于"一切皆卡片"思想，通过参数组合生成不同形态的页面。核心是 base-card 基础卡片，chat/product 等案例展示如何组合。

## 核心理念

> **所有页面都是由"卡片容器 + 内容"组成，通过调整宽高、背景色、圆角、内外边距等参数，可以组合出任意形态。**

## 强制规范 ⚠️

### 1. 必须使用 uniapp-theme-skill 主题系统

```ts
// ✅ 正确
:style="{ background: 'var(--color-primary)' }"

// ❌ 禁止
:style="{ background: '#07c160' }"
```

### 2. 禁止使用 H5 标签

- ❌ `div` / `p` / `span` / `img`
- ✅ `view` / `text` / `image`

### 3. 禁止 scroll-view

使用页面级滚动，避免右边距问题。

### 4. 禁止原生 button

使用 view 模拟按钮。

## 文件结构

```
uniapp-base-skill/
├── SKILL.md              # 系统介绍 + 规范 + 版本日志
├── README.md             # 本文件
├── base-card.md          # 核心：基础卡片
└── demo-components/       # Demo 案例
    ├── chat.md
    ├── product.md
    └── list/             # 列表页案例集（6种风格）
        ├── README.md
        ├── friend-list.md
        ├── follow-list.md
        ├── like-list.md
        ├── points-center.md
        ├── collection-settings.md
        ├── order-after-sale.md
        ├── html/          # HTML 演示
        └── images/        # 示例图片
```

## 核心：base-card

[查看 base-card 完整文档](base-card.md)

## Demo 案例

> ⚠️ demo-components 目录下的案例是 demo 示例，非完美实现，仅供参考。

### 聊天/商品

[查看 demo-components/chat.md](demo-components/chat.md)  
[查看 demo-components/product.md](demo-components/product.md)

### 列表页（6种风格）

[查看 demo-components/list/README.md](demo-components/list/README.md)

| 案例 | 风格 | 适用场景 |
|------|------|----------|
| friend-list | 圆角+间距+圆形头像 | 好友、联系人 |
| follow-list | 圆角+间距+方形封面 | 关注、订阅 |
| like-list | 圆角+间距+Tab切换 | 获赞、收藏 |
| points-center | 圆角+间距+渐变头部 | 积分、资产 |
| collection-settings | 大卡片套小卡片 | 设置、偏好 |
| order-after-sale | 圆角+间距+状态栏 | 订单、售后 |

## 触发词

- 按钮 / 设置项 / 输入框 / 头像 / 卡片
- 聊天页 / 商品详情 / 列表页

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
做一个好友列表，圆形头像
做一个关注列表，方形封面图
做一个设置页面，分组样式
做一个订单列表，带状态和按钮
```

### 参数化调整
```
聊天页改成方形头像
商品页改成圆角图片
把当前页面改成暗黑模式
列表改成圆角+间距风格
```

### 组合使用
```
在聊天页底部加一个输入框组件
给商品页加一个规格选择的卡片
页面改成蓝色主题
```

## 使用前提

1. **必须安装** uniapp-theme-skill
2. 了解基础 CSS
3. 测试时兼顾小程序和 App 端

---

## 版本日志

### v1.1.0 (2025-08-12)

**新增功能**

- ✅ base-card 新增图片属性：`image`、`imageSize`、`imageRadius`
- ✅ 新增列表页案例集（6种风格）
- ✅ 支持 uniapp-theme-skill 变量引用

**列表页案例**

- ✅ friend-list（好友列表）
- ✅ follow-list（关注列表）
- ✅ like-list（获赞与收藏）
- ✅ points-center（升值中心）
- ✅ collection-settings（设置列表）
- ✅ order-after-sale（订单列表）

### v1.0.0 (2025-08-07)

**初始版本**

- ✅ base-card 基础卡片
- ✅ chat-page 聊天页案例
- ✅ product-page 商品页案例
- ✅ 强制规范（主题变量/H5标签/scroll-view/button）
- ✅ APP 端兼容性规范
