# 移动端 UI/UX 设计与交付规范

面向 iOS、Android、微信小程序、移动 H5 与鸿蒙的设计交付 Skill。它把“设计稿好看”转成开发可实施、真机可验证的页面规则。

## 能解决什么

| 问题 | 本 Skill 给出的答案 |
| --- | --- |
| 设计稿到底用什么宽度和单位 | 按端选择 `pt/dp/sp/rpx/CSS px/vp/fp`，并说明映射边界 |
| 按钮、图标、正文要多大 | 最小点击区、排版和页面留白的跨端基线 |
| 刘海、底部手势、微信胶囊怎么办 | 明确运行时取值与责任归属，不用固定常量猜 |
| 折叠屏、鸿蒙怎么补 | 单列窗口、折叠态与安全区 Variant |
| 如何交给开发不走样 | 交付说明模板与真机验收清单 |

## 触发示例

```text
按移动端 UI/UX 规范设计一个会员中心，同时给 iOS、Android、小程序、H5 的交付说明
审查这份小程序设计稿的 rpx、胶囊避让、固定底栏和键盘状态
为鸿蒙 ArkUI 补一份 vp/fp、折叠屏与安全区设计 Variant
把这套 H5 页面整理成设计给开发的标注与真机验收清单
```

## 使用方式

1. 先说明目标端、是否自绘导航、是否有固定底栏与输入框。
2. 让 Skill 输出“设计基线 + 页面责任表 + 状态清单 + 验收项”。
3. 生成页面时，继续调用项目已有主题、基础组件与容器 Skill。
4. 项目已有遮挡或键盘问题时，转 `mobile-safe-area-audit-skill` 做只读取证。

## 与现有 Skill 的关系

```text
mobile-uiux-spec-skill
  ├─ 设计与交付基线
  ├─ uniapp-theme/base/style 或 vue-theme/base/style：实际 Token 与组件
  ├─ mobile-safe-area-audit-skill：现有项目的安全区/键盘审计与最小修复
  └─ frontend-style-harmonizer-skill：跨页面一致性审查
```

## 目录

```text
mobile-uiux-spec-skill/
├── SKILL.md
├── STANDARD.md
├── README.md
└── references/
    ├── cross-platform-baseline.md
    ├── harmonyos-uiux.md
    └── delivery-checklist.md
```

## 边界

- 不替代 Apple、Google、微信或华为的官方文档；涉及具体端侧 API 时以当前官方文档和项目运行时结果为准。
- 不直接修改现有业务项目；若需修复，先做审计并经用户确认。
- 不承诺一张设计图适配所有设备；必须列出端、窗口和状态 Variant。
