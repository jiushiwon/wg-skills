# base-card-layout 卡片布局

> 13 种卡片布局模板，基于 base-card 组合实现

## 布局清单

| 布局 | 说明 | 文档 |
|------|------|------|
| 基础卡片 | 纯文字、带标签、带操作 | [card-basic.md](demo-components/base-card-layout/card-1-md/card-basic.md) |
| 图片卡片 | 大图顶部、横向图文 | [card-image.md](demo-components/base-card-layout/html/card-image.md) |
| 信息卡片 | 统计网格、详情信息 | [card-info.md](demo-components/base-card-layout/card-1-md/card-info.md) |
| 商品卡片 | 商品图+标题+价格+按钮 | [card-product.md](demo-components/base-card-layout/html/card-product.md) |
| 个人中心 | 封面+头像+统计 | [card-profile.md](demo-components/base-card-layout/card-1-md/card-profile.md) |
| 好友卡片 | 头像+昵称+签名+箭头 | [card-friend.md](demo-components/base-card-layout/card-1-md/card-friend.md) |
| 设置卡片 | 图标+标签+开关/箭头 | [card-set.md](demo-components/base-card-layout/card-1-md/card-set.md) |
| 评论卡片 | 头像+昵称+内容+点赞 | [card-comment.md](demo-components/base-card-layout/html/card-comment.md) |
| 通知卡片 | 图标+标题+描述+时间 | [card-notify.md](demo-components/base-card-layout/html/card-notify.md) |
| VIP卡片 | 深色渐变+头像+等级 | [card-vip.md](demo-components/base-card-layout/html/card-vip.md) |
| 菜单卡片 | 九宫格图标+标签 | [card-menu.md](demo-components/base-card-layout/card-1-md/card-menu.md) |
| 功能网格 | 每行3列图标网格 | [card-grid.md](demo-components/base-card-layout/card-1-md/card-grid.md) |
| 按钮卡片 | 按钮组+固定悬浮 | [card-button.md](demo-components/base-card-layout/card-1-md/card-button.md) |

## 共用组件

- [base-card.md](base-card.md) - 基础卡片容器

## 设计原则

1. 容器圆角随场景变化：12px 默认，8px 紧凑，0 面板式
2. 卡片是内容容器，base-card 负责容器属性
3. 头像/图标通过 slot 注入
