---
name: vibecoding-guide-skill
description: VibeCoding / AI 开发全流程知识导师入口。识别用户目标后分流到 vibecoding-workflow-skill、agent-learning-skill 或 agent-interview-skill。只做推荐，不调用其他 skill。
---

# VibeCoding Guide Skill

本技能是 VibeCoding / AI 开发的知识总入口，不执行具体生成任务，只负责把用户分流到合适的子技能。

## 分流规则

| 用户意图 | 进入子技能 |
|----------|------------|
| 想做项目、选型模型/IDE、写提示词、产品开发全流程 | vibecoding-workflow-skill |
| 想了解 Agent、学习智能体、做 Agent | agent-learning-skill |
| 准备 Agent 工程师面试、入行、包装项目 | agent-interview-skill |
| 意图不明确 | 询问用户目标后分流 |

## 使用方式

```
/vibecoding
我想学 VibeCoding
AI 编程怎么入门
```

## 红线

- 不调用、不包装其他 skill。
- 不替用户执行安装、部署、生成代码。
- 子技能触发词变更后，同步更新本文件 description 与 README.md。
