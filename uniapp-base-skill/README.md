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

### 2. 必须智能使用真实图标与图片素材

生成页面时**禁止**使用 emoji 作为功能图标，**禁止**使用空白占位图。应调用：

- [icon-catch-skill](../icon-image-catch-skill/icon-catch-skill/)：功能图标 / TabBar 图标（默认 lucide）
- [image-catch-skill](../icon-image-catch-skill/image-catch-skill/)：配图 / 头像 / Banner
- [image-forge-skill](../image-forge-skill/)：图标生成、图片压缩裁剪（兜底）

```vue
<!-- ✅ 正确 -->
<image src="/static/icons/heart.svg" mode="aspectFit" />

<!-- ❌ 禁止 emoji 与空白占位 -->
<text>❤️</text>
<image src="" mode="aspectFill" />
```

### 3. 禁止使用 H5 标签

- ❌ `div` / `p` / `span` / `img`
- ✅ `view` / `text` / `image`

### 4. 禁止 scroll-view

使用页面级滚动，避免右边距问题。

### 5. 禁止原生 button

使用 view 模拟按钮。

## 技能矩阵

本技能是 uniapp 技能矩阵的核心入口，生成页面时默认联动：

| 配套技能 | 协作职责 |
|---------|---------|
| [uniapp-theme-skill](../uniapp-theme-skill/) | 主题变量系统，禁止写死色值 |
| [uniapp-style-skill](../uniapp-style-skill/) | 设计系统对齐、组件 Token、设计审计 |
| [frontend-style-harmonizer-skill](../frontend-style-harmonizer-skill/) | 跨页面样式一致性治理、硬编码收敛 |
| [icon-image-catch-skill](../icon-image-catch-skill/) | 图标/图片远程抓取 |
| [image-forge-skill](../image-forge-skill/) | 图标生成、图片处理 |

标准工作流：

```
uniapp-base-skill（骨架）
→ uniapp-theme-skill（主题变量）
→ icon-catch-skill（图标）
→ image-catch-skill（图片）
→ image-forge-skill（后处理，按需）
→ uniapp-style-skill（设计审计）
→ frontend-style-harmonizer-skill（样式治理）
```

## 文件结构

```
uniapp-base-skill/
├── SKILL.md              # 系统介绍 + 规范 + 版本日志
├── README.md             # 本文件
├── base-card.md          # 核心：基础卡片
├── references/           # 参考资料
│   └── skill-matrix.md   # 技能矩阵与协作流程
└── demo-components/       # Demo 案例
    ├── chat.md
    ├── product.md
    ├── list/             # 列表页案例集（6种风格）
    │   ├── README.md
    │   ├── friend-list.md
    │   ├── follow-list.md
    │   ├── like-list.md
    │   ├── points-center.md
    │   ├── collection-settings.md
    │   ├── order-after-sale.md
    │   ├── html/          # HTML 演示
    │   └── images/        # 示例图片
    └── detail/           # 详情页案例集（6种风格）
        ├── README.md
        ├── html/          # HTML 演示
        └── static/        # 示例图标/图片
    └── layout/           # 布局与导航案例集
        ├── README.md
        ├── tabbar/        # 自定义 TabBar（5种）
        └── login/         # 登录页（7种）
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

| 案例 | 风格 | 适用场景 | 文档 |
|------|------|----------|------|
| friend-list | 圆角+间距+圆形头像 | 好友、联系人 | [friend-list.md](demo-components/list/friend-list.md) |
| follow-list | 圆角+间距+方形封面 | 关注、订阅 | [follow-list.md](demo-components/list/follow-list.md) |
| like-list | 圆角+间距+Tab切换 | 获赞、收藏 | [like-list.md](demo-components/list/like-list.md) |
| points-center | 圆角+间距+渐变头部 | 积分、资产 | [points-center.md](demo-components/list/points-center.md) |
| collection-settings | 大卡片套小卡片 | 设置、偏好 | [collection-settings.md](demo-components/list/collection-settings.md) |
| order-after-sale | 圆角+间距+状态栏 | 订单、售后 | [order-after-sale.md](demo-components/list/order-after-sale.md) |

### 详情页（6种风格）

[查看 demo-components/detail/README.md](demo-components/detail/README.md)

| 案例 | 风格 | 适用场景 | 文档 |
|------|------|----------|------|
| product-detail | 轮播大图 + 信息卡片 + 底部操作 | 商品详情、服务详情 | [product-detail.md](demo-components/detail/product-detail.md) |
| activity-detail | 头图角标 + 时间地点 + 底部报名 | 活动详情、线路详情 | [activity-detail.md](demo-components/detail/activity-detail.md) |
| post-detail | 作者信息 + 内容 + 互动评论 | 帖子、日记、文章详情 | [post-detail.md](demo-components/detail/post-detail.md) |
| profile-detail | 渐变头部 + 统计 + VIP + 功能网格 | 个人中心、创作者中心 | [profile-detail.md](demo-components/detail/profile-detail.md) |
| wallet-detail | 渐变余额 + 交易明细 | 钱包、资产、积分 | [wallet-detail.md](demo-components/detail/wallet-detail.md) |
| result-detail | 状态图标 + 操作 + 推荐 | 支付结果、空状态、404 | [result-detail.md](demo-components/detail/result-detail.md) |

### 布局与导航（12 个案例）

[查看 demo-components/layout/README.md](demo-components/layout/README.md)

#### 自定义 TabBar（5 种）

| 案例 | 风格 | 适用场景 | 文档 |
|------|------|----------|------|
| bulge | 中间凸起 + 主色发布按钮 | 社区首页、内容平台 | [tabbar/bulge.md](demo-components/layout/tabbar/bulge.md) |
| blur | 毛玻璃背景 + 圆角顶部 | 高端生活类 App | [tabbar/blur.md](demo-components/layout/tabbar/blur.md) |
| standard | 标准图标 + 文字 + 顶部细线 | 通用型 App | [tabbar/standard.md](demo-components/layout/tabbar/standard.md) |
| floating-pill | 悬浮药丸 + 毛玻璃 + 圆角 | 健康、生活、工具类 App | [tabbar/floating-pill.md](demo-components/layout/tabbar/floating-pill.md) |
| assistant-split | 左侧独立 AI 助手 + 右侧连体工具组 | AI 助手、健康管理类 App | [tabbar/assistant-split.md](demo-components/layout/tabbar/assistant-split.md) |

#### 登录页（7 种）

| 案例 | 风格 | 适用场景 | 文档 |
|------|------|----------|------|
| login | 标准账号登录：Logo + 账号密码 + 登录按钮 + 第三方登录 | 通用 App | [login/login.md](demo-components/layout/login/login.md) |
| login-phone | 手机号 + 验证码登录 | 手机号优先的 App | [login/login-phone.md](demo-components/layout/login/login-phone.md) |
| login-wechat | 一键登录风格：Logo + 微信一键登录按钮 + 协议 | 微信生态 App | [login/login-wechat.md](demo-components/layout/login/login-wechat.md) |
| login-minimal | 极简清爽：无圆角/小圆角、头部 Logo、下划线输入框 | 工具类、B端 App | [login/login-minimal.md](demo-components/layout/login/login-minimal.md) |
| login-gradient | 动态渐变背景 + 毛玻璃登录卡片 + 浮动光晕 | 创意、社交、年轻化 App | [login/login-gradient.md](demo-components/layout/login/login-gradient.md) |
| login-hero | 顶部主题图 + Logo + 缓慢缩放动效 + 简洁表单 | 旅游、生活方式 App | [login/login-hero.md](demo-components/layout/login/login-hero.md) |
| login-float | 深色背景 + 浮动圆形渐变 + 毛玻璃 Logo + 清爽登录卡片 | 社交、内容、社区类 App | [login/login-float.md](demo-components/layout/login/login-float.md) |

## 触发词

- 按钮 / 设置项 / 输入框 / 头像 / 卡片
- 登录页 / 手机号登录 / 微信登录
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

### 详情页
```
做一个商品详情页，顶部轮播图，标题价格，规格配送，底部购买按钮
做一个活动详情页，顶部大图带状态角标，时间地点信息，底部报名按钮
做一个帖子详情页，作者信息，大图正文，点赞评论互动
做一个个人中心，渐变头部，数据统计，VIP卡片，功能网格
做一个钱包详情页，渐变余额卡片，交易明细列表
做一个支付成功结果页，状态图标，操作按钮，推荐商品
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

### 组合技能工作流
```
生成一个积分中心页面，并走完整技能矩阵：
1. 用 uniapp-base-skill 生成页面骨架
2. 用 uniapp-theme-skill 应用主题变量
3. 用 icon-catch-skill 抓取任务图标
4. 用 image-catch-skill 抓取背景/头像素材
5. 用 uniapp-style-skill 审查设计系统合规
6. 用 frontend-style-harmonizer-skill 统一跨页面样式
```

## 使用前提

1. **必须安装** uniapp-theme-skill
2. **建议搭配** icon-image-catch-skill 获取真实图标/图片
3. **生成后建议** 使用 uniapp-style-skill 或 frontend-style-harmonizer-skill 做样式规范对齐
4. 了解基础 CSS
5. 测试时兼顾小程序和 App 端

---

## 版本日志

### v1.4.0 (2026-08-18)

**新增功能**

- ✅ 布局与导航案例集聚焦为：自定义 TabBar、登录页
- ✅ 新增登录页 demo：标准账号登录、手机号验证码登录、一键登录风格、极简登录、渐变登录、主题图登录、浮动圆形登录
- ✅ 自定义 TabBar 新增：标准图标文字型、中间凸起型、毛玻璃背景型、悬浮药丸型、AI 助手分栏型
- ✅ 所有 demo 均采用完整页面形式，可直接预览
- ✅ 综合页面模板迁移至 `docs/uniapp-base-skill-demo/`，作为后续专题素材
- ✅ 触发词更新：新增登录页、手机号登录、微信登录、极简登录、渐变登录、主题图登录、浮动登录

### v1.3.0 (2026-08-16)

**新增功能**

- ✅ 明确技能矩阵定位，联动主题、样式、素材技能
- ✅ 强制规范新增：禁止使用 emoji 和空白图片占位
- ✅ 新增组合技能工作流示例

### v1.2.0 (2026-08-15)

**新增功能**

- ✅ 新增详情页案例集（6种风格）
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
