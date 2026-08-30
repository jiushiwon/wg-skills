# uniapp-card-skill

> 基于"一切皆卡片"思想的 uni-app 卡片组件技能。

## 核心组件

- **base-card** - 基础卡片组件

## 功能

- 通用卡片布局（8 种基础 + 9 种信息流 + 6 种图表）
- 按钮组件（6 套风格）
- 固定底部按钮

## 使用方式

```markdown
/uniapp-card-skill 做一个卡片
/uniapp-card-skill 做一个基础卡片
/uniapp-card-skill 做一个商品卡片
/uniapp-card-skill 做一个按钮
/uniapp-card-skill 做一个胶囊按钮
```

## 目录说明

```
├── base-card.md              # 基础卡片组件文档
├── demo-components/
│   └── base-card-layout/     # 卡片布局案例集
│       ├── card-1-md/       # 分类一：通用基础卡片（8 个）
│       ├── card-1-html/
│       ├── card-2-md/       # 分类二：信息流卡片（9 个：image/notify/comment + post/video/article/news/topic/coupon）
│       ├── card-2-html/
│       ├── card-3-md/       # 分类三：图表卡片（6 个：line/bar/pie/radar/progress/gauge · 原生 SVG）
│       └── card-3-html/
```

## 信息流卡片速查（card-2）

| 案例 | 风格 | 触发词 |
|------|------|--------|
| card-image | 大图+标题+描述+底部 | 图片卡片 |
| card-notify | 图标+标题+描述+时间+徽标 | 通知卡片 |
| card-comment | 头像+昵称+时间+内容+点赞 | 评论卡片 |
| card-post | 头像+作者徽标+内容+多图+位置+互动 | 朋友圈、动态、社交动态 |
| card-video | 16:10封面+播放按钮+时长+统计 | 视频卡片 |
| card-article | 16:9封面+分类+标题+摘要+作者 | 文章卡片 |
| card-news | 左文+右图+来源+阅读+时间+热门 | 新闻、资讯列表 |
| card-topic | 渐变头图+#号+角标+讨论+参与 | 话题卡片 |
| card-coupon | 异形+渐变+金额+虚线+按钮+状态 | 优惠券卡片 |

## 图表卡片速查（card-3 · 原生 SVG）

| 案例 | 风格 | 触发词 |
|------|------|--------|
| card-line | 平滑折线+渐变填充+涨跌指示 | 折线图、趋势图 |
| card-line-tabs | 折线+顶部 tab 切换 | 时段切换折线图 |
| card-line-multi | 多线对比+图例 | 多线对比 |
| card-line-metric | 4 行指标+迷你折线 | 指标卡、Dashboard |
| card-line-area | 3 层堆叠面积 | 堆叠面积、渠道分布 |
| card-line-tooltip | 折线+节点 tooltip | 节点高亮 |
| card-bar | 柱状+高亮当前项+数值标签 | 柱状图、对比图 |
| card-pie | 环形+中心数值+彩色图例 | 饼图、环形图、占比 |
| card-radar | 6 维评分+本人/同行双层 | 雷达图、能力评估 |
| card-progress | 进度环+任务列表+优先级 | 进度环、任务进度 |
| card-gauge | 270° 弧+渐变+指针+刻度 | 仪表盘、健康指数 |

> **图表实现原则**：全部使用原生 SVG 绘制（path / circle / polyline），无任何图表库（echarts / antv / d3）。

## 相关技能

- [uniapp-form-skill](../uniapp-form-skill/) - 表单组件（依赖 base-input）
- [uniapp-page-skill](../uniapp-page-skill/) - 页面模板（依赖 base-card）
