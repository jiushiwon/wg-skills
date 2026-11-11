# agent-qa 运行证据与记忆审查

> 用可追溯的步骤证据解释已有运行，并核对 memidex 记忆的来源。

## 快速上手（人类视角，3 步以内）

1. 按[仓库快速使用](../../README.md#快速使用)安装技能，保留本目录及 `references/` 结构；目标项目需已有可访问的 agent-qa 运行记录。
2. 给出真实运行 ID，例如：“使用 agent-qa-skill 审查运行 RUN_ID，解释失败步骤和 memidex 记忆来源，只读、不重跑。”
3. 检查报告中的原始判定、证据位置及未知项，再决定后续验证工作。

## 目录结构

```text
agent-qa-skill/
├── SKILL.md
├── STANDARD.md
├── README.md
└── references/
    └── run-review.md
```

## 详细规范 → [SKILL.md](SKILL.md)

边界与审查约束见 [STANDARD.md](STANDARD.md)，读取命令和合成案例见 [run-review.md](references/run-review.md)。本次目录适配只核对公开文档、技能格式、链接及仓库健康检查，未安装或运行 agent-qa；合成案例不是产品性能基准。

本目录是为 wg-skills 编写的使用指南。独立的开源产品 [agent-qa / vostride](https://vostride.com) 使用 FSL-1.1-ALv2，许可证以[上游仓库](https://github.com/vostride/agent-qa)为准，不包含在本指南的 MIT 授权中。
