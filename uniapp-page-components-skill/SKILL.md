---
name: uniapp-page-components-skill
description: uniapp 常用「组件化页面」技能（独立、自成体系）。内置 21 个组件（5 基础 + 6 业务 + 10 页面），以空卡片 base-card 为万能抽象，业务组件全部组合空壳实现、不改空壳。组件 slot 自由填充、可加新 prop、自动接入 uniapp-theme-skill 主题系统，支持自动检测项目主题对齐、自动替换 tabBar/导航栏、触发词一键扩展业务组件。触发词："组件化页面"、"聊天页"、"朋友圈"、"商品详情页"、"订单列表"、"搜索页"、"表单页"、"登录页"、"首页"、"图片卡片"、"BaseCard"、"自定义按钮"、"头部导航/底部菜单/TabBar"、"用户卡片/评论条"、"通知栏"、"设置行"、"空状态/结果页"、"卡片圆角调整"、"替换 tabBar"、"uniapp 页面组件"
---

# uniapp 常用组件化页面 Skill

## 定位

本 skill 是**独立**的 uniapp 组件化页面技能，覆盖 21 个高频组件——把最高频、结构最固定的页面抽象成可复用组件，复制进项目、往 slot 填内容即可用，自由化高、无需重写布局。

**与相关 skill 的定位边界**：

| Skill | 职责 | 与本 skill 的关系 |
|-------|------|-------------------|
| [uniapp-standard-skill](../uniapp-standard-skill/) | uniapp 开发通用规范：20 条红线 + 目录结构 + 接口/命名/组件通信规范 | **前置规范**。组件遵循其红线（R15 SCSS 用 Token、R05 长列表分页等）与目录/命名规范（小写 kebab-case、easycom） |
| [uniapp-theme-skill](../uniapp-theme-skill/) | 主题系统引擎：CSS 变量（色阶/尺寸/圆角）运行时换肤 | **前置依赖**。所有组件样式一律使用 `var(--xxx)` 引用其主题变量，禁止写死。项目无主题系统时先调用它或按 fallback 表硬编码 |
| [uniapp-style-skill](../uniapp-style-skill/) | 设计系统与组件规范（Design Tokens / 排版 / 间距 / 红线 D01-D32） | **必循规范**。组件遵循其红线（scoped、TS Props、rpx、图片兜底、可点击区 ≥ 88rpx 等） |
| [uniapp-app-generate-skill](../uniapp-app-generate-skill/) | uni-app 项目骨架生成 + 共享组件体系（AppButton/AppTab/AppCard...） | 上游。新项目先生成骨架，再调用本 skill 填充页面组件；组件内基础 UI 可用其共享组件替换（见协作要点） |
| [uniapp-request-skill](../uniapp-request-skill/) | 统一请求封装（Token/防抖/Mock/SSE） | 数据层。组件只接收数据、`emit` 事件，获取逻辑走 request 封装 |
| [uniapp-code-audit-skill](../uniapp-code-audit-skill/) | uniapp 全维度代码审计（报告-only） | 后置体检。组件上线前可交付审计 |
| [uniapp-components-skill](../uniapp-components-skill/) | 登录鉴权与安全规范 | 无交集 |

## 组合工作流（与其它 uniapp 技能配合）

本 skill 位于 uniapp 技能链路的「页面组件层」，完整组合链路：

| 阶段 | 技能 | 作用 |
|------|------|------|
| 1. 骨架 | [uniapp-app-generate-skill](../uniapp-app-generate-skill/) | 从零生成项目骨架（已有项目可跳过） |
| 2. 规范 | [uniapp-standard-skill](../uniapp-standard-skill/) | 通用红线、目录结构、接口/命名/组件通信规范 |
| 3. 主题 | [uniapp-theme-skill](../uniapp-theme-skill/) | CSS 变量主题系统（本 skill 组件换肤前提） |
| 4. 视觉 | [uniapp-style-skill](../uniapp-style-skill/) | Design Tokens + 组件规范 D01-D32 |
| 5. 页面 | **本 skill** | 生成页面组件，往 slot 填内容 |
| 6. 数据 | [uniapp-request-skill](../uniapp-request-skill/) | 数据经统一 request 封装获取，组件只展示 + emit |
| 7. 审计 | [uniapp-code-audit-skill](../uniapp-code-audit-skill/) | 上线前全维度体检 |

**协作要点**：

1. **层级定位**：`uniapp-app-generate-skill` 提供**原子组件**（AppButton / AppTab / AppInput / AppPopup / AppNavbar），本 skill 提供**页面骨架组件**。组件内部的基础 UI 是"默认实现"，若项目已有共享组件体系，优先用本 skill 暴露的 slot（`#tab` / `#footer` / `#navbar` / `#plus-panel` / `#header` 等）注入共享组件，避免重复造轮子。
2. **样式三源合一**：主题变量（theme-skill CSS 变量，运行时换肤）+ SCSS token（style-skill，编译期注入）可共存；本 skill 组件只依赖前者，保证"复制即用"。桥接细节见 `references/theme-integration.md` §5。
3. **数据只做展示**：组件的 `list` / `messages` / `feedList` / `groups` / `resultList` 等只接收数据；分页、加载、发送、搜索、提交、登录等副作用一律由页面层调用 request-skill 封装处理，组件只 `emit` 事件。
4. **命名与目录对齐**：组件目录小写 kebab-case、`components/<name>/<name>.vue`，遵循 standard-skill 命名规范与 easycom 默认规则。

## 组件清单

组件模板位于本 skill 的 `components/` 目录，共 **21 个（5 基础 + 6 业务 + 10 页面）**：

### 基础组件（5）

| 组件 | 标签 | 用途 |
|------|------|------|
| `base-card` | `<base-card>` | **空卡片托底**：圆角/内边距/背景/描边/阴影参数化，slot 自由填充 |
| `base-button` | `<base-button>` | 自定义按钮：4 类型（primary/ghost/text/danger）× 3 尺寸 + loading/disabled/block/round |
| `base-navbar` | `<base-navbar>` | 自定义头部导航：标题 + 返回 + 右侧菜单 slot，状态栏适配 + 吸顶占位 |
| `base-tabbar` | `<base-tabbar>` | 自定义底部菜单：2~5 项，图标/角标，激活主题色，安全区适配 |
| `base-form-item` | `<base-form-item>` | 表单行：label + 必填星号 + 控件 slot + 错误提示 |

### 业务组件（6）—— 组合空壳组件实现，不改空壳

| 组件 | 标签 | 用途 | 基于哪个空壳 |
|------|------|------|--------------|
| `user-card` | `<user-card>` | 用户卡片：头像/昵称/签名/右侧按钮 | `base-card` + `base-button` |
| `comment-item` | `<comment-item>` | 评论条：头像/昵称/时间/内容/点赞/回复 | `base-card` |
| `notice-bar` | `<notice-bar>` | 通知/公告栏：icon/文案/可关闭/跑马灯 | 轻量（不依赖空壳） |
| `setting-item` | `<setting-item>` | 设置/菜单行：图标/label/描述/箭头/角标/开关 | 独立（可放 `base-card` 内） |
| `empty` | `<empty>` | 空状态：图/文案/操作按钮 | 轻量 + `base-button` |
| `result-page` | `<result-page>` | 结果页：成功/失败/警告/信息 + 操作按钮 | `base-button` |

### 页面组件（10）

| 组件 | 标签 | 用途 | 对应真实页面 |
|------|------|------|--------------|
| `tab-list-page` | `<tab-list-page>` | Tab 吸顶 + 卡片列表 | 我的订单、消息中心、商品列表 |
| `chat-page` | `<chat-page>` | 微信风格聊天：底部输入栏 + 左右气泡 | 聊天会话页 |
| `moments-page` | `<moments-page>` | 微信风格朋友圈：封面头图 + 动态列表 + 点赞评论 | 朋友圈 |
| `product-detail-page` | `<product-detail-page>` | 导航 + 头图 + 信息卡 + 多卡片 sections + 底部操作栏 | 商品详情 |
| `profile-page` | `<profile-page>` | 用户信息头 + 分组列表（右侧箭头/角标/左图） | 我的、设置、通知、购物车 |
| `image-card` | `<image-card>` | 图片卡片：顶部图 + 标题 + 描述 + 标签 | 商品卡、内容卡 |
| `search-page` | `<search-page>` | 搜索框 + 历史/热门标签 + 结果列表 + 防抖 | 搜索页、搜索结果 |
| `form-page` | `<form-page>` | 导航 + 表单区 slot + 底部提交按钮 | 资料填写、发布、反馈 |
| `login-page` | `<login-page>` | logo + 表单 + 微信登录 + 协议 + 提交 | 登录页、注册页 |
| `home-page` | `<home-page>` | 导航 + 区块 slots + 下拉刷新/加载更多 + 底部菜单 | 首页、商城首页 |

**设计要点**：
- **BaseCard 是托底组件**：`image-card` 直接继承其入参；`tab-list-page` / `profile-page` 内部引用 BaseCard，并暴露 `cardProps` 透传。
- **高度自由化**：每个组件核心内容都由 `slot` 决定，内置"默认参数 + 默认数据"，可整体替换或逐项覆盖，也可给组件新增 props/emit。
- **内部依赖**：`form-page` 依赖 `base-navbar` + `base-button`；`home-page` 依赖 `base-navbar` + `base-tabbar`；`login-page` 依赖 `base-button`；`tab-list-page` / `profile-page` / `image-card` 依赖 `base-card`；`user-card` 依赖 `base-card` + `base-button`；`comment-item` 依赖 `base-card`；`empty` / `result-page` 依赖 `base-button`。复制时连带。
- **默认数据**：每个组件带贴合场景的默认数据，复制即可跑通，替换真实数据即可上线。
- **业务组件扩展机制**：业务组件 = **组合空壳组件实现，不改空壳**，颗粒度小于页面组件。当用户说"帮我做个 XX 卡片/列表项/状态页"等具体原型需求时，先在本技能的业务组件清单中查找；若有则生成对应组件，若无则按此模式基于空壳组合出新的业务组件（见「组件调整模式」）。

## When to Use（触发词）

技能共 **21 个组件**，一句话描述"要做的页面/组件/操作"即可命中，不要求说组件名：

### 按组件触发

| 组件 | 触发词（任说一句即可） |
|------|------------------------|
| `base-card`<br>空卡片 | 空卡片 / 卡片容器 / 套壳卡片 / BaseCard；"做一个卡片容器，我往里面塞内容" |
| `base-button`<br>按钮 | 自定义按钮 / 按钮组件；"做一个主题色按钮，带 loading 和禁用"；"底部提交按钮" |
| `base-navbar`<br>头部导航 | 自定义头部 / 导航栏 / 头部菜单；"页面顶部标题栏，带返回和右侧按钮" |
| `base-tabbar`<br>底部菜单 | 自定义底部菜单 / 底部导航 / TabBar；"页面底部几个菜单项切换" |
| `base-form-item`<br>表单行 | 表单行 / 表单项 / 自定义表单；"一行 label + 输入框，带必填星号和错误提示" |
| `tab-list-page`<br>Tab+列表 | 我的订单 / 订单列表页 / 待付款已发货列表 / 消息列表 / 商品列表 / 优惠券列表 |
| `chat-page`<br>聊天 | 聊天页 / 聊天界面 / 会话页 / IM 对话 / 客服聊天 / 私信页 / 微信聊天样式 |
| `moments-page`<br>朋友圈 | 朋友圈 / 动态列表 / 社区动态 / 带点赞评论的列表 / 社交信息流 |
| `product-detail-page`<br>详情 | 商品详情页 / 详情页 / 产品介绍页；"底部有购物车/立即购买的详情页" |
| `profile-page`<br>我的 | 我的页面 / 个人中心 / 设置页 / 通知中心 / 收货地址列表 / 购物车列表 / 账户设置 |
| `image-card`<br>图片卡片 | 图片卡片 / 图文卡片 / 商品卡 / 内容卡 / Banner 卡 |
| `search-page`<br>搜索 | 搜索页 / 搜索框 + 历史 / 热门搜索 / 搜索结果页 |
| `form-page`<br>表单 | 表单页 / 填写资料 / 发布页 / 意见反馈 / 地址填写 / 带提交按钮的页面 |
| `login-page`<br>登录 | 登录页 / 登录 / 注册页 / 手机号验证码登录 / 微信登录页 |
| `home-page`<br>首页 | 首页 / 商城首页 / 工作台 / 带轮播金刚区的首页 / 底部菜单首页 |
| `user-card`<br>用户卡片 | 用户卡片 / 作者卡 / 好友卡 / 关注列表项 / "头像+昵称+关注按钮的卡片" |
| `comment-item`<br>评论条 | 评论条 / 评论项 / 回复列表项 / 评价项 / "带点赞回复的评论" |
| `notice-bar`<br>通知栏 | 通知栏 / 公告栏 / 跑马灯 / 提示条 / "可关闭的通知消息条" |
| `setting-item`<br>设置行 | 设置行 / 菜单项 / 设置项 / "带开关的列表行" / "带角标的菜单" |
| `empty`<br>空状态 | 空状态 / 空列表 / 暂无数据 / 空购物车 / 没有内容 / "空页面提示" |
| `result-page`<br>结果页 | 结果页 / 支付结果 / 提交成功 / 操作失败 / 成功页 / "支付完成页面" |

### 组件扩展机制（业务组件）

业务组件 = **组合空壳组件实现，不改空壳**，颗粒度小于页面组件。当用户说"帮我做个 XX 卡片/列表项/状态页"等具体原型需求时：
1. 先在上方「按组件触发」表中查找——有则生成该业务组件；
2. 若无，按「组件调整模式」基于空壳组件（`base-card` / `base-button` / `base-form-item` 等）组合出新业务组件，放 `components/` 下，同样 slot + TS Props + 主题变量。

### 参数与内容调整（任何组件）

- **调外观**："卡片圆角大一点" / "按钮圆角改大" / "导航栏背景透明" / "内边距改小" / "加个阴影" / "加边框"
- **可交互**："这个卡片要能点击，点击触发事件" / "按钮点击触发事件" / "菜单切换触发 tabChange"
- **填内容**："在卡片里加标题/头部/底部" / "登录表单里加个密码框" / "首页加个金刚区区块"（slot）
- **透传统一调整**："把列表里所有卡片的圆角/间距统一改一下"（`cardProps`）
- **新增参数**："给组件加一个 prop XX" / "加个参数控制是否显示 XX"
- **变量化**："别写死颜色，用主题变量"
- **不写死内容**："卡片内容我自己填" / "表单/登录/搜索内容我自己填"

### 通用触发

- "生成页面组件 / 组件化页面"
- "用主题系统给这些页面配色 / 换肤"
- "我项目里没这些页面，帮我生成几个常用的"
- "用自定义底部菜单替换现有 tabBar" / "tab 页面换自定义头部菜单"
- "加基础组件：按钮、导航栏、底部菜单、表单"

## 工作流程

### Step 1：确认目标与自动检测主题系统

1. 与用户确认要生成哪些组件（可多选，共 21 个）。
2. **自动检测项目主题系统并自动对齐颜色/尺寸**（完整流程见 `references/theme-detect.md`）：
   - **定位变量文件**：扫描 `App.vue` 的 `<style>`、`src/styles/`、`static/css/`、`uni.scss`，找到主题变量定义位置；
   - **识别命名风格**：CSS 变量（`--color-primary`/`--primary-500`/`--brand-*`）还是 SCSS（`$primary`）/ LESS（`@primary`）；
   - **读取值**：主色值、语义色体系、尺寸单位（rpx/px/rem）、间距/圆角阶梯、是否支持 `data-theme` 深色切换；
   - **三场景自动对齐**：
     | 检测结果 | 处理方式 |
     |----------|----------|
     | 命名风格一致 | 组件**原样复制**，零改动 |
     | 命名风格不同 | 在项目生成**桥接文件**（项目变量 → 组件语义变量），**不改组件内部** |
     | 无主题系统 | 自动提取项目高频品牌色生成变量组（或先跑 `uniapp-theme-skill` 初始化，推荐） |
   - 检测结果输出给用户确认后进入下一步。
3. **状态栏提示**：`base-navbar`（及引用它的 `form-page` / `home-page`）默认 `statusBarHeight=0`；小程序端建议在 `App.vue` 定义 `--status-bar-height: 44px`，否则导航栏贴顶。

### Step 2：复制组件进项目

把选中的组件目录复制到项目 `src/components/` 下（保持 `<组件名>/<组件名>.vue` 结构）。**注意内部依赖**：

| 被复制组件 | 必须连带复制 |
|-----------|--------------|
| `form-page` | `base-navbar`、`base-button` |
| `home-page` | `base-navbar`、`base-tabbar` |
| `login-page` | `base-button` |
| `tab-list-page` / `profile-page` / `image-card` | `base-card` |
| `user-card` | `base-card`、`base-button` |
| `comment-item` | `base-card` |
| `empty` / `result-page` | `base-button` |

### Step 3：注册组件

推荐 **easycom 自动注册**（uni-app Vue3 默认规则 `components/组件名/组件名.vue` → 全局标签）：

```json
// pages.json
{ "easycom": { "autoscan": true } }
```

即可直接使用 `<base-card>`、`<chat-page>`、`<base-button>`、`<search-page>` 等标签；若项目未开启 autoscan，则用 easycom `custom` 规则或手动 `import`（参考 `references/theme-integration.md` §3）。

### Step 4：生成使用示例

按 `references/page-specs.md` 中对应组件的「完整页面示例」为用户生成可运行的 page 落地（含 mock 数据 + 交互），并给出该组件的 Props/Slots/Emits 速查表。用户确认后可在示例页基础上替换真实数据。

### Step 5：验证

- 检查组件是否使用了主题变量而非裸值（见红线 R01）；
- 检查 `<image>` 是否带 `mode` + error 兜底、可点击区域是否 ≥ 88rpx；
- 确认内部依赖组件已一并复制；
- 确认 easycom 注册与页面引用路径正确；
- 提示用户运行编译确认。

### 组件调整模式

当用户说"卡片圆角改大"、"给组件加个参数"、"表单内容我自己填"等时，按以下规则响应（不要重写组件）：

| 用户意图 | 处理方式 |
|----------|----------|
| 调外观（圆角/内边距/背景/描边/阴影/字号） | 优先在**调用处传 prop**（如 `<base-card :radius="'var(--radius-lg)'" ...>`），不改组件默认值，除非用户要求全局生效 |
| 调某页所有卡片的圆角/间距 | 传 `cardProps`（如 `:card-props="{ radius: 'var(--radius-lg)' }"`），不逐卡片改 |
| 加标题/头部/底部内容 | 用 `#header` / 默认 slot / `#footer`，不新增 prop |
| 组件可点击/可交互 | 传 `:clickable="true"` 或监听对应 emit |
| **新增参数** | 在对应组件 `interface Props` 加字段 + `withDefaults` 给默认值，再在模板中使用；不得破坏既有 props/emit/slot 名（向后兼容） |
| 用主题变量/去写死 | 颜色/字号/间距/圆角改 `var(--xxx)`；主题无对应变量的合理例外见 R01 |

> 调整完成后必须复查红线 R01（无新硬编码）、R03（新参数有默认值）、R10（保留扩展口）。

## 自动替换现有导航栏 / TabBar（重要能力）

当用户说"用自定义底部菜单替换现有 tabBar"、"tab 页面换自定义头部菜单"时，按下面流程自动更新页面，**无需手动逐个改**：

### 1. 底部菜单：读 pages.json 的 tabBar → 生成 base-tabbar

读取项目 `pages.json` 的 `tabBar.list`（`pagePath` / `text` / `iconPath` / `selectedIconPath`），自动转换为 `base-tabbar` 的 `items`：

| tabBar.list 字段 | → items 字段 |
|------------------|--------------|
| `pagePath` | `key`（去掉 `pages/` 前缀与文件名，或直接用完整 pagePath，二选一保持唯一） |
| `text` | `text` |
| `iconPath` | `icon` |
| `selectedIconPath` | `activeIcon` |
| （业务注入） | `badge`（可选） |

**替换步骤**：
1. 新建 `src/custom-tab-bar/index.vue`（微信自定义 tabBar 官方方案），内部渲染 `base-tabbar`；`onChange` 里 `uni.switchTab({ url: '/' + item.key })`。
2. 项目 `pages.json` 的 `tabBar` 增加 `"custom": true`（保留 `list` 作占位，原生 tabBar 不渲染）。
3. 每个 tab 页面 `onShow` 时同步当前激活 `selected`（`base-tabbar` 以 `v-model` 接收当前 key）。

> 不依赖微信官方 custom-tab-bar 也可：把 `base-tabbar` 直接放进各 tab 页面底部（页面根 `height:100vh`，内容区 `padding-bottom` 留出 tabbar 高度），`change` 事件由页面 `uni.switchTab`。推荐前者（一处维护）。

### 2. 头部菜单：只替换 tab 页面的导航栏

1. 仅对 **tabBar 页面** 生效，`pages.json` 对应页面设置 `"navigationStyle": "custom"`（普通详情页等非 tab 页不改）。
2. 每个 tab 页面模板顶部加：

```vue
<template>
  <view class="page">
    <base-navbar
      :title="'首页'"            <!-- 取 pages.json 对应页 navigationBarTitleText -->
      :show-back="false"          <!-- tab 页无返回 -->
      :fixed="true"
      :placeholder="true"
      status-bar-height="var(--status-bar-height)"
    />
    <view class="page__content"><!-- 原页面内容 --></view>
  </view>
</template>
```

3. `App.vue` 定义 `--status-bar-height`（`uni.getSystemInfoSync().statusBarHeight`），否则导航栏贴顶。

### 3. 迁移注意

- 原生 tabBar 与自定义 tabBar **二选一**；图标资源沿用现有 `iconPath`/`selectedIconPath`，零新增素材。
- 替换后必须验证：tab 切换高亮正确、首页无返回键、非 tab 页返回键正常、safe-area 底部间距正确。
- 改完后用 `uniapp-code-audit-skill` 复检跨端（小程序/H5/App）表现一致。

## 主题系统绑定规则

> 所有组件默认依赖 uniapp-theme-skill 主题变量，遵循"禁止写死"。

| 用途 | 优先使用变量 |
|------|--------------|
| 主色 | `var(--color-primary)`（按钮/高亮/自己气泡/菜单激活/链接） |
| 页面背景 | `var(--color-bg-page)` |
| 卡片/输入/气泡/导航底 | `var(--color-bg-surface)` |
| 浅色强调底 | `var(--color-bg-tinted)`（标签底/点赞评论底/ghost 按钮/logo 底） |
| 文字主/次/弱 | `var(--color-text-primary)` / `--color-text-secondary` / `--color-text-tertiary` |
| 边框 | `var(--color-border)` / `--color-border-light` |
| 反白文字 | `var(--white)` |
| 错误/必填星号/角标/价格 | `var(--color-error)` |
| 圆角 | `--radius-card` / `--radius-btn` / `--radius-tag` / `--radius-avatar` / `--radius-image` / `--radius-full` |
| 间距 | `var(--spacing-xs/sm/md/lg/xl/2xl/3xl)` |
| 字号 | `var(--font-xs/sm/md/lg/xl/2xl)` |
| 控件高 | `var(--height-btn-sm/md/lg/xl)`、`var(--height-avatar-sm/md/lg)` |
| 图标尺寸 | `var(--icon-xs/sm/md/lg)` |
| 状态栏高度 | `var(--status-bar-height, 0)`（base-navbar，App.vue 定义） |

> 完整清单与无主题系统 fallback 表见 `references/theme-integration.md`；自动检测对齐流程见 `references/theme-detect.md`。

## 使用前提（重要）

1. **自定义导航栏**：`chat-page` / `product-detail-page` / `form-page` / `home-page` 内置的是**简化版导航栏**（固定高度，未做状态栏高度适配与胶囊按钮对齐，微信小程序下会与默认导航栏叠加）。使用含导航栏的组件时，页面 `pages.json` 需设 `"navigationStyle": "custom"`；正式项目建议用项目已有 NavBar 替换，或通过对应 slot 传入项目导航栏。
2. **状态栏适配**：`base-navbar` 使用小程序自定义导航时，需在 `App.vue` 定义 `--status-bar-height`（如 `44px`）或传入 `status-bar-height` prop；胶囊对齐属 app-generate `AppNavbar` 强约束场景，本技能导航栏为简易通用版。**APP 端**（Android/iOS）必须运行时动态获取状态栏高度（`uni.getSystemInfoSync().statusBarHeight`），详见 `references/platform-app.md`。`login-page` 无导航栏，无需处理。`product-detail-page` / `chat-page` 内置简化导航栏同理。
3. **容器高度**：`tab-list-page` / `chat-page` / `product-detail-page` / `search-page` / `form-page` / `home-page` 根容器为 `height: 100%`，使用页面需给确定高度（如页面根 `view` 设 `height: 100vh`）。
4. **内部依赖**：`form-page` / `home-page` / `login-page` / `tab-list-page` / `profile-page` / `image-card` 依赖基础组件，复制时连带复制（见 Step 2 表）。
5. **页面背景**：各页面组件自带页面级背景（`--color-bg-page`），外层无需再包容器。

## 红线规则

本技能组件强制遵循以下红线：

| 编号 | 规则 |
|------|------|
| R01 | **禁止写死**：有主题系统时一律使用 `var(--xxx)` 主题变量，颜色/字号/间距/圆角不得硬编码（含 `#fff`、`32rpx` 等）。主题系统未提供对应变量的场景（阴影模糊半径、图片固定高度、1rpx 细边框、小徽标/指示条尺寸）允许合理硬编码并加注释说明 |
| R02 | **scoped 隔离**：组件样式必须 `scoped`，不污染全局 |
| R03 | **TS Props 接口**：组件 Props 必须 `interface Props` + `withDefaults(defineProps<Props>())` |
| R04 | **BaseCard 托底**：卡片类布局一律基于 `<base-card>` 或透传 `cardProps`，不重复造圆角/内边距 |
| R05 | **图片兜底**：所有 `<image>` 必须设 `mode` + `@error` 兜底占位 |
| R06 | **可点击区 ≥ 88rpx**：交互元素最小点击区域 44pt（88rpx） |
| R07 | **动画限 transform/opacity**：按压反馈只改 transform/opacity，避免触发重排 |
| R08 | **禁止第三方组件库**：只用 uni 官方组件 + 原生标签 |
| R09 | **rpx 单位**：尺寸一律 rpx 或主题变量 |
| R10 | **可扩展**：组件必须给用户留扩展口——新增 props / 覆盖 slot / 自定义 emit，不得把组件写成封闭的"一次性页面" |
| R11 | **结构嵌套 v-for 属必要例外**：`moments-page` 九宫格/评论、`profile-page` 分组等结构性嵌套 v-for 是组件固有需求，不违反 standard-skill R01（R01 约束的是页面层把同构列表叠出多层嵌套）；但组件内的 slot 内容禁止再由页面叠加多层 `v-for` |
| R12 | **数据只做展示**：组件只收数据 + emit 事件，分页/搜索/提交/登录副作用由页面层走 request 封装，组件内禁止直接 `uni.request` |

## References

- `references/page-specs.md` — 各组件 API 速查（Props / Slots / Emits / 默认数据 / mock 数据 / 完整页面示例 / 扩展建议）
- `references/theme-integration.md` — 主题变量清单、无主题系统 fallback 表、easycom 注册、状态栏适配
- `references/theme-detect.md` — 主题系统自动检测与对齐（变量定位、命名风格识别、三场景处理）
- `references/platform-app.md` — **APP 端（Android/iOS）使用指南**：状态栏动态适配、安全区、键盘、原生导航栏冲突
- `components/` — 21 个组件模板（5 基础 + 6 业务 + 10 页面）
