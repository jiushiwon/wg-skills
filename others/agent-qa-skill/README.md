# agent-qa 应用回归与证据审查

> 用可追溯的运行证据完成应用验收，并检查 agent-qa 的 memidex 记忆如何影响结果。

## 适合场景 / 不适合场景

适合已经使用 agent-qa、需要验收一次改动或解释一条失败记录的项目。不适合替代单元测试、抓取任意网页或在未配置的环境中声称完成回归。

## 快速上手（人类视角，3 步以内）

1. 按[仓库快速使用](../../README.md#快速使用)安装技能，保留本目录的四个文档及 `references/` 结构。目标项目按 [agent-qa 快速开始](https://vostride.com/docs/agent-qa/quickstart)完成配置，并使用项目锁定的版本。
2. 给出明确任务，例如：“使用 agent-qa-skill 审查运行 RUN_ID，解释失败原因和 memidex 记忆来源，只读、不重跑。”或：“对已授权的本地测试应用运行 `tests/selected.test.yaml`，报告运行证据和未覆盖范围。”将占位值替换为实际值。
3. 检查报告中的运行 ID、原始判定和证据位置；无法执行时先解决列出的前提缺口，再决定下一步。

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

边界和审查要求见 [STANDARD.md](STANDARD.md)，命令及合成案例见 [run-review.md](references/run-review.md)。

## 验证范围

本次新增核对了 agent-qa 0.2.3 的 CLI 参数、技能格式、目录链接及仓库健康检查；未执行真实应用或模型回归。参考案例为合成输入，不是产品性能基准。

本目录是为 wg-skills 编写的使用指南；agent-qa 是独立工具，其许可证与版本以[上游仓库](https://github.com/vostride/agent-qa)为准。
