# uniapp 常用组件化页面 Skill

> 独立 uniapp 组件化页面技能：21 个组件（5 基础 + 6 业务 + 10 页面）覆盖小程序高频页面，复制进项目、往 slot 填内容即可用。自动接入 `uniapp-theme-skill` 主题系统（CSS 变量、禁止写死），支持自动检测项目主题对齐、自动替换 tabBar/导航栏、触发词一键扩展业务组件。

## 功能

- **21 个组件**：5 基础（空卡片 / 按钮 / 头部导航 / 底部菜单 / 表单行）+ 6 业务（用户卡片 / 评论条 / 通知栏 / 设置行 / 空状态 / 结果页，组合空壳实现）+ 10 页面（Tab+列表 / 聊天 / 朋友圈 / 详情 / 我的 / 图片卡 / 搜索 / 表单 / 登录 / 首页）
- **空卡片托底组件** `base-card`：统一圆角/内边距/背景/描边/阴影，其余卡片类组件入参包含它的入参（`cardProps` 透传）
- **高度自由化**：内容全走 slot，可加新 prop，默认数据跑通即替换
- **主题自动检测对齐**：接入时自动定位变量文件、识别命名风格（CSS/SCSS/LESS）、读取主色与尺寸；命名一致直接用，命名不同自动生成桥接层，无主题系统自动提取项目品牌色（详见 `references/theme-detect.md`）
- **自动替换 tabBar/导航栏**：读取现有 `pages.json` 的 `tabBar.list` 自动生成 `base-tabbar` 替换原生 tabBar（`"custom": true`）；tab 页面换 `base-navbar` 自定义头部菜单
- **规范合规**：遵循 `uniapp-style-skill` 红线（scoped、TS Props、图片兜底、可点击区 ≥ 88rpx、禁用第三方组件库）与 `uniapp-standard-skill` 规范
- **可组合**：与 `uniapp-standard-skill`（规范）→ `uniapp-theme-skill`（主题）→ `uniapp-style-skill`（视觉）→ 本技能（页面）→ `uniapp-request-skill`（数据）→ `uniapp-code-audit-skill`（审计）形成完整链路

## 使用方式

技能共 21 个组件，触发词无需说组件名，描述"要做的页面/操作"即可：

**按组件**：
- **Tab+列表**：... 
- **基础组件**：自定义按钮 / 头部导航 / 底部菜单 / 表单行
- **业务组件**：用户卡片 / 评论条 / 通知栏 / 设置行 / 空状态 / 结果页 / "带关注按钮的头像卡片"
- **自动替换**：用自定义底部菜单替换现有 tabBar / tab 页面换自定义头部菜单

**调参数与内容**：
- "卡片圆角大一点" / "内边距改小" / "加个阴影" / "加边框"
- "这个卡片要能点击" / "在卡片里加标题/头部/底部内容"
- "把列表里所有卡片的圆角统一改一下"（`cardProps` 透传）
- "给组件加一个 prop XX" / "别写死颜色，用主题变量" / "内容我自己填"

工作流程：确认组件 → 自动检测主题系统 → 复制组件（注意连带基础组件）→ easycom 注册 → 按 `references/page-specs.md` 生成示例 → 替换数据。替换 tabBar/导航栏见 `SKILL.md`「自动替换现有导航栏 / TabBar」。

## 组件清单

| 类型 | 组件 | 标签 | 用途 |
|------|------|------|------|
| 基础 | `base-card` | `<base-card>` | 空卡片托底（圆角/内边距/背景/描边/阴影，slot 自由填充） |
| 基础 | `base-button` | `<base-button>` | 自定义按钮（primary/ghost/text/danger × sm/md/lg + loading/disabled/block/round） |
| 基础 | `base-navbar` | `<base-navbar>` | 自定义头部导航（标题 + 返回 + 右侧 slot + 状态栏适配 + 吸顶） |
| 基础 | `base-tabbar` | `<base-tabbar>` | 自定义底部菜单（2~5 项 + 图标/角标 + 激活主题色 + 安全区） |
| 基础 | `base-form-item` | `<base-form-item>` | 表单行（label + 必填星号 + 控件 slot + 错误提示） |
| 业务 | `user-card` | `<user-card>` | 用户卡片：头像/昵称/签名/右侧按钮（基于 base-card + base-button） |
| 业务 | `comment-item` | `<comment-item>` | 评论条：头像/昵称/时间/内容/点赞/回复（基于 base-card） |
| 业务 | `notice-bar` | `<notice-bar>` | 通知/公告栏：icon/文案/可关闭/跑马灯（轻量） |
| 业务 | `setting-item` | `<setting-item>` | 设置/菜单行：图标/label/描述/箭头/角标/开关（独立） |
| 业务 | `empty` | `<empty>` | 空状态：图/文案/操作按钮（轻量 + base-button） |
| 业务 | `result-page` | `<result-page>` | 结果页：成功/失败/警告/信息 + 操作按钮（基于 base-button） |
| 页面 | `tab-list-page` | `<tab-list-page>` | Tab 吸顶 + 卡片列表（我的订单/消息中心/商品列表） |
| 页面 | `chat-page` | `<chat-page>` | 微信风格聊天（底部输入栏 + 左右气泡，自己的消息主题色高亮） |
| 页面 | `moments-page` | `<moments-page>` | 微信风格朋友圈（封面头图 + 动态 + 点赞评论） |
| 页面 | `product-detail-page` | `<product-detail-page>` | 商品详情（导航 + 头图 + 信息卡 + 多卡片 sections + 底部操作栏） |
| 页面 | `profile-page` | `<profile-page>` | 我的/设置/通知/购物车（信息头 + 分组列表 + 右箭头/角标/左图） |
| 页面 | `image-card` | `<image-card>` | 图片卡片（顶部图 + 标题 + 描述 + 标签） |
| 页面 | `search-page` | `<search-page>` | 搜索页（搜索框 + 历史/热门标签 + 结果列表 + 防抖） |
| 页面 | `form-page` | `<form-page>` | 表单页（导航 + 表单区 slot + 底部提交按钮） |
| 页面 | `login-page` | `<login-page>` | 登录页（logo + 表单 + 微信登录 + 协议勾选） |
| 页面 | `home-page` | `<home-page>` | 首页（区块 slots + 下拉刷新/加载更多 + 底部菜单） |

## 示例

```vue
<!-- 我的订单页：Tab + 卡片列表 -->
<template>
  <view style="height:100vh">
    <tab-list-page
      v-model="activeTab"
      :tabs="tabs"
      :list="orders"
      :loading="loading"
      :finished="finished"
      :card-props="{ radius: 'var(--radius-lg)' }"
      @load-more="loadMore"
      @item-click="onOrderClick"
    >
      <template #item="{ item }">
        <view class="flex-between">
          <text class="text-h3">{{ item.title }}</text>
          <text class="text-caption">{{ item.statusText }}</text>
        </view>
        <text class="text-body">{{ item.desc }}</text>
      </template>
    </tab-list-page>
  </view>
</template>
```

更多完整示例（含 mock 数据）见 `references/page-specs.md`。

## 目录结构

```
uniapp-page-components-skill/
├── SKILL.md                    # 技能定义：触发词、工作流、主题绑定、自动替换、红线
├── README.md                   # 本文件
├── components/                 # 21 个组件模板（复制到项目 src/components/ 即可用）
│   ├── base-card/base-card.vue
│   ├── base-button/base-button.vue
│   ├── base-navbar/base-navbar.vue
│   ├── base-tabbar/base-tabbar.vue
│   ├── base-form-item/base-form-item.vue
│   ├── user-card/user-card.vue
│   ├── comment-item/comment-item.vue
│   ├── notice-bar/notice-bar.vue
│   ├── setting-item/setting-item.vue
│   ├── empty/empty.vue
│   ├── result-page/result-page.vue
│   ├── tab-list-page/tab-list-page.vue
│   ├── chat-page/chat-page.vue
│   ├── moments-page/moments-page.vue
│   ├── product-detail-page/product-detail-page.vue
│   ├── profile-page/profile-page.vue
│   ├── image-card/image-card.vue
│   ├── search-page/search-page.vue
│   ├── form-page/form-page.vue
│   ├── login-page/login-page.vue
│   └── home-page/home-page.vue
└── references/
    ├── page-specs.md           # 各组件 API + 默认数据 + 完整页面示例
    ├── theme-integration.md    # 主题变量清单 + 无主题系统 fallback 表 + easycom + 状态栏适配
    └── theme-detect.md         # 主题系统自动检测与对齐
```

## 内部依赖（复制时连带）

| 组件 | 依赖 |
|------|------|
| `form-page` | `base-navbar`、`base-button` |
| `home-page` | `base-navbar`、`base-tabbar` |
| `login-page` | `base-button` |
| `tab-list-page` / `profile-page` / `image-card` | `base-card` |
| `user-card` | `base-card`、`base-button` |
| `comment-item` | `base-card` |
| `empty` / `result-page` | `base-button` |

## 依赖与组合链路

| 阶段 | Skill | 关系 |
|------|-------|------|
| 前置规范 | [uniapp-standard-skill](../uniapp-standard-skill/) | 通用红线、目录/命名/组件通信规范 |
| 前置依赖 | [uniapp-theme-skill](../uniapp-theme-skill/) | 主题系统（CSS 变量），项目无主题系统时需先初始化或按 fallback 表硬编码 |
| 必循规范 | [uniapp-style-skill](../uniapp-style-skill/) | 设计系统与组件规范（红线约束） |
| 上游骨架 | [uniapp-app-generate-skill](../uniapp-app-generate-skill/) | 项目骨架 + 原子组件（AppButton/AppTab/...），组件内部基础 UI 可用其替换 |
| 数据层 | [uniapp-request-skill](../uniapp-request-skill/) | 分页/发送/点赞等副作用由页面层走 request 封装，组件只展示 + emit |
| 后置体检 | [uniapp-code-audit-skill](../uniapp-code-audit-skill/) | 上线前全维度审计 |

完整链路：骨架（app-generate）→ 规范（standard）→ 主题（theme）→ 视觉（style）→ 页面（本技能）→ 数据（request）→ 审计（code-audit）。详见 `SKILL.md`「组合工作流」。
