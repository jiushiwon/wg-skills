# 详情页案例集

基于 `base-card` 卡片容器组合出的 6 类高频详情页模板，与 `list` 列表页系列形成互补。

## 核心思想

详情页 = **外层 base-card 容器** + **头图/头部卡片** + **信息卡片** + **操作区**

通过调整 `radius`、`margin`、`padding`、`shadow`、`background` 等参数，即可适配不同业务场景。

## 案例清单

| 案例 | 来源页面 | 结构特点 | 适用场景 |
|------|---------|---------|---------|
| [product-detail](html/product-detail.html) | 034 商品详情 | 轮播大图 + 标题价格 + 规格配送 + 服务保障 + 详情参数 | 商品详情、服务详情 |
| [activity-detail](html/activity-detail.html) | 051 活动详情 | 头图状态角标 + 标题价格 + 时间地点信息 + 底部报名 | 活动详情、线路详情、课程详情 |
| [post-detail](html/post-detail.html) | 075 帖子详情 | 作者信息 + 大图 + 正文 + 互动数据 + 评论区 | 帖子详情、日记详情、文章详情 |
| [profile-detail](html/profile-detail.html) | 025 个人中心 | 渐变用户信息头部 + 数据统计 + VIP 卡片 + 功能网格 | 个人中心、创作者中心、会员中心 |
| [wallet-detail](html/wallet-detail.html) | 011 宝石钱包 | 渐变余额卡片 + 交易明细列表 | 钱包、资产、积分明细 |
| [result-detail](html/result-detail.html) | 070 支付成功 | 状态图标 + 文案 + 操作按钮 + 推荐内容 | 支付结果、空状态、404 |

## 文件结构

```
demo-components/detail/
├── README.md                  # 本文件
├── html/                      # HTML 演示
│   ├── product-detail.html
│   ├── activity-detail.html
│   ├── post-detail.html
│   ├── profile-detail.html
│   ├── wallet-detail.html
│   └── result-detail.html
└── static/                    # 演示素材
    ├── icons/                 # lucide SVG 图标
    └── images/                # 示例图片
```

## 使用方式

直接用浏览器打开 `html/*.html` 即可预览效果。

> 图片和图标素材已用 `icon-image-catch-skill` 抓取到 `static/` 目录，避免空白占位。

## base-card 参数组合

这 6 个案例共用一套设计变量：

| 参数 | 值 | 说明 |
|------|-----|------|
| radius | `var(--radius-lg)` | 12px 大圆角 |
| margin | `var(--space-3)` | 12px 间距分割 |
| shadow | `var(--shadow-sm)` | 轻微阴影 |
| padding | `var(--space-3)` / `var(--space-4)` | 根据内容密度调整 |

特殊变体：

- **渐变卡片**：`background: linear-gradient(...)`，用于余额、VIP、用户头部
- **全宽头图卡片**：`overflow: hidden` + 内部大图
- **状态结果卡片**：居中对齐 + 大图标

## 提示词示例

```markdown
# 商品详情
/uniapp-base-skill 做一个商品详情页，顶部轮播图，标题价格，规格配送，底部购买按钮

# 活动详情
/uniapp-base-skill 做一个活动详情页，顶部大图带状态角标，时间地点信息，底部报名按钮

# 帖子详情
/uniapp-base-skill 做一个帖子详情页，作者信息，大图正文，点赞评论互动

# 个人中心
/uniapp-base-skill 做一个个人中心，渐变头部，数据统计，VIP 卡片，功能网格

# 钱包详情
/uniapp-base-skill 做一个钱包详情页，渐变余额卡片，交易明细列表

# 结果页
/uniapp-base-skill 做一个支付成功结果页，状态图标，操作按钮，推荐商品
```

## 注意事项

1. HTML 演示中使用的是 `div`/`img` 等 H5 标签，实际 uniapp 开发时请替换为 `view`/`image`。
2. 图标使用 `lucide` SVG，实际项目中可替换为 `uniapp` 图标字体或本地图片。
3. 所有颜色应使用 `uniapp-theme-skill` 主题变量，禁止写死色值。
