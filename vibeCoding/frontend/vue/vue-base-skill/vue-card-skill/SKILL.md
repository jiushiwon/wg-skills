---
name: vue-card-skill
description: Vue 卡片组件技能。基于「一切皆容器」思想，核心是 base-card 基础卡片（根容器）。所有其他组件、表单、表格都必须嵌入 base-card。
trigger: |
  # 基础容器
  帮我做一个卡片 | 做一个基础卡片 | 做一个图片卡片 | 做一个列表卡片
  做一个设置卡片 | 做一个菜单卡片 | 做一个商品卡片
  做一个个人中心卡片 | 做一个 VIP 卡片 | 做一个通知卡片 | 做一个评论卡片
  做一个功能网格卡片 | 做一个好友卡片
  # 容器原则
  所有组件都要 base-card 包裹 | base-card 是根容器
---

# vue-card-skill

> 基于「一切皆容器」思想的 Vue 卡片组件技能。

## 核心组件

| 组件 | 说明 |
|------|------|
| **base-card** | 基础卡片（根容器） |

## 卡片布局

### 分类一：base-card-layout（基础容器）

| 案例 | 风格 | 触发词 |
|------|------|--------|
| card-basic | 标题 + 描述 + 标签 + 操作 | 基础卡片 |
| card-product | 图片 + 名称 + 描述 + 价格 + 按钮 | 商品卡片 |
| card-profile | 封面 + 头像 + 昵称 + 统计 | 个人中心卡片 |
| card-friend | 头像 + 昵称 + 签名 + 箭头 | 好友卡片 |
| card-set | 图标 + 标签 + 开关/箭头 | 设置卡片 |
| card-vip | 深色渐变 + 头像 + 等级 + 权益 | VIP卡片 |
| card-menu | 九宫格图标 + 标签 | 菜单卡片 |
| card-grid | 每行 N 列图标网格 | 网格卡片 |

### 分类二：信息流卡片

| 案例 | 风格 | 触发词 |
|------|------|--------|
| card-image | 大图 + 标题 + 描述 + 底部 | 图片卡片 |
| card-notify | 图标 + 标题 + 描述 + 时间 + 徽标 | 通知卡片 |
| card-comment | 头像 + 昵称 + 时间 + 内容 + 点赞 | 评论卡片 |

## 文件结构

```
vue-card-skill/
├── SKILL.md
├── README.md
├── base-card.md                         # 根容器规格
└── demo-components/
    └── base-card-layout/                # 卡片布局 demo
        ├── README.md
        ├── 01-basic.html
        ├── 02-header-footer.html
        └── 03-padding.html
```

## 容器原则（铁律）

> **所有涉及内容容器的组件，都必须使用 base-card 作为容器**

- 业务内容 → base-card 包裹
- 按钮容器 → base-card 包裹
- 表格区域 → base-card 包裹（[vue-table-skill](../vue-table-skill/)）
- 列表项 → base-card 承载每行内容
- 页面区块 → base-card 作为卡片容器

**即：base-card 是 vue-base-skill 所有子技能的容器基底。**

## 设计 Token

统一引用 [vue-theme-skill](../../vue-theme-skill/)：

```css
.base-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  padding: var(--space-5);
}
```

**禁止硬编码任何颜色 / 间距 / 圆角 / 阴影值。**

## 第三方组件库

❌ 禁止 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue。