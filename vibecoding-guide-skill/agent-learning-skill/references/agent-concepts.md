# Agent 核心概念

一句话：理解 Agent 与传统编程的区别。

## 什么是 Agent

**Agent = LLM + 工具 + 记忆 + 规划能力**

与单纯调用 LLM API 的区别：
- Agent 能自主决策下一步做什么
- Agent 能使用工具（搜索、代码执行、文件操作）
- Agent 有长期记忆（上下文、会话管理）

## Agent 架构

```
┌─────────────┐
│    LLM      │ ← 大脑
└─────────────┘
      ↑
 ┌────┼────┐
 │ 工具  │ 记忆 │ 规划
 └────┴────┘
```

## 核心组件

| 组件 | 作用 | 示例 |
|------|------|------|
| Planning | 任务拆解、反思 | ReAct、CoT |
| Tools | 扩展能力 | 搜索、执行代码 |
| Memory | 上下文保持 | 向量数据库、缓存 |
| Profile | Agent 人设 | System Prompt |

## 学习路线

1. 理解 LLM API 调用
2. 学习 Prompt Engineering
3. 理解 Tool Calling 机制
4. 实现最小 Agent（ReAct 模式）
5. 添加 Memory 组件
6. 学习多 Agent 协作
