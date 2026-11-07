# 移动端安全区与键盘审计修复

当“底部按钮在 iPhone 上贴着 Home Indicator”“聊天输入框弹键盘后跳两次”“自定义导航顶到微信胶囊”出现时，这个 Skill 先查责任分散在哪里，再提供经过确认的最小修复。

## 审计范围

| 范围 | 检查内容 | 交付 |
|---|---|---|
| 顶部 | 状态栏、微信胶囊、自绘导航、首屏内容偏移 | 顶部 Variant 与责任表 |
| 底部 | Home Indicator、safe-area、Tab、固定操作栏 | 内容预留与公共封装建议 |
| 键盘 | 自动顶起、键盘高度、输入栏、末项可达性 | 真机验证清单 |
| 修复 | 已确认实现漂移 | 最小 diff，不改业务逻辑 |

## 使用方式

```text
审计 D:/projects/my-miniapp 的微信胶囊、底部安全区和键盘顶起，只生成报告

检查这个 H5 的 fixed 提交栏，重点看 iPhone Home Indicator 与表单键盘遮挡

根据 docs/mobile-safe-area-audit.md 已确认的基线，修复安全区实现漂移
```

## 与其他 Skill 的边界

- 本 Skill：移动端顶部 / 底部 / 键盘的专项审计和确认后修复。
- `frontend-style-harmonizer-skill`：更宽范围的 Token、空间、组件、图标和页面模式一致性。
- `uniapp-*` / `vue-*`：提供最终应复用的主题、容器和组件真源。

## 目录

```text
mobile-safe-area-audit-skill/
├── SKILL.md
├── STANDARD.md
├── README.md
└── references/
    ├── audit-checklist.md
    ├── repair-patterns.md
    └── report-template.md
```

