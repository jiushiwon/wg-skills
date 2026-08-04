---
name: uniapp-page-components-plus-skill
description: uniapp 常用「组件化页面」扩展技能。内置 4 个基础组件（自定义按钮 base-button / 自定义头部导航 base-navbar / 自定义底部菜单 base-tabbar / 表单行 base-form-item）+ 4 个页面组件（搜索页 search-page / 表单页 form-page / 登录页 login-page / 首页 home-page）。与 uniapp-page-components-skill 互补，同样 slot 自由填充、可加新 prop、自动接入 uniapp-theme-skill 主题系统（CSS 变量、禁止写死）。触发词："自定义按钮"、"头部导航/菜单"、"底部菜单/TabBar"、"表单行/表单页"、"搜索页"、"登录页"、"首页/商城首页"、"页面组件"、"uniapp 基础组件"
---

# uniapp 常用组件化页面扩展 Skill（Plus）

## 定位

本 skill 是 [uniapp-page-components-skill](../uniapp-page-components-skill/) 的**扩展版**，补齐主技能未覆盖的两类能力：

1. **基础组件层**：自定义按钮、头部导航、底部菜单、表单行——主技能页面内部的基础 UI 默认实现可换成本技能的组件，或独立复用。
2. **页面组件层**：搜索页、表单页、登录页、首页——主技能没有的高频页面。

与主技能的关系：**互补不重复**。主技能 = 列表/聊天/朋友圈/详情/我的/图片卡片；本技能 = 搜索/表单/登录/首页 + 基础 UI 组件。

**与相关 skill 的定位边界**：

| Skill | 职责 | 与本 skill 的关系 |
|-------|------|-------------------|
| [uniapp-page-components-skill](../uniapp-page-components-skill/) | 常用组件化页面（Tab列表/聊天/朋友圈/详情/我的/图片卡片 + base-card 托底） | **兄弟技能**。本技能补齐其缺的搜索/表单/登录/首页，页面入参与风格完全一致，可混用 |
| [uniapp-standard-skill](../uniapp-standard-skill/) | uniapp 通用规范（红线/目录/接口/命名） | **前置规范**。组件遵循其命名（kebab-case + easycom）与红线 |
| [uniapp-theme-skill](../uniapp-theme-skill/) | CSS 变量主题系统 | **前置依赖**。所有组件样式用 `var(--xxx)`，禁止写死；无主题系统按 fallback 表硬编码 |
| [uniapp-style-skill](../uniapp-style-skill/) | 设计系统与组件规范 D01-D32 | **必循规范**。scoped、TS Props、图片兜底、点击区 ≥ 88rpx 等 |
| [uniapp-app-generate-skill](../uniapp-app-generate-skill/) | 项目骨架 + 共享原子组件（AppButton/AppNavbar...） | 上游。若项目已有其共享组件体系，本技能组件与之二选一使用（避免重复造轮子） |
| [uniapp-auth-skill](../module-generate-skill/auth-skill/) | 登录鉴权模块（后端 + 前端接口） | 数据层。login-page 只做前端骨架，接口对接走 auth-skill |
| [uniapp-request-skill](../uniapp-request-skill/) | 统一请求封装 | 数据层。搜索/提交/登录等副作用由页面层走 request 封装，组件只 emit |
| [uniapp-code-audit-skill](../uniapp-code-audit-skill/) | 全维度审计 | 后置体检 |
| [uniapp-components-skill](../uniapp-components-skill/) | 登录鉴权与安全规范 | 无交集 |

## 组件清单

组件模板位于本 skill 的 `components/` 目录，共 8 个（4 基础 + 4 页面）：

### 基础组件

| 组件 | 标签 | 用途 |
|------|------|------|
| `base-button` | `<base-button>` | 自定义按钮：4 类型（primary/ghost/text/danger）× 3 尺寸 + loading/disabled/block/round |
| `base-navbar` | `<base-navbar>` | 自定义头部导航：标题 + 返回 + 右侧菜单 slot，状态栏适配 + 吸顶占位 |
| `base-tabbar` | `<base-tabbar>` | 自定义底部菜单：2~5 项，图标/角标，激活主题色，安全区适配 |
| `base-form-item` | `<base-form-item>` | 表单行：label + 必填星号 + 控件 slot + 错误提示 |

### 页面组件

| 组件 | 标签 | 用途 | 对应真实页面 |
|------|------|------|--------------|
| `search-page` | `<search-page>` | 搜索框 + 历史/热门标签 + 结果列表 + 防抖 | 搜索页、搜索结果 |
| `form-page` | `<form-page>` | 导航 + 表单区 slot + 底部提交按钮 | 资料填写、发布、反馈、地址填写 |
| `login-page` | `<login-page>` | logo + 表单 + 微信登录 + 协议 + 提交 | 登录页、注册页 |
| `home-page` | `<home-page>` | 导航 + 区块 slots + 下拉刷新/加载更多 + 底部菜单 | 首页、商城首页、工作台 |

**设计要点**：
- **自由化同主技能**：内容全走 slot；可加新 prop（`interface Props` + `withDefaults`，向后兼容）；默认数据可跑通再替换。
- **依赖内部复用**：`form-page` 依赖 `base-navbar` + `base-button`，`home-page` 依赖 `base-navbar` + `base-tabbar`，复制时需连带复制被依赖的基础组件。
- **主题系统绑定**：所有样式用主题变量，禁止写死；无主题系统按 fallback 表硬编码。

## When to Use（触发词）

技能共 **8 个组件（4 基础 + 4 页面）**，一句话描述"要做的页面/组件/操作"即可命中：

### 按组件触发

| 组件 | 触发词（任说一句即可） |
|------|------------------------|
| `base-button`<br>自定义按钮 | 自定义按钮 / 按钮组件；"做一个主题色按钮，带 loading 和禁用"；"底部提交按钮" |
| `base-navbar`<br>头部导航 | 自定义头部 / 导航栏 / 头部菜单；"页面顶部标题栏，带返回和右侧按钮"；"状态栏适配的导航" |
| `base-tabbar`<br>底部菜单 | 自定义底部菜单 / 底部导航 / TabBar；"页面底部几个菜单项切换"；"红点角标菜单" |
| `base-form-item`<br>表单行 | 表单行 / 表单项 / 自定义表单；"一行 label + 输入框，带必填星号和错误提示" |
| `search-page`<br>搜索页 | 搜索页 / 搜索 / 搜索框 + 历史 / 热门搜索 / 搜索结果页 |
| `form-page`<br>表单页 | 表单页 / 填写资料 / 发布页 / 意见反馈 / 地址填写 / 带提交按钮的页面 |
| `login-page`<br>登录页 | 登录页 / 登录 / 注册页 / 手机号验证码登录 / 微信登录页 |
| `home-page`<br>首页 | 首页 / 商城首页 / 工作台 / 带轮播金刚区的首页 / 底部菜单首页 |

### 参数与内容调整（任何组件）

- **调外观**："按钮圆角改大" / "导航栏背景透明" / "底部菜单图标换一下"
- **可交互**："按钮点击触发事件" / "菜单切换触发 tabChange"
- **填内容**："登录表单里加个密码框" / "首页加个金刚区区块"（slot）
- **新增参数**："给组件加一个 prop XX" / "加个参数控制是否显示 XX"
- **变量化**："别写死颜色，用主题变量"
- **不写死内容**："表单/登录/搜索内容我自己填"

### 通用触发

- "生成页面组件 / 组件化页面"
- "用主题系统给这些页面配色 / 换肤"
- "我项目里没这些页面，帮我生成几个常用的"
- "加基础组件：按钮、导航栏、底部菜单、表单"

## 工作流程

### Step 1：确认目标与主题系统

1. 与用户确认要生成哪些组件（可多选：base-button / base-navbar / base-tabbar / base-form-item / search-page / form-page / login-page / home-page）。
2. 检测目标项目是否已有主题系统：在全局样式入口（`App.vue` 的 `<style>`、`src/styles/`、`static/css/` 等）中查找是否存在 CSS 变量 `--color-primary` / `--radius-card` / `--spacing-md` 等。
   - **有主题系统**：直接使用组件模板。
   - **无主题系统**：二选一——先调用 `uniapp-theme-skill` 初始化主题系统（推荐）；或按 `references/theme-integration.md` §2 fallback 表把 `var(--xxx)` 替换为具体值（允许写死）。
3. **状态栏提示**：`base-navbar` 默认 `statusBarHeight=0`；小程序端建议在 `App.vue` 定义 `--status-bar-height: 44px`（或用 `uni.getSystemInfoSync().statusBarHeight` 传入），否则导航栏贴顶。

### Step 2：复制组件进项目

把选中的组件目录复制到项目 `src/components/` 下（保持 `<组件名>/<组件名>.vue`）。**注意内部依赖**：

| 被复制组件 | 必须连带复制 |
|-----------|--------------|
| `form-page` | `base-navbar`、`base-button` |
| `home-page` | `base-navbar`、`base-tabbar` |
| `login-page` | `base-button` |

### Step 3：注册组件

推荐 easycom autoscan（`pages.json` 的 `"easycom": { "autoscan": true }`），即可直接使用 `<base-button>`、`<search-page>` 等标签；或按 `references/theme-integration.md` §3 用 custom 规则 / 手动 import。

### Step 4：生成使用示例

按 `references/page-specs.md` 中对应组件的「完整页面示例」为用户生成可运行的 page 落地（含 mock 数据 + 交互），并给出 Props/Slots/Emits 速查表。

### Step 5：验证

- 检查是否使用主题变量而非裸值（红线 R01）；
- 检查 `<image>` 是否带 `mode` + error 兜底、点击区是否 ≥ 88rpx；
- 确认内部依赖组件（base-navbar/base-button/base-tabbar）已一并复制；
- 确认 easycom 注册与页面引用路径正确；提示用户编译验证。

### 组件调整模式

当用户说"按钮圆角改大"、"给组件加个参数"、"表单内容我自己填"等时，按主技能 `uniapp-page-components-skill` 的「组件调整模式」规则响应：调外观优先传 prop；内容用 slot；新增参数在 `interface Props` + `withDefaults` 加字段（向后兼容）；完成后复查 R01/R03/R10。

## 主题系统绑定规则

> 所有组件默认依赖 uniapp-theme-skill 主题变量，遵循"禁止写死"。

| 用途 | 优先使用变量 |
|------|--------------|
| 主色 | `var(--color-primary)`（按钮/菜单激活/链接） |
| 页面背景 | `var(--color-bg-page)` |
| 卡片/输入/导航底 | `var(--color-bg-surface)` |
| 浅色强调底 | `var(--color-bg-tinted)`（ghost 按钮/标签底/logo 底） |
| 文字主/次/弱 | `var(--color-text-primary)` / `--color-text-secondary` / `--color-text-tertiary` |
| 边框 | `var(--color-border)` / `--color-border-light` |
| 反白文字 | `var(--white)` |
| 错误/必填星号/角标 | `var(--color-error)` |
| 圆角 | `--radius-btn` / `--radius-tag` / `--radius-full` / `--radius-lg` |
| 间距 | `var(--spacing-xs/sm/md/lg/xl/2xl/3xl)` |
| 字号 | `var(--font-xs/sm/md/lg/xl/2xl)` |
| 控件高 | `var(--height-btn-sm/md/lg/xl)`、`var(--height-avatar-lg)`、`var(--height-input-*)` |
| 图标尺寸 | `var(--icon-xs/sm/md/lg)` |
| 状态栏高度 | `var(--status-bar-height, 0)`（base-navbar，App.vue 定义） |

> 完整清单与无主题系统 fallback 表见 `references/theme-integration.md`。

## 使用前提（重要）

1. **状态栏适配**：`base-navbar`（及引用它的 `form-page` / `home-page`）使用小程序自定义导航时，需在 `App.vue` 定义 `--status-bar-height`（如 `44px`）或传入 `status-bar-height` prop；胶囊对齐属 app-generate `AppNavbar` 强约束场景，本技能导航栏为简易通用版。`login-page` 无导航栏，无需处理。
2. **容器高度**：`search-page` / `form-page` / `home-page` 根容器为 `height: 100%`，使用页面需给确定高度（如 `100vh`）。
3. **内部依赖**：`form-page` / `home-page` / `login-page` 依赖基础组件，复制时连带复制（见 Step 2 表）。
4. **与主技能混用**：`form-page` 表单区、`home-page` 列表区可放主技能的 `base-card` / `tab-list-page` 等，两个技能组件互通。

## 红线规则

与 [uniapp-page-components-skill](../uniapp-page-components-skill/) 一致：

| 编号 | 规则 |
|------|------|
| R01 | **禁止写死**：有主题系统时一律 `var(--xxx)`；主题无对应变量的合理例外（阴影参数、图片固定高度、1rpx 边框、小徽标尺寸）允许硬编码并注释 |
| R02 | **scoped 隔离**：组件样式必须 `scoped` |
| R03 | **TS Props 接口**：`interface Props` + `withDefaults(defineProps<Props>())` |
| R04 | **可复用先沉淀**：重复出现的 UI 先沉淀为组件（本技能 base-* 即为此），页面不得内联复制 |
| R05 | **图片兜底**：`<image>` 必须设 `mode` + `@error` 兜底占位 |
| R06 | **可点击区 ≥ 88rpx**：交互元素最小 44pt（88rpx） |
| R07 | **动画限 transform/opacity**：按压反馈只改 transform/opacity |
| R08 | **禁止第三方组件库**：只用 uni 官方组件 + 原生标签 |
| R09 | **rpx 单位**：尺寸一律 rpx 或主题变量 |
| R10 | **可扩展**：组件必须留扩展口（新增 props / 覆盖 slot / 自定义 emit） |
| R11 | **数据只做展示**：组件只收数据 + emit 事件，分页/搜索/提交/登录副作用由页面层走 request 封装，组件内禁止直接 `uni.request` |

## References

- `references/page-specs.md` — 各组件 API 速查（Props / Slots / Emits / 默认数据 / 完整示例 / 扩展建议）
- `references/theme-integration.md` — 主题变量清单、无主题系统 fallback 表、easycom 注册、状态栏适配说明
- `components/` — 8 个组件模板（4 基础 + 4 页面）
