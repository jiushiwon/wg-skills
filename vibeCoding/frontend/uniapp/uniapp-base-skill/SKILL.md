---
name: uniapp-base-skill
description: uni-app 页面组件技能套件。包含卡片组件、表单组件、页面模板三个子技能。
trigger: |
  # 卡片组件
  做一个卡片 | 做一个基础卡片 | 做一个好友卡片 | 做一个设置卡片
  做一个菜单卡片 | 做一个商品卡片 | 做一个VIP卡片 | 做一个评论卡片 | 做一个通知卡片
  做一个功能网格卡片 | 做一个图片卡片
  # 按钮组件
  做一个按钮 | 主色实心按钮 | 主色描边按钮 | 幽灵按钮 | 胶囊按钮 | 渐变按钮
  # 固定底部按钮
  做一个固定底部按钮 | 做一个底部悬浮按钮
  # 输入框
  做一个输入框 | 做一个账号输入框 | 做一个密码输入框 | 做一个手机号输入框
  做一个验证码输入框 | 做一个多行文本输入框 | 做一个浮动标签输入框
  # 搜索栏
  做一个搜索栏 | 做一个胶囊搜索栏
  # 开关组件
  做一个开关 | 做一个胶囊开关
  # 单选组件
  做一个单选 | 做一个圆圈单选 | 做一个标签单选
  # 下拉选择
  做一个下拉选择 | 做一个弹出面板选择
  # 弹窗
  做一个弹窗 | 做一个底部弹窗
  # 完整页面
  做一个聊天页面 | 做一个商品详情页 | 做一个个人中心页
  # 列表页
  做一个好友列表 | 做一个关注列表 | 做一个获赞与收藏列表
  做一个设置列表 | 做一个订单列表 | 做一个积分中心
  # 详情页
  做一个商品详情页 | 做一个活动详情页 | 做一个帖子详情页
  做一个钱包详情页 | 做一个结果页
  # 搜索页
  做一个搜索页 | 做一个搜索结果页 | 做一个搜索无结果页
  # 登录页
  做一个登录页 | 做一个手机号登录页 | 做一个微信登录页
  做一个极简登录页 | 做一个渐变登录页 | 做一个主题图登录页
  # TabBar
  做一个自定义 TabBar | 做一个凸起 TabBar | 做一个毛玻璃 TabBar
  # 子技能入口
  做一个卡片组件 | 做一个表单组件 | 做一个页面模板
---

# uniapp-base-skill

> uni-app 页面组件技能套件。

本技能包含三个子技能：

## 子技能

| 子技能 | 说明 | 入口 |
|--------|------|------|
| uniapp-card-skill | 卡片组件（base-card、按钮、卡片布局） | [SKILL.md](uniapp-card-skill/SKILL.md) |
| uniapp-form-skill | 表单组件（input/switch/radio/select/popup） | [SKILL.md](uniapp-form-skill/SKILL.md) |
| uniapp-page-skill | 页面模板（列表页、详情页、登录页、TabBar） | [SKILL.md](uniapp-page-skill/SKILL.md) |

## 使用方式

```markdown
# 使用子技能
/uniapp-card-skill 做一个卡片
/uniapp-form-skill 做一个输入框
/uniapp-page-skill 做一个商品详情页
```

## 文件结构

```
uniapp-base-skill/          # 父技能入口
├── SKILL.md               # 本文件
├── README.md              # 用户文档
├── base-card.md           # 根容器：基础卡片（所有组件的基石）
├── base-input.md          # 根容器：通用输入框（表单基础组件）
├── base-popup.md          # 根容器：弹窗/抽屉（内置 base-card）
├── demo-components/       # 根级组件的 demo
│   ├── shared/base-preview.css  # 共享预览样式（手机壳容器）
│   └── base-popup/html/         # 4 方向弹窗 demo
├── uniapp-card-skill/     # 子技能：卡片组件
├── uniapp-form-skill/     # 子技能：表单组件
└── uniapp-page-skill/     # 子技能：页面模板
```

## 设计规范

### 组件层级

```
┌─────────────────────────────────────────┐
│  根容器（最小单位）                      │
│  base-card / base-input / base-popup    │
└─────────────────────────────────────────┘
           ↑              ↑              ↑
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ 卡片组件  │  │  表单组件  │  │ 弹窗组件  │
    │ (card)   │  │  (form)   │  │ (popup)  │
    └──────────┘  └──────────┘  └──────────┘
           ↑              ↑              ↑
    ┌─────────────────────────────────────┐
    │         页面模板 (page)              │
    │   列表页 / 详情页 / 登录页 / TabBar │
    └─────────────────────────────────────┘
```

### 依赖关系

| 组件类型 | 依赖 | 说明 |
|----------|------|------|
| 根容器 | 无 | base-card / base-input / base-popup 为最小单位 |
| 表单组件 | 根容器 | switch/radio/select 依赖 base-input |
| 卡片组件 | 根容器 | 卡片布局依赖 base-card |
| 弹窗组件 | 根容器 | **base-popup 内置 base-card**（自动遵守容器原则） |
| 页面模板 | card + form + popup | 组合使用 |

### 组件放置规则

1. **根容器** → 放在 `uniapp-base-skill/` 根目录
   - base-card / base-input / **base-popup**
2. **表单组件** (input/switch/radio/select) → 放在 `uniapp-form-skill/`
3. **卡片组件** → 放在 `uniapp-card-skill/`
4. **页面模板** → 放在 `uniapp-page-skill/`

### 容器原则

> **所有涉及内容容器的组件，都必须使用根容器作为容器**

- 输入框容器 → base-card 包裹 input
- 开关容器 → base-card 包裹 switch
- 单选容器 → base-card 包裹 radio
- **弹窗容器 → base-popup（内置 base-card）**
- 选择器面板 → base-popup + base-select 组合
- 列表项 → base-card 承载每行内容
- 页面区块 → base-card 作为卡片容器

**即：base-card 是所有组件的容器基底。**

## 版本历史

### v2.0.0 (2026-08-23)

**重构**

- 拆分为 3 个子技能：uniapp-card-skill、uniapp-form-skill、uniapp-page-skill
- 父技能作为入口，引用子技能

---

> 详细文档请查看各子技能的 SKILL.md
