# fastapi-agent-module-skill

> 为 FastAPI 项目叠加 AI Agent 对话能力：LangGraph + Tool + 多轮对话 + 上下文记忆。

## 一句话

在已有 `fastapi-init-skill` + `fastapi-auth-module-skill` 的项目上说一句"帮我加一个 AI 对话模块"，即可拿到一套可运行的 LangGraph Agent 代码、Tool 扩展、接口契约。

> **前置条件**：必须先安装 `fastapi-init-skill` 骨架 + `fastapi-auth-module-skill` 鉴权模块

## 适合场景

- 已有项目需要 AI 智能助手
- 需要基于用户权限的智能查询（如查自己信息、角色、菜单）
- 需要多轮对话、上下文记忆
- 需要扩展自定义 Tool

## 不适合场景

- 项目还没有 FastAPI 骨架（请先用 `fastapi-init-skill`）
- 项目还没有权限模块（请先用 `fastapi-auth-module-skill`）
- 需要复杂的工作流编排

## 触发关键词

```
FastAPI AI Agent、LangGraph Agent、AI 对话模块、FastAPI Tool、
帮我加一个 AI 对话模块、Agent 模块、LLM 对话、LangChain
```

## 快速上手

```bash
# 1. 在 Claude Code 中说：
#    "在现有 FastAPI 项目上加一个 AI 对话模块"

# 2. 回答 3 个问题：
#    Q1: 用什么模型？（默认 gpt-4o-mini）
#    Q2: 需要哪些内置 Tool？（默认查用户/角色/菜单）
#    Q3: 是否开启历史消息？（默认开启 20 轮）

# 3. 安装依赖
pip install langgraph langchain langchain-openai

# 4. 执行迁移后重启
alembic upgrade head
uvicorn main:app --reload
```

## 生成内容

```
src/agent/
├── config.py                  # Agent 配置
├── schemas.py                 # Pydantic 模型
├── models.py                  # SQLModel（会话/消息）
├── graph/
│   ├── agent.py              # LangGraph Agent
│   ├── nodes.py              # 节点函数
│   ├── state.py              # Agent State
│   └── edges.py              # 边定义
├── tools/
│   ├── base.py               # Tool 基类
│   ├── user_tools.py         # 用户相关 Tool
│   ├── org_tools.py          # 组织架构 Tool
│   └── registry.py           # Tool 注册表
├── llm/
│   ├── base.py               # LLM 接口
│   ├── openai.py             # OpenAI 实现
│   └── anthropic.py          # Anthropic 实现
├── memory/
│   ├── buffer.py             # 对话记忆
│   └── store.py              # 会话存储
└── routers/
    ├── chat.py               # 对话路由
    ├── session.py            # 会话管理
    └── tools.py              # Tool 管理

alembic/versions/agent_module.py
api-contract-agent.md
docs/agent-module-guide.md
```

## 内置 Tools

| Tool | 功能 |
|------|------|
| `get_user_info` | 查询当前用户信息 |
| `get_user_roles` | 查询用户角色 |
| `get_user_menus` | 查询用户菜单权限 |
| `get_org_tree` | 查询组织架构树 |

## 核心接口

| 路径 | 说明 |
|------|------|
| `POST /api/agent/chat` | 流式对话 |
| `POST /api/agent/chat/sync` | 同步对话 |
| `GET /api/agent/sessions` | 会话列表 |
| `POST /api/agent/sessions` | 创建会话 |
| `DELETE /api/agent/sessions/{id}` | 删除会话 |
| `GET /api/agent/tools` | 可用工具列表 |

## 表清单

| 表名 | 说明 |
|------|------|
| `{prefix}_agent_session` | AI 对话会话 |
| `{prefix}_agent_message` | 消息记录 |

## 与 fastapi-auth-module-skill 集成

1. Agent 自动获取当前登录用户
2. Tool 可以调用 Auth 模块的服务层
3. 用户权限决定 Tool 返回的数据范围

## 与 java-agent-module-skill 对齐

- 接口路径一致：`/api/agent/*`
- 响应结构一致：流式 SSE

## 版本日志

### v1.0.0 (2026-08-24)

- ✅ LangGraph Agent 核心
- ✅ Tool 声明式定义
- ✅ 模型接入（OpenAI/Claude）
- ✅ 多轮对话 + 记忆
- ✅ SSE 流式输出
- ✅ 接口契约

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**
