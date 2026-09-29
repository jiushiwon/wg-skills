# Claude Code Skill 编写指南

一句话：手把手教你写 Claude Code Skill。

## Skill 结构

```
skill-name/
├── SKILL.md        # 技能定义（必须）
├── README.md       # 使用说明
└── references/     # 参考资料
```

## SKILL.md 模板

```markdown
---
name: skill-name
description: 一句话描述技能用途
---

# Skill 名称

## 功能
- 功能点1
- 功能点2

## 使用方式
/skill-name
[使用示例]
```

## 触发词设置

- 英文 kebab-case（如 `my-new-skill`）
- 中文关键词（如 `帮我写测试`）

## 最佳实践

- 单一职责：一个 Skill 只做一件事
- 防御性：处理边界情况
- 不调用其他 Skill，只做推荐
- 保持简洁，避免冗长
