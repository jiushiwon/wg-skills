# wg-skills —— Claude Code 入口

> 本文件仅作为 Claude Code 的入口标识。
>
> **所有项目级规范、目录结构、开发流程、commit 规范、输出要求均沉淀于 [`AGENTS.md`](AGENTS.md)**。
>
> Claude Code 启动时应将 `AGENTS.md` 作为主控上下文加载，本文件无需展开阅读。

## 加载指令

```
@AGENTS.md
```

## Claude 特定补充

- 触发词以 `SKILL.md` 中 `description` 字段为准，使用时直接读取该文件
- 修改 skill 后同步：根 `README.md` + `AGENTS.md`（如有目录结构变更）
- 输出语言：中文（与 AGENTS.md 第八节"输出要求"一致）