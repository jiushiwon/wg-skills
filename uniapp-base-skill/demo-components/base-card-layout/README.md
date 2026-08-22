# 卡片布局案例集（base-card）

`base-card` 是 uniapp-base-skill 的基石组件，所有页面元素都由它组合而成。本案例集给出 **13 种卡片布局** 的 HTML 参考图，每种独立成文件，方便按形态检索复用。

> 卡片按钮是 `base-card` 的一个**变体**（内嵌按钮元素），不是独立组件。

## 共用组件

> [base-card.md](../../base-card.md) —— 通用卡片规范、Props、Slots、变体。  
> 按钮/图标等是 `base-card` 的内容区域，不单独建组件。

## 案例清单

| 案例 | 形态 | 适用场景 | 文档 | HTML |
|------|------|----------|------|------|
| card-basic | 标题+描述+标签+操作 | 通用信息展示 | [card-basic.md](card-basic.md) | [html/card-basic.html](html/card-basic.html) |
| card-image | 大图+标题+描述+底部 | 图册、相册、封面 | [card-image.md](card-image.md) | [html/card-image.html](html/card-image.html) |
| card-info | 统计网格/详情/进度条 | 数据展示、个人中心 | [card-info.md](card-info.md) | [html/card-info.html](html/card-info.html) |
| card-product | 图片+名称+描述+价格+按钮 | 电商、商品详情 | [card-product.md](card-product.md) | [html/card-product.html](html/card-product.html) |
| card-profile | 封面+头像+昵称+统计 | 个人中心、用户主页 | [card-profile.md](card-profile.md) | [html/card-profile.html](html/card-profile.html) |
| card-friend | 头像+昵称+签名+箭头 | 好友列表、联系人 | [card-friend.md](card-friend.md) | [html/card-friend.html](html/card-friend.html) |
| card-set | 图标+标签+开关/箭头 | 设置页、偏好配置 | [card-set.md](card-set.md) | [html/card-set.html](html/card-set.html) |
| card-comment | 头像+昵称+时间+内容+点赞 | 评论区、留言板 | [card-comment.md](card-comment.md) | [html/card-comment.html](html/card-comment.html) |
| card-notify | 图标+标题+描述+时间+徽标 | 系统通知、消息列表 | [card-notify.md](card-notify.md) | [html/card-notify.html](html/card-notify.html) |
| card-vip | 深色渐变+头像+等级+权益 | VIP会员、个人中心 | [card-vip.md](card-vip.md) | [html/card-vip.html](html/card-vip.html) |
| card-menu | 九宫格图标+标签 | 个人中心菜单、功能入口 | [card-menu.md](card-menu.md) | [html/card-menu.html](html/card-menu.html) |
| card-grid | 每行3列图标网格 | 功能菜单、订单/商品/客服 | [card-grid.md](card-grid.md) | [html/card-grid.html](html/card-grid.html) |
| card-button | 背景色+尺寸+圆角+图标+全宽+悬浮 | 按钮组、操作入口、固定底部 | [card-button.md](card-button.md) | [html/card-button.html](html/card-button.html) |

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
├── *.md                       # 各卡片布局技能文档 (13个)
├── html/                      # HTML 演示
│   ├── card-basic.html
│   ├── card-image.html
│   ├── card-info.html
│   ├── card-product.html
│   ├── card-profile.html
│   ├── card-friend.html
│   ├── card-set.html
│   ├── card-comment.html
│   ├── card-notify.html
│   ├── card-vip.html
│   ├── card-menu.html
│   ├── card-grid.html
│   └── card-button.html
└── images/                    # 示例图片
```

> 图片使用 `icon-image-catch-skill` 抓取的 Picsum/Lorem Picsum，避免占位图。

---

> ⚠️ Demo 案例仅供参考，非完美实现
