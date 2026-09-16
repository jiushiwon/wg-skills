# 卡片布局案例集（base-card）

`base-card` 是 uniapp-base-skill 的基石组件，所有页面元素都由它组合而成。本案例集给出 **30 种卡片布局** 的 HTML 参考图，每种独立成文件，方便按形态检索复用。

> 卡片按钮是 `base-card` 的一个**变体**（内嵌按钮元素），不是独立组件。

## 共用组件

> [base-card.md](../../base-card.md) —— 通用卡片规范、Props、Slots、变体。  
> 按钮/图标等是 `base-card` 的内容区域，不单独建组件。

## 案例清单

### 分类一：card-1 (通用基础卡片)

| 案例 | 形态 | 适用场景 | 文档 | HTML |
|------|------|----------|------|------|
| card-basic | 标题+描述+标签+操作 | 通用信息展示 | [card-1-md/card-basic.md](card-1-md/card-basic.md) | [card-1-html/card-basic.html](card-1-html/card-basic.html) |
| card-product | 图片+名称+描述+价格+按钮 | 电商、商品详情 | [card-1-md/card-product.md](card-1-md/card-product.md) | [card-1-html/card-product.html](card-1-html/card-product.html) |
| card-profile | 封面+头像+昵称+统计 | 个人中心、用户主页 | [card-1-md/card-profile.md](card-1-md/card-profile.md) | [card-1-html/card-profile.html](card-1-html/card-profile.html) |
| card-friend | 头像+昵称+签名+箭头 | 好友列表、联系人 | [card-1-md/card-friend.md](card-1-md/card-friend.md) | [card-1-html/card-friend.html](card-1-html/card-friend.html) |
| card-set | 图标+标签+开关/箭头 | 设置页、偏好配置 | [card-1-md/card-set.md](card-1-md/card-set.md) | [card-1-html/card-set.html](card-1-html/card-set.html) |
| card-vip | 深色渐变+头像+等级+权益 | VIP会员、个人中心 | [card-1-md/card-vip.md](card-1-md/card-vip.md) | [card-1-html/card-vip.html](card-1-html/card-vip.html) |
| card-menu | 九宫格图标+标签 | 个人中心菜单、功能入口 | [card-1-md/card-menu.md](card-1-md/card-menu.md) | [card-1-html/card-menu.html](card-1-html/card-menu.html) |
| card-grid | 每行3列图标网格 | 功能菜单、订单/商品/客服 | [card-1-md/card-grid.md](card-1-md/card-grid.md) | [card-1-html/card-grid.html](card-1-html/card-grid.html) |

### 分类二：card-2 (信息流卡片)

| 案例 | 形态 | 适用场景 | 文档 | HTML |
|------|------|----------|------|------|
| card-image | 大图+标题+描述+底部 | 图册、相册、封面 | [card-2-md/card-image.md](card-2-md/card-image.md) | [card-2-html/card-image.html](card-2-html/card-image.html) |
| card-notify | 图标+标题+描述+时间+徽标 | 系统通知、消息列表 | [card-2-md/card-notify.md](card-2-md/card-notify.md) | [card-2-html/card-notify.html](card-2-html/card-notify.html) |
| card-comment | 头像+昵称+时间+内容+点赞 | 评论区、留言板 | [card-2-md/card-comment.md](card-2-md/card-comment.md) | [card-2-html/card-comment.html](card-2-html/card-comment.html) |
| card-post | 头像+作者徽标+内容+多图网格+位置+互动 | 朋友圈、动态、社交内容 | [card-2-md/card-post.md](card-2-md/card-post.md) | [card-2-html/card-post.html](card-2-html/card-post.html) |
| card-video | 16:10封面+播放按钮+时长+统计 | 视频流、短视频列表 | [card-2-md/card-video.md](card-2-md/card-video.md) | [card-2-html/card-video.html](card-2-html/card-video.html) |
| card-article | 16:9封面+分类+标题+摘要+作者+阅读数 | 公众号、博客文章流 | [card-2-md/card-article.md](card-2-md/card-article.md) | [card-2-html/card-article.html](card-2-html/card-article.html) |
| card-news | 左文+右图+来源+阅读数+时间+热门标记 | 新闻、资讯列表 | [card-2-md/card-news.md](card-2-md/card-news.md) | [card-2-html/card-news.html](card-2-html/card-news.html) |
| card-topic | 渐变头图+#号+角标+描述+讨论+参与按钮 | 话题广场、社区#标签 | [card-2-md/card-topic.md](card-2-md/card-topic.md) | [card-2-html/card-topic.html](card-2-html/card-topic.html) |
| card-coupon | 异形+渐变+左侧金额+虚线+右侧按钮+状态 | 我的优惠券、领券中心 | [card-2-md/card-coupon.md](card-2-md/card-coupon.md) | [card-2-html/card-coupon.html](card-2-html/card-coupon.html) |

### 分类三：card-3 (图表卡片 · canvas 2d 跨端兼容)

| 案例 | 形态 | 适用场景 | 文档 |
|------|------|----------|------|
| card-line | 平滑折线+渐变填充+涨跌指示 | 销售趋势、活跃度、健康数据 | [card-3-md/card-line.md](card-3-md/card-line.md) |
| card-line-tabs | 折线+顶部 tab 切换（7天/30天/90天） | 时段切换折线图 | [card-3-md/card-line-tabs.md](card-3-md/card-line-tabs.md) |
| card-line-multi | 多线对比（本月/上月/平均）+ 图例 | 多产品线对比、同环比 | [card-3-md/card-line-multi.md](card-3-md/card-line-multi.md) |
| card-line-metric | 4 行指标+迷你折线（sparkline） | Dashboard 多指标 | [card-3-md/card-line-metric.md](card-3-md/card-line-metric.md) |
| card-line-area | 3 层堆叠面积图+累计总数 | 渠道分布、构成变化 | [card-3-md/card-line-area.md](card-3-md/card-line-area.md) |
| card-line-tooltip | 折线+节点圆点+活动节点 tooltip | 节点高亮、关键时刻 | [card-3-md/card-line-tooltip.md](card-3-md/card-line-tooltip.md) |
| card-line-value | 折线+每个点标数值+Y轴刻度+X轴标签+图例 | 活力指数、步数趋势、健康数据 | [card-3-md/card-line-value.md](card-3-md/card-line-value.md) |
| card-bar | 柱状+高亮当前项+数值标签 | 月度对比、销量排行 | [card-3-md/card-bar.md](card-3-md/card-bar.md) |
| card-pie | 环形+中心数值+彩色图例 | 流量来源、消费分类 | [card-3-md/card-pie.md](card-3-md/card-pie.md) |
| card-radar | 6 维评分+本人/同行双层 | 综合能力、技能评估 | [card-3-md/card-radar.md](card-3-md/card-radar.md) |
| card-progress | 进度环+任务列表+优先级 | 任务完成度、学习进度 | [card-3-md/card-progress.md](card-3-md/card-progress.md) |
| card-gauge | 270° 弧+渐变+指针+刻度 | 健康指数、CPU、信用评分 | [card-3-md/card-gauge.md](card-3-md/card-gauge.md) |

> **图表实现原则**：全部使用 **canvas 2d** 绘制，跨端条件编译兼容（H5/App 普通 canvas，小程序 `<canvas type="2d">`），无任何图表库（echarts / antv / d3）。每个图表 md 为自包含组件代码，公共绘制逻辑复用 `_chart-draw.md`，跨端初始化基座见 `_canvas-base.md`。

## 设计原则

1. **容器圆角随场景变化**：12px 是默认值，8px 用于紧凑列表，0 用于面板式无圆角。
2. **卡片是内容容器**：`base-card` 仅负责容器属性（背景/圆角/边框/阴影），内容由业务决定。
3. **按钮是卡片内容**：所有按钮形态都是 `base-card` 内部的内容元素，不单独定义组件。
4. **头像/图标用 slot**：通过 `<slot>` 注入头像、图标、徽标等业务元素。
5. **阴影分场景**：列表用 `shadow-sm`，弹窗用 `shadow-md`，强调用 `shadow-lg`。
6. **点击态用 `:active`**：可点击卡片通过 CSS `.is-clickable:active` 实现点击反馈。

## 圆角 × 阴影选型对照

| 圆角 | 阴影 | 典型场景 | 对应案例 |
|------|------|----------|----------|
| `0` | none | 面板式、紧凑列表 | card-set |
| `8px` | shadow-sm | 通用列表、设置项 | card-friend / card-comment |
| `12px` | shadow-sm | 标准卡片、内容区块 | card-basic / card-image / card-product / card-notify |
| `12px` | shadow-md | 弹窗、强调卡片 | card-vip / card-profile |

## 待完善组件

以下组件等待 base-input 等组件完成后迭代：
- base-popup / base-radio / base-switch / base-select / base-form

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill) 与 [uniapp-style-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-style-skill)

```
--color-bg-surface      卡片背景
--color-text-primary    主文字
--color-text-secondary  次文字
--radius-md             12px 圆角
--spacing-lg            16px 内边距
--shadow-sm            卡片阴影
```

## 文件结构

```
demo-components/base-card-layout/
├── README.md                  # 本文件
├── card-1-md/                 # 分类一：通用基础卡片
│   ├── card-basic.md
│   ├── card-product.md
│   ├── card-profile.md
│   ├── card-friend.md
│   ├── card-set.md
│   ├── card-vip.md
│   ├── card-menu.md
│   └── card-grid.md
├── card-1-html/                # 分类一：HTML 演示
│   ├── card-basic.html
│   ├── card-product.html
│   ├── card-profile.html
│   ├── card-friend.html
│   ├── card-set.html
│   ├── card-vip.html
│   ├── card-menu.html
│   └── card-grid.html
├── card-2-md/                 # 分类二：信息流卡片（9 个）
│   ├── card-image.md
│   ├── card-notify.md
│   ├── card-comment.md
│   ├── card-post.md
│   ├── card-video.md
│   ├── card-article.md
│   ├── card-news.md
│   ├── card-topic.md
│   └── card-coupon.md
├── card-2-html/               # 分类二：HTML 演示（9 个）
│   ├── card-image.html
│   ├── card-notify.html
│   ├── card-comment.html
│   ├── card-post.html
│   ├── card-video.html
│   ├── card-article.html
│   ├── card-news.html
│   ├── card-topic.html
│   └── card-coupon.html
└── card-3-md/                 # 分类三：图表卡片（12 个 · canvas 2d 跨端）
    ├── _canvas-base.md          # 跨端初始化基座（DPR / 条件编译 / 2d context）
    ├── _chart-draw.md           # 共享绘制函数（drawLineArea / drawSparkline / hexToRgba）
    ├── card-line.md              # 基础折线
    ├── card-line-tabs.md         # Tab 切换
    ├── card-line-multi.md        # 多线对比
    ├── card-line-metric.md       # 迷你指标卡
    ├── card-line-area.md         # 堆叠面积
    ├── card-line-tooltip.md      # 节点 tooltip
    ├── card-line-value.md        # 折线 · 数据点数值标注
    ├── card-bar.md
    ├── card-pie.md
    ├── card-radar.md
    ├── card-progress.md
    └── card-gauge.md
```

> 图片使用 `icon-image-catch-skill` 抓取的 Picsum/Lorem Picsum，避免占位图。

---

> [WARNING] Demo 案例仅供参考，非完美实现
