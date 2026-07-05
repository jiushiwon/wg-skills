# 布局模式与风格选项

> 本参考文档定义 `uniapp-app-generate-skill` 在初始化小程序时可选择的几种标准布局模式。技能应在开发前通过提问让用户选择，并据此生成 `pages.json`、`tabBar`、首页及我的页面。

## 通用布局约束

无论选择哪种风格，以下约束保持不变：

- **底部 TabBar**：固定高度 `$comp-tab-bar-height`（默认 100rpx，含安全区），2~5 个入口，激活态使用主色。
- **顶部导航栏**：统一高度 `$comp-navbar-height`（默认 88rpx）+ 状态栏高度，标题居中，支持返回按钮。
- **内容区**：距离顶部导航栏底部 `0`，底部距离 TabBar 顶部 `0`，左右内边距 `$comp-page-padding`（默认 16rpx）。
- **我的页面**：必须包含用户头像、昵称、设置入口，以及若干功能列表项。

## 风格一：清新健康风（默认推荐）

**适用场景**：健康、运动、生活方式类小程序。

**视觉特征**：
- 主色：青绿色（`#10b981`）
- 背景：大面积白色 + 浅灰卡片
- 圆角：大圆角（`$radius-lg` ~ `$radius-xl`）
- 图标：线性风格，激活态填充主色
- 阴影：轻微投影（`$shadow-1`）

**页面结构**：
- 首页：顶部问候 + 核心数据卡片 + 快捷功能入口 Grid
- 数据页：图表 + 列表
- 发现页：资讯/活动卡片流
- 我的页：头像卡片 + 功能列表

## 风格二：极简工具风

**适用场景**：效率、工具、记账、待办类小程序。

**视觉特征**：
- 主色：深蓝或深灰（`#2563eb` 或 `#1f2937`）
- 背景：纯白，极少装饰
- 圆角：小圆角（`$radius-sm` ~ `$radius-md`）
- 图标：单色线性，无填充
- 阴影：几乎无阴影，靠边框分隔

**页面结构**：
- 首页：顶部统计 + 核心操作按钮
- 列表页：简洁列表 + 状态标签
- 统计页：数字卡片 + 简单图表
- 我的页：头像 + 设置列表

## 风格三：活泼社区风

**适用场景**：社交、社区、内容类小程序。

**视觉特征**：
- 主色：暖橙色或粉紫色（`#f97316` 或 `#a855f7`）
- 背景：渐变背景或浅色主题背景
- 圆角：超大圆角（`$radius-xl`）
- 图标：面性图标，色彩丰富
- 阴影：柔和大投影（`$shadow-2`）

**页面结构**：
- 首页：信息流卡片（瀑布流）
- 发布页：大按钮 + 媒体选择
- 消息页：会话列表
- 我的页：个人主页风格（头图 + 头像 + 数据）

## 风格四：商务数据风

**适用场景**：B2B、管理后台、数据看板类小程序。

**视觉特征**：
- 主色：深蓝或藏青（`#0f172a` 或 `#1e40af`）
- 背景：浅灰（`$color-bg-tertiary`）
- 圆角：中等圆角（`$radius-md`）
- 图标：线性 + 主色点缀
- 阴影：卡片投影（`$shadow-1`）

**页面结构**：
- 首页：数据卡片 Grid + 快捷入口
- 报表页：图表 + 表格
- 任务页：状态驱动列表
- 我的页：企业信息 + 设置

## 选择流程

技能初始化时，向用户提出以下问题：

1. "你的小程序主要面向什么场景？（健康/效率/社交/商务/其他）"
2. "你希望整体风格偏向？（清新/极简/活泼/商务）"
3. "底部 TabBar 需要几个入口？默认推荐 4 个：首页、数据/发现、消息/发布、我的。"
4. "是否需要深色模式？（默认先实现浅色，后续可扩展）"

根据回答，从上述四种风格中选择最接近的一种作为基础，并允许用户微调主色。

## TabBar 配置示例（清新健康风，4 入口）

```json
{
  "tabBar": {
    "color": "#9ca3af",
    "selectedColor": "#10b981",
    "backgroundColor": "#ffffff",
    "borderStyle": "white",
    "list": [
      { "pagePath": "pages/index/index", "text": "首页", "iconPath": "static/tab-bar/home.png", "selectedIconPath": "static/tab-bar/home-active.png" },
      { "pagePath": "pages/data/index", "text": "数据", "iconPath": "static/tab-bar/data.png", "selectedIconPath": "static/tab-bar/data-active.png" },
      { "pagePath": "pages/discover/index", "text": "发现", "iconPath": "static/tab-bar/discover.png", "selectedIconPath": "static/tab-bar/discover-active.png" },
      { "pagePath": "pages/profile/index", "text": "我的", "iconPath": "static/tab-bar/profile.png", "selectedIconPath": "static/tab-bar/profile-active.png" }
    ]
  }
}
```

## 图标资源清单

每种风格初始化后，需生成以下 TabBar 图标（PNG，建议 81x81px）：

- `static/tab-bar/home.png` / `home-active.png`
- `static/tab-bar/data.png` / `data-active.png`
- `static/tab-bar/discover.png` / `discover-active.png`
- `static/tab-bar/profile.png` / `profile-active.png`
- 可选：`static/tab-bar/message.png` / `message-active.png`、`static/tab-bar/publish.png` / `publish-active.png`

生成方式：调用 `icon-forge` 技能，输入 SVG path 或描述词，批量渲染为 PNG。

## 我的页面通用模块

无论哪种风格，我的页面应包含：

1. **用户信息区**：头像、昵称、ID/等级
2. **功能入口列表**：设置、关于、帮助与反馈
3. **数据展示区**（可选）：累计天数、完成任务数等
4. **退出登录**（可选）

布局上：
- 头像直径 `$comp-avatar-size-md`（默认 120rpx）
- 用户信息区由 `$comp-user-info-padding-y` + 头像 + 昵称撑开，整体高度约 240rpx
- 列表项最小高度 `$comp-list-item-min-height`（默认 96rpx），左侧图标 + 文字，右侧箭头
