# uniapp 常用组件化页面 Skill

> 把最高频的页面（Tab+列表、聊天、朋友圈、商品详情、我的、图片卡片）做成可复用组件，复制进项目、往 slot 填内容即可用。以空卡片 `base-card` 为托底组件，自动接入 `uniapp-theme-skill` 主题系统（CSS 变量、动态颜色尺寸、禁止写死）。

## 功能

- **6 类组件化页面**：Tab+列表页、聊天页、朋友圈页、商品详情页、我的页面、图片卡片
- **空卡片托底组件** `base-card`：统一圆角/内边距/背景/描边/阴影，其余页面组件入参都包含它的入参（`cardProps` 透传）
- **高度自由化**：每个页面组件核心内容都由 slot 决定，内置默认参数/默认数据，可直接跑通再替换成真实数据
- **主题系统绑定**：默认使用 `uniapp-theme-skill` 的 CSS 变量（颜色/尺寸/圆角动态跟随主题换肤），禁止写死；项目无主题系统时按 fallback 表硬编码
- **规范合规**：遵循 `uniapp-style-skill` 红线（scoped、TS Props、图片兜底、可点击区 ≥ 88rpx、禁用第三方组件库）与 `uniapp-standard-skill` 规范（命名、目录、组件通信）
- **可组合**：与 `uniapp-standard-skill`（规范）→ `uniapp-theme-skill`（主题）→ `uniapp-style-skill`（视觉）→ 本技能（页面）→ `uniapp-request-skill`（数据）→ `uniapp-code-audit-skill`（审计）形成完整链路

## 使用方式

触发词：

```
组件化页面
帮我做个聊天页 / 朋友圈 / 商品详情页 / 我的页面
订单列表页，底部是卡片
做一个 Tab+列表的页面
图片卡片组件 / 空卡片组件 / BaseCard
把页面做成组件，我能自己填内容
```

工作流程：确认要生成的页面 → 检测目标项目主题系统 → 复制 `components/` 下组件到项目 `src/components/` → easycom 注册 → 按 `references/page-specs.md` 生成页面示例 → 用户替换数据。

## 组件清单

| 组件 | 标签 | 用途 |
|------|------|------|
| `base-card` | `<base-card>` | 空卡片托底组件（圆角/内边距/背景/描边/阴影，slot 自由填充） |
| `tab-list-page` | `<tab-list-page>` | Tab 吸顶 + 卡片列表（我的订单/消息中心/商品列表） |
| `chat-page` | `<chat-page>` | 微信风格聊天（底部输入栏 + 左右气泡，自己的消息主题色高亮） |
| `moments-page` | `<moments-page>` | 微信风格朋友圈（封面头图 + 动态 + 点赞评论） |
| `product-detail-page` | `<product-detail-page>` | 商品详情（导航 + 头图 + 信息卡 + 多卡片 sections + 底部操作栏） |
| `profile-page` | `<profile-page>` | 我的/设置/通知/购物车（信息头 + 分组列表 + 右箭头/角标/左图） |
| `image-card` | `<image-card>` | 图片卡片（顶部图 + 标题 + 描述 + 标签） |

## 示例

```vue
<!-- 我的订单页：Tab + 卡片列表 -->
<template>
  <view class="page">
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
├── SKILL.md                    # 技能定义：触发词、工作流、主题绑定、红线
├── README.md                   # 本文件
├── components/                 # 组件模板（复制到项目 src/components/ 即可用）
│   ├── base-card/base-card.vue
│   ├── image-card/image-card.vue
│   ├── tab-list-page/tab-list-page.vue
│   ├── chat-page/chat-page.vue
│   ├── moments-page/moments-page.vue
│   ├── product-detail-page/product-detail-page.vue
│   └── profile-page/profile-page.vue
└── references/
    ├── page-specs.md           # 各页面组件 API + 默认数据 + 完整页面示例
    └── theme-integration.md    # 主题变量清单 + 无主题系统 fallback 表 + easycom 注册
```

## 依赖与组合链路

| 阶段 | Skill | 关系 |
|------|-------|------|
| 前置规范 | [uniapp-standard-skill](../uniapp-standard-skill/) | 通用红线、目录/命名/组件通信规范 |
| 前置依赖 | [uniapp-theme-skill](../uniapp-theme-skill/) | 主题系统（CSS 变量），项目无主题系统时需先初始化或按 fallback 表硬编码 |
| 必循规范 | [uniapp-style-skill](../uniapp-style-skill/) | 设计系统与组件规范（红线约束） |
| 上游骨架 | [uniapp-app-generate-skill](../uniapp-app-generate-skill/) | 项目骨架 + 原子组件（AppButton/AppTab/...），页面组件内部基础 UI 可用其替换 |
| 数据层 | [uniapp-request-skill](../uniapp-request-skill/) | 分页/发送/点赞等副作用由页面层走 request 封装，组件只展示 + emit |
| 后置体检 | [uniapp-code-audit-skill](../uniapp-code-audit-skill/) | 上线前全维度审计 |

完整链路：骨架（app-generate）→ 规范（standard）→ 主题（theme）→ 视觉（style）→ 页面（本技能）→ 数据（request）→ 审计（code-audit）。详见 `SKILL.md`「组合工作流」。
