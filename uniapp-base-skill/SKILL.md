---
name: uniapp-base-skill
description: uni-app 页面组件技能套件。包含卡片组件、表单组件、页面模板三个子技能。
trigger: |
  # 子技能入口
  做一个卡片组件 | 做一个表单组件 | 做一个页面模板
  卡片组件 | 表单组件 | 页面模板
  # 快捷跳转
  uniapp-card-skill | uniapp-form-skill | uniapp-page-skill
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
├── base-card.md           # 核心：基础卡片（所有组件的基石）
├── base-input.md          # 核心：通用输入框（表单基础组件）
├── uniapp-card-skill/     # 子技能：卡片组件
├── uniapp-form-skill/     # 子技能：表单组件
└── uniapp-page-skill/     # 子技能：页面模板
```

## 版本历史

### v2.0.0 (2026-08-23)

**重构**

- 拆分为 3 个子技能：uniapp-card-skill、uniapp-form-skill、uniapp-page-skill
- 父技能作为入口，引用子技能

---

> 详细文档请查看各子技能的 SKILL.md
