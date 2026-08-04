# uniapp 常用组件化页面扩展 Skill（Plus）

> [uniapp-page-components-skill](../uniapp-page-components-skill/) 的扩展版：补齐 4 个基础组件（自定义按钮 / 头部导航 / 底部菜单 / 表单行）+ 4 个页面组件（搜索页 / 表单页 / 登录页 / 首页）。与主技能同风格、可混用，自动接入 `uniapp-theme-skill` 主题系统（CSS 变量、禁止写死）。

## 功能

- **4 个基础组件**：`base-button`（4 类型 × 3 尺寸 + loading/禁用）、`base-navbar`（状态栏适配 + 吸顶 + 右侧菜单）、`base-tabbar`（底部菜单 + 角标 + 安全区）、`base-form-item`（label + 必填星号 + 错误提示）
- **4 个页面组件**：`search-page`（历史/热门/结果 + 防抖）、`form-page`（表单区 + 底部提交）、`login-page`（手机号验证码 + 微信登录 + 协议）、`home-page`（区块 slots + 下拉刷新/加载更多 + 底部菜单）
- **与主技能互补**：`form-page` 表单区、`home-page` 列表区可放主技能的 `base-card` / `tab-list-page`
- **自由化**：内容全走 slot，可加新 prop，默认数据跑通即替换
- **主题系统绑定**：全 `var(--xxx)` 主题变量；无主题系统按 fallback 表硬编码
- **规范合规**：遵循 `uniapp-style-skill` 红线 + `uniapp-standard-skill` 规范

## 使用方式

技能共 8 个组件（4 基础 + 4 页面），触发词无需说组件名，描述"要做的页面/操作"即可：

**按组件**：
- **按钮**：自定义按钮 / 带 loading 和禁用的按钮 / 底部提交按钮
- **头部导航**：自定义头部 / 导航栏 / 标题栏带返回和右侧按钮
- **底部菜单**：底部导航 / TabBar / 带角标的菜单项
- **表单行**：表单行 / 表单项 / 带必填星号和错误提示的输入行
- **搜索页**：搜索 / 搜索框 + 历史 / 热门搜索 / 搜索结果页
- **表单页**：填写资料 / 发布页 / 意见反馈 / 地址填写
- **登录页**：登录 / 注册 / 手机号验证码登录 / 微信登录
- **首页**：首页 / 商城首页 / 工作台 / 带轮播金刚区的首页

工作流程：确认组件 → 检测主题系统 → 复制组件（注意连带基础组件）→ easycom 注册 → 按 `references/page-specs.md` 生成示例 → 替换数据。

## 组件清单

| 类型 | 组件 | 标签 | 用途 |
|------|------|------|------|
| 基础 | `base-button` | `<base-button>` | 自定义按钮（primary/ghost/text/danger × sm/md/lg + loading/disabled/block/round） |
| 基础 | `base-navbar` | `<base-navbar>` | 自定义头部导航（标题 + 返回 + 右侧 slot + 状态栏适配 + 吸顶） |
| 基础 | `base-tabbar` | `<base-tabbar>` | 自定义底部菜单（2~5 项 + 图标/角标 + 激活主题色 + 安全区） |
| 基础 | `base-form-item` | `<base-form-item>` | 表单行（label + 必填星号 + 控件 slot + 错误提示） |
| 页面 | `search-page` | `<search-page>` | 搜索页（搜索框 + 历史/热门标签 + 结果列表 + 防抖） |
| 页面 | `form-page` | `<form-page>` | 表单页（导航 + 表单区 slot + 底部提交按钮） |
| 页面 | `login-page` | `<login-page>` | 登录页（logo + 表单 + 微信登录 + 协议勾选） |
| 页面 | `home-page` | `<home-page>` | 首页（区块 slots + 下拉刷新/加载更多 + 底部菜单） |

## 示例

```vue
<!-- 登录页：手机号 + 验证码，接口走 request 封装 -->
<view style="height:100vh">
  <login-page
    title="欢迎登录"
    :loading="loading"
    @submit="onLogin"
    @wechat-login="onWechatLogin"
    @get-code="getCode"
  />
</view>

<script setup lang="ts">
const loading = ref(false)
function onLogin(data: { phone: string; code: string }) {
  // 调 auth-skill 对接的登录接口（uni.request 由 request 封装统一处理）
}
</script>
```

更多完整示例（含 mock 数据）见 `references/page-specs.md`。

## 目录结构

```
uniapp-page-components-plus-skill/
├── SKILL.md                    # 技能定义：触发词、工作流、主题绑定、红线
├── README.md                   # 本文件
├── components/                 # 组件模板（复制到项目 src/components/ 即可用）
│   ├── base-button/base-button.vue
│   ├── base-navbar/base-navbar.vue
│   ├── base-tabbar/base-tabbar.vue
│   ├── base-form-item/base-form-item.vue
│   ├── search-page/search-page.vue
│   ├── form-page/form-page.vue
│   ├── login-page/login-page.vue
│   └── home-page/home-page.vue
└── references/
    ├── page-specs.md           # 各组件 API + 默认数据 + 完整示例
    └── theme-integration.md    # 主题变量清单 + fallback 表 + easycom + 状态栏适配
```

## 内部依赖（复制时连带）

| 组件 | 依赖 |
|------|------|
| `form-page` | `base-navbar`、`base-button` |
| `home-page` | `base-navbar`、`base-tabbar` |
| `login-page` | `base-button` |

## 依赖与组合链路

| 阶段 | Skill | 关系 |
|------|-------|------|
| 兄弟 | [uniapp-page-components-skill](../uniapp-page-components-skill/) | 主技能：列表/聊天/朋友圈/详情/我的/图片卡片；本技能是其扩展，组件可混用 |
| 前置规范 | [uniapp-standard-skill](../uniapp-standard-skill/) | 红线、命名、组件通信 |
| 前置依赖 | [uniapp-theme-skill](../uniapp-theme-skill/) | 主题变量（CSS 变量） |
| 必循规范 | [uniapp-style-skill](../uniapp-style-skill/) | 设计系统红线 |
| 上游骨架 | [uniapp-app-generate-skill](../uniapp-app-generate-skill/) | 项目骨架 + 共享原子组件（二选一使用） |
| 数据层 | [uniapp-request-skill](../uniapp-request-skill/) / auth-skill | 搜索/提交/登录走 request 封装 |
| 后置体检 | [uniapp-code-audit-skill](../uniapp-code-audit-skill/) | 上线前审计 |
