---
name: uniapp-page-components-skill
description: uniapp 常用「组件化页面」生成技能。内置 7 个组件：空卡片 base-card（托底）+ 6 类页面（Tab+列表 / 聊天 / 朋友圈 / 商品详情 / 我的 / 图片卡片）。页面入参含 BaseCard 全部入参、slot 自由填充、可加新 prop；自动接入 uniapp-theme-skill 主题系统（CSS 变量、禁止写死）。触发词："组件化页面"、"空卡片/BaseCard/卡片圆角调整"、"订单列表/Tab列表/带分类列表"、"聊天页/会话页/IM 对话"、"朋友圈/动态列表"、"商品详情页"、"我的页面/个人中心/设置页/购物车列表"、"图片卡片/图文卡片"、"给组件加参数/调整卡片样式"、"uniapp 页面组件"
---

# uniapp 常用组件化页面 Skill

## 定位

本 skill 为 uniapp（Vue3 + TS + Pinia）项目生成一批**「组件化页面」**——把最高频、结构最固定的页面抽象成可复用组件。使用时直接复制组件进项目，往 slot 里填自己的内容即可，自由化高、无需重写布局。

**与相关 skill 的定位边界**：

| Skill | 职责 | 与本 skill 的关系 |
|-------|------|-------------------|
| [uniapp-standard-skill](../uniapp-standard-skill/) | uniapp 开发通用规范：20 条红线 + 目录结构 + 接口/命名/组件通信规范 | **前置规范**。本 skill 生成的组件遵循其红线（R15 SCSS 用 Token、R05 长列表分页等）与目录/命名规范（小写 kebab-case、easycom） |
| [uniapp-theme-skill](../uniapp-theme-skill/) | 主题系统引擎：CSS 变量（色阶/尺寸/圆角）运行时换肤 | **前置依赖**。本 skill 所有组件样式一律使用 `var(--xxx)` 引用其主题变量，禁止写死。项目无主题系统时先调用它或按 fallback 表硬编码 |
| [uniapp-style-skill](../uniapp-style-skill/) | 设计系统与组件规范（Design Tokens / 排版 / 间距 / 红线 D01-D32） | **必循规范**。本 skill 生成的组件遵循其红线（scoped、TS Props、rpx、图片兜底、可点击区 ≥ 88rpx 等） |
| [uniapp-app-generate-skill](../uniapp-app-generate-skill/) | uni-app 项目骨架生成 + 共享组件体系（AppButton/AppTab/AppCard...） | 上游。新项目先生成骨架，再调用本 skill 填充页面组件；页面组件是「页面骨架层」，内部基础 UI 可用其共享组件替换（见下方协作要点） |
| [uniapp-request-skill](../uniapp-request-skill/) | 统一请求封装（Token/防抖/Mock/SSE） | 数据层。页面组件只接收数据、`emit` 事件，获取逻辑走 request 封装 |
| [uniapp-code-audit-skill](../uniapp-code-audit-skill/) | uniapp 全维度代码审计（报告-only） | 后置体检。页面组件上线前可交付审计 |
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

1. **层级定位**：`uniapp-app-generate-skill` 提供**原子组件**（AppButton / AppTab / AppInput / AppPopup / AppNavbar），本 skill 提供**页面骨架组件**（Tab 列表页 / 聊天页 / 朋友圈页...）。页面组件内部的基础 UI 是"默认实现"，若项目已有共享组件体系，优先用本 skill 暴露的 slot（`#tab` / `#footer` / `#navbar` / `#plus-panel` / `#header` 等）注入共享组件，或在复制后把内部自绘元素替换为共享组件，避免重复造轮子。
2. **样式三源合一**：主题变量（theme-skill CSS 变量，运行时换肤）+ SCSS token（style-skill，编译期注入）可共存；本 skill 组件只依赖前者，保证"复制即用"。桥接细节见 `references/theme-integration.md` §5。
3. **数据只做展示**：组件的 `list` / `messages` / `feedList` / `groups` 只接收数据；分页、加载更多、发送、点赞等副作用一律由页面层调用 request-skill 封装处理，组件只 `emit` 事件，不在组件内写请求。
4. **命名与目录对齐**：组件目录小写 kebab-case、`components/<name>/<name>.vue`，遵循 standard-skill 命名规范与 easycom 默认规则；若项目按 `components/common/<Name>/index.vue` 组织，则相应调整放置位置并配合 easycom `custom` 规则或手动 import。

## 组件清单

组件模板位于本 skill 的 `components/` 目录，共 7 个（1 个托底 + 6 类页面）：

| 组件 | 标签 | 用途 | 对应真实页面 |
|------|------|------|--------------|
| `base-card` | `<base-card>` | **空卡片托底组件**：定义圆角/内边距/背景/描边/阴影，内容 slot 自由填充 | 所有卡片的套壳 |
| `tab-list-page` | `<tab-list-page>` | Tab 吸顶 + 卡片列表（每项自动包 BaseCard） | 我的订单、消息中心、商品列表 |
| `chat-page` | `<chat-page>` | 微信风格聊天：底部输入栏 + 左右气泡 | 聊天会话页 |
| `moments-page` | `<moments-page>` | 微信风格朋友圈：封面头图 + 动态列表 + 点赞评论 | 朋友圈 |
| `product-detail-page` | `<product-detail-page>` | 导航 + 头图 + 信息卡 + 多卡片 sections + 底部操作栏 | 商品详情 |
| `profile-page` | `<profile-page>` | 用户信息头 + 分组列表（右侧箭头/角标/左图） | 我的、设置、通知、购物车 |
| `image-card` | `<image-card>` | BaseCard 之上：顶部图片 + 标题 + 描述 + 标签 | 商品卡、内容卡、Banner 卡 |

**设计要点**：
- **BaseCard 是托底组件**：`image-card` 直接继承其入参；`tab-list-page` / `profile-page` 内部引用 BaseCard，并暴露 `cardProps` 把 BaseCard 入参透传出去——即这些页面组件的入参天然包含 BaseCard 的全部入参。
- **高度自由化**：每个页面组件的核心内容都由 `slot` 决定，内置的是"默认参数 + 默认数据"，用户可整体替换或逐项覆盖，也可给组件新增自己的 props/emit。
- **默认数据**：每个组件都带了贴合场景的默认数据（Tab 分组、底部操作按钮、我的分组列表等），复制即可跑通，替换成真实数据即可上线。

## When to Use（触发词）

技能共 **7 个组件（1 个托底 base-card + 6 类页面）**，以下是完整触发词矩阵——一句话描述"我要做的页面/操作"即可命中，不要求说出组件名：

### 按组件触发

| 组件 | 触发词（任说一句即可） |
|------|------------------------|
| `base-card`<br>空卡片托底 | 空卡片 / 卡片容器 / 套壳卡片 / 基础卡片 / BaseCard；"做一个卡片容器，我往里面塞内容" |
| `tab-list-page`<br>Tab+列表 | 我的订单 / 订单列表页 / 待付款已发货列表；"顶部几个 Tab 切换、下面卡片列表"；消息列表 / 商品列表 / 任务列表 / 优惠券列表 / 我的收藏 |
| `chat-page`<br>聊天 | 聊天页 / 聊天界面 / 会话页 / IM 对话 / 消息页面 / 客服聊天 / 私信页 / 微信聊天样式 |
| `moments-page`<br>朋友圈 | 朋友圈 / 动态列表 / 社区动态 / 带点赞评论的列表 / 社交信息流 |
| `product-detail-page`<br>商品详情 | 商品详情页 / 详情页 / 产品介绍页 / 文章详情；"底部有购物车/加入购物车/立即购买的详情页" |
| `profile-page`<br>我的/设置/购物车 | 我的页面 / 个人中心 / 设置页 / 通知中心 / 收货地址列表 / 购物车列表 / 账户设置 / 优惠券列表 |
| `image-card`<br>图片卡片 | 图片卡片 / 图文卡片 / 商品卡 / 内容卡 / Banner 卡 / 卡片列表项 |

### 参数与内容调整（base-card 及任何组件）

这类触发词用于**微调组件外观或新增参数**，不需要重写组件：

- **调外观**："卡片圆角大一点" / "内边距改小" / "加个阴影" / "加一圈边框" / "背景换成主题色"
- **可点击**："这个卡片要能点击，点击触发事件"
- **填内容**："在卡片里加标题/头部/底部内容"（对应 `#header` / 默认 slot / `#footer`）
- **透传统一调整**："把列表里所有卡片的圆角/间距统一改一下"（走 `cardProps` 透传）
- **新增参数**："给这个组件加一个 prop XX" / "加个参数控制是否显示 XX"
- **变量化**："这里别写死颜色，用主题变量"
- **不写死内容**："卡片内容我自己填，别内置死数据"

### 通用触发

- "把页面做成组件，我能自己填内容"
- "用主题系统给这些页面配色 / 换肤"
- "生成页面组件 / 组件化页面"
- "我项目里没这些页面，帮我生成几个常用的"

## 工作流程

### Step 1：确认目标与主题系统

1. 与用户确认要生成哪些页面组件（可多选：base-card / tab-list-page / chat-page / moments-page / product-detail-page / profile-page / image-card）。
2. 检测目标项目是否已有主题系统：在全局样式入口（`App.vue` 的 `<style>`、`src/styles/`、`static/css/` 等）中查找是否存在 CSS 变量 `--color-primary` / `--primary-500` / `--radius-card` / `--spacing-md` 等。
   - **有主题系统**：直接使用组件模板，无需改动。
   - **无主题系统**：二选一——
     - 询问用户是否先调用 `uniapp-theme-skill` 初始化主题系统（推荐，后续统一换肤）；
     - 或按 `references/theme-integration.md` 的「无主题系统 fallback 硬编码替换表」把每个 `var(--xxx)` 替换为具体值（无主题系统时允许写死）。

### Step 2：复制组件进项目

把选中的组件目录复制到项目 `src/components/` 下（每个组件保持 `<组件名>/<组件名>.vue` 结构）：

```
src/components/
├── base-card/base-card.vue
├── tab-list-page/tab-list-page.vue
├── chat-page/chat-page.vue
├── moments-page/moments-page.vue
├── product-detail-page/product-detail-page.vue
├── profile-page/profile-page.vue
└── image-card/image-card.vue
```

### Step 3：注册组件

推荐 **easycom 自动注册**（uni-app Vue3 默认规则 `components/组件名/组件名.vue` → 全局标签）：

```json
// pages.json
{
  "easycom": {
    "autoscan": true
  }
}
```

即可直接在页面中使用 `<base-card>`、`<chat-page>` 等标签；若项目未开启 autoscan，则用 `easycom` 自定义规则或手动 `import`（参考 `references/theme-integration.md` §3）。

### Step 4：生成使用示例

按 `references/page-specs.md` 中对应页面的「完整页面示例」为用户生成一个可运行的 page 落地（含 mock 数据 + 交互），并给出该页面的 Props/Slots/Emits 速查表。用户确认后可在示例页基础上替换真实数据。

### Step 5：验证

- 检查组件是否使用了主题变量而非裸值（见红线 R01）；
- 检查 `<image>` 是否带 `mode` + error 兜底、可点击区域是否 ≥ 88rpx；
- 确认 easycom 注册与页面引用路径正确；
- 提示用户运行编译确认。

### 组件调整模式（base-card 参数与内容）

当用户说"调整卡片圆角/内边距/阴影"、"给组件加个参数"、"卡片内容我自己填"等时，按下面规则响应（不要重写组件）：

| 用户意图 | 处理方式 |
|----------|----------|
| 调外观（圆角/内边距/背景/描边/阴影/外边距/gap） | 优先在**调用处传 prop**（`<base-card :radius="'var(--radius-lg)'" ...>`）；不改组件默认值，除非用户要求全局生效 |
| 调某页所有卡片的圆角/间距 | 该页面组件传 `cardProps`（如 `:card-props="{ radius: 'var(--radius-lg)' }"`），不逐卡片改 |
| 加标题/头部/底部内容 | 用 `#header` / 默认 slot / `#footer`，不新增 prop |
| 整个内容区换掉 | 用默认 slot 整体替换（`image-card` 用默认 slot 覆盖 title/description/tags） |
| 组件可点击 | 传 `:clickable="true"` 并监听 `@click` |
| **新增参数** | 在对应组件 `interface Props` 加字段 + `withDefaults` 给默认值，再在模板中使用；不得破坏既有 props/emit/slot 名（向后兼容） |
| 用主题变量/去写死 | 颜色/字号/间距/圆角改 `var(--xxx)`；主题无对应变量的合理例外见 R01 |

> 调整完成后必须复查红线 R01（无新硬编码）、R03（新参数有默认值）、R10（保留扩展口）。

## 主题系统绑定规则

> 本 skill 的组件**默认依赖 uniapp-theme-skill 的主题变量**，遵循"禁止写死"原则。

| 用途 | 优先使用变量 |
|------|--------------|
| 主色 | `var(--color-primary)`（按钮/高亮/自己气泡） |
| 页面背景 | `var(--color-bg-page)` |
| 卡片/输入/气泡背景 | `var(--color-bg-surface)` |
| 浅色强调底 | `var(--color-bg-tinted)`（标签底/点赞评论底） |
| 文字主/次/弱 | `var(--color-text-primary)` / `var(--color-text-secondary)` / `var(--color-text-tertiary)` |
| 边框 | `var(--color-border-light)` |
| 反白文字 | `var(--white)` |
| 卡片圆角 | `var(--radius-card)`；图片 `--radius-image`；头像 `--radius-avatar`；按钮 `--radius-btn` |
| 间距 | `var(--spacing-xs/sm/md/lg/xl/2xl/3xl)` |
| 字号 | `var(--font-xs/sm/md/lg/xl/2xl)` |
| 控件高 | `var(--height-btn-md/lg/xl)`、`var(--height-avatar-sm/md/lg)` |
| 图标尺寸 | `var(--icon-md/lg)` |

- 全部变量清单见 `references/theme-integration.md` §1；
- 组件样式一律写在 `<style lang="scss" scoped>` 中；
- 无主题系统时的硬编码替换表见 `references/theme-integration.md` §2。

## 使用前提（重要）

1. **自定义导航栏**：`chat-page` / `product-detail-page` 内置的是**简化版导航栏**（固定高度，未做状态栏高度适配与胶囊按钮对齐，微信小程序下会与默认导航栏叠加）。使用这两个组件时：
   - 页面 `pages.json` 需设 `"navigationStyle": "custom"`；
   - 正式项目建议用项目已有 NavBar（见 uniapp-style-skill §10.5）替换，或通过 `#header`（chat-page）/ `#navbar`（product-detail-page）slot 传入项目导航栏。
2. **容器高度**：`tab-list-page` / `chat-page` / `product-detail-page` 根容器为 `height: 100%`，使用页面需给容器确定高度（如页面根 `view` 设 `height: 100vh`），否则内部 flex 布局会被内容撑开而非固定满屏。
3. **主题系统**：所有组件样式依赖 `var(--xxx)` 主题变量；项目无主题系统时，按 `references/theme-integration.md` §2 的 fallback 表硬编码（或先在全局一次性定义该组变量，组件原样复制）。
4. **页面背景**：`tab-list-page` / `chat-page` / `moments-page` / `profile-page` / `product-detail-page` 自带页面级背景（`--color-bg-page`），外层无需再包容器。

## 红线规则

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

## References

- `references/page-specs.md` — 各页面组件 API 速查（Props / Slots / Emits / 默认数据 / mock 数据 / 完整页面示例 / 扩展建议）
- `references/theme-integration.md` — 主题变量清单、无主题系统 fallback 硬编码替换表、easycom 注册方式、主题变量覆盖示例
- `components/` — 7 个组件模板（base-card 托底 + 6 类页面组件）
