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
├── base-input.md         # 通用输入框（账号/密码/手机号/多行文本/图标/OTP/浮动标签/搜索栏）
├── base-input.md         # 通用输入框（账号/密码/手机号/多行文本/图标/OTP/浮动标签/搜索栏）
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
    │   ├── README.md
    │   ├── tabbar/        # 自定义 TabBar（5种）
    │   │   └── html/      # HTML 演示
    │   └── login/         # 登录页（7种）
    │       └── html/      # HTML 演示
    └── base-input/        # 输入框案例集（13种：7 通用 + 6 搜索栏独立形态）
    │   ├── README.md
    │   └── html/          # HTML 演示
```

## 核心：base-card

[查看 base-card 完整文档](base-card.md)

## 基础组件

| 组件 | 用途 | 文档 |
|------|------|------|
| base-card | 基础卡片，所有组件和页面的基石 | [base-card.md](base-card.md) |
| base-input | 通用输入框（账号/密码/手机号/多行文本/图标/OTP/浮动标签/搜索栏） | [base-input.md](base-input.md) / [HTML](demo-components/base-input/html/base-input-login.html) |
| base-search-bar | 搜索栏（已合并至 base-input，作为变体形态） | — |

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

### 输入框场景（13 种风格：7 通用 + 6 搜索栏）

> 输入框规范见 [base-input.md](base-input.md)
>
> [查看 demo-components/base-input/README.md](demo-components/base-input/README.md)

#### 通用输入（7 种）

| 案例 | 风格 | 适用场景 | HTML 参考图 |
|------|------|----------|-------------|
| base-input-login | 8px 卡片 + 全边框 + 8px 按钮 | 账号密码登录、注册 | [base-input-login.html](demo-components/base-input/html/base-input-login.html) |
| base-input-verify | 扁平卡片 + 底线分隔 + 验证码按钮 | 短信验证、绑定手机 | [base-input-verify.html](demo-components/base-input/html/base-input-verify.html) |
| base-input-feedback | 12px 卡片 + 多行文本 + 胶囊按钮 | 意见反馈、留言 | [base-input-feedback.html](demo-components/base-input/html/base-input-feedback.html) |
| base-input-disabled | 扁平卡片 + 灰底只读 | 订单详情、提交后表单 | [base-input-disabled.html](demo-components/base-input/html/base-input-disabled.html) |
| base-input-icon-prefix | 8px 全边框 + 前缀 icon/+86/¥ | 注册、收款（手机号/邮箱/金额） | [base-input-icon-prefix.html](demo-components/base-input/html/base-input-icon-prefix.html) |
| base-input-icon-suffix | 8px 浅底 + 后缀清除/按钮/胶囊 | 表单清除、验证码、单位 | [base-input-icon-suffix.html](demo-components/base-input/html/base-input-icon-suffix.html) |
| base-input-otp | 8px 卡片 + 6 位独立格子 | 支付、绑定、双因素 | [base-input-otp.html](demo-components/base-input/html/base-input-otp.html) |
| base-input-floating | 12px 卡片 + 浮动标签 + 底线 | 注册、信息收集 | [base-input-floating.html](demo-components/base-input/html/base-input-floating.html) |

#### 搜索栏变体（6 种独立形态）

> 搜索栏是 base-input 的一种变体形态（不单独建组件），6 种形态各成独立 HTML + MD 文档。

| 案例 | 形态 | 适用 | HTML 参考图 |
|------|------|------|-------------|
| base-input-search-pill | 999px 胶囊 + shadow-sm | 顶部导航主流 | [base-input-search-pill.html](demo-components/base-input/html/base-input-search-pill.html) |
| base-input-search-card | 8px 卡片 + shadow-sm | 结果页内嵌 | [base-input-search-card.html](demo-components/base-input/html/base-input-search-card.html) |
| base-input-search-bubble | 12px 大圆角 + shadow-md | 全局搜索弹窗 | [base-input-search-bubble.html](demo-components/base-input/html/base-input-search-bubble.html) |
| base-input-search-flat | 0 + 底边 | 极简 / 工具类 | [base-input-search-flat.html](demo-components/base-input/html/base-input-search-flat.html) |
| base-input-search-embed | 浅底 8px + 无 shadow | 头部轻搜索 | [base-input-search-embed.html](demo-components/base-input/html/base-input-search-embed.html) |
| base-input-search-mini | 浅底 999px + 36px | 头像旁内联 | [base-input-search-mini.html](demo-components/base-input/html/base-input-search-mini.html) |

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
- 搜索页 / 搜索结果页 / 无结果页
- 输入框场景：账号登录 / 短信验证 / 意见反馈 / 只读表单 / 图标输入 / 验证码格子 / 浮动标签 / 搜索栏变体

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

### 搜索页
```
做一个搜索页，带历史记录和热门搜索
做一个商品搜索结果页，带综合/销量/价格排序
做一个订单筛选页，带状态/时间/分类多条件筛选
做一个搜索无结果页，带换词推荐和热门搜索
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

### v1.6.0 (2026-08-20)

**新增功能**

- ✅ 输入框案例集重构：原 `search/` 并入 `base-input/`，共 14 个场景（8 通用 + 6 搜索栏独立形态）
- ✅ 8 个通用输入：login / verify / feedback / disabled / icon-prefix / icon-suffix / otp / floating
- ✅ 每个场景独立成 HTML + MD 文档，按形态检索复用
- ✅ `base-input` 与 `base-card` 同源：参数化外壳组件，统一包裹原生 input 元素

**移除/重构**

- ⚠️ 删除 `base-search-bar.md`：搜索栏作为 `base-input` 的变体形态，不再单独建组件
- ⚠️ layout/login 中 6 个含输入的页面（login / login-phone / login-minimal / login-hero / login-gradient / login-float）的 .md 全部改用 `base-input` 替代之前的 `base-card` 模拟输入框（login-wechat 是微信一键登录风格无 input 字段，不涉及）

### v1.5.0 (2026-08-20)

**新增功能**

- ✅ 新增通用输入框组件 [base-input.md](base-input.md)：账号/密码/手机号/验证码/多行文本/图标/OTP/浮动标签统一入口
- ✅ 搜索栏作为 `base-input` 的变体形态（v1.5.0 时为独立组件 `base-search-bar.md`，已在 v1.6.0 删除并入 `base-input`）
- ✅ 输入框案例集重构：原 `search/` 并入 `base-input/`，共 13 个场景（7 通用 + 6 搜索栏独立形态）
- ✅ 7 个通用输入：login / verify / feedback / disabled / icon / otp / floating
- ✅ 6 个搜索栏独立形态：search-pill / search-card / search-bubble / search-flat / search-embed / search-mini
- ✅ 圆角变体演示：覆盖 0 / 8px / 12px / 999px 四档，避免全大圆角
- ✅ 触发词更新：新增输入框场景（图标输入、验证码格子、浮动标签、搜索栏变体）

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
- ✅ points-center（积分中心）
- ✅ collection-settings（设置列表）
- ✅ order-after-sale（订单列表）

### v1.0.0 (2025-08-07)

**初始版本**

- ✅ base-card 基础卡片
- ✅ chat-page 聊天页案例
- ✅ product-page 商品页案例
- ✅ 强制规范（主题变量/H5标签/scroll-view/button）
- ✅ APP 端兼容性规范
