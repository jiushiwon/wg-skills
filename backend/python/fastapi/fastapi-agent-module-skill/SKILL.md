---
name: fastapi-agent-module-skill
description: FastAPI AI Agent 模块。基于 LangGraph 实现对话 Agent，支持 Tool 扩展、模型接入、上下文记忆、多轮对话。面向已安装 fastapi-init-skill + fastapi-auth-module-skill 的项目。触发词："FastAPI AI Agent"、"LangGraph Agent"、"AI 对话模块"、"FastAPI Tool"、"帮我加一个 AI 对话模块"。
---

# FastAPI Agent Module Skill

为 FastAPI 项目**叠加**一套 AI Agent 能力，基于 LangGraph 框架实现。

## 定位

- 目标：在已有 `fastapi-init-skill` 骨架 + `fastapi-auth-module-skill` 鉴权模块上，添加 AI Agent 对话能力。
- 核心：LangGraph 工作流 + Tool 扩展 + 模型接入 + 上下文记忆。
- 输出：Agent 核心、Tool 定义、路由、数据库模型、接口契约。

## 骨架依赖

> 本模块依赖 `fastapi-init-skill` 骨架 + `fastapi-auth-module-skill` 鉴权模块。

**使用前必须满足：**
1. ✅ 已安装 `fastapi-init-skill`（项目骨架）
2. ✅ 已安装 `fastapi-auth-module-skill`（用户鉴权）
3. ✅ 骨架包含：JWT、统一响应、SQLModel、分页

## 用户问题（最多 3 个）

```
1. 用什么模型？（默认 OpenAI gpt-4o-mini，可选 Claude/Anthropic/本地模型）
2. 需要哪些内置 Tool？（默认：查用户信息、查角色、查菜单）
3. 是否开启历史消息？（默认开启，保留 20 轮）
```

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **LangGraph Agent** | 基于 LangGraph 的对话 Agent，支持节点扩展 |
| 2 | **Tool 系统** | 声明式 Tool 定义，自动参数解析 |
| 3 | **模型接入** | 统一模型接口，支持 OpenAI/Claude/本地模型 |
| 4 | **多轮对话** | 支持上下文记忆，会话级别历史 |
| 5 | **对话管理** | 创建/查询/清除会话 |
| 6 | **用户绑定** | 对话关联 SysUser，权限隔离 |
| 7 | **流式输出** | SSE 流式返回 token |
| 8 | **接口契约** | 生成 `api-contract-agent.md` |

## 内置 Tools

| Tool | 功能 | 依赖模块 |
|------|------|----------|
| `get_user_info` | 查询用户基本信息 | fastapi-auth-module-skill |
| `get_user_roles` | 查询用户角色 | fastapi-auth-module-skill |
| `get_user_menus` | 查询用户菜单权限 | fastapi-auth-module-skill |
| `get_org_tree` | 查询组织架构树 | fastapi-auth-module-skill |
| `search_knowledge` | 知识库检索（预留） | - |

## 生成的模块结构

```
src/agent/
├── __init__.py
├── config.py                  # Agent 配置
├── schemas.py                 # Pydantic 模型
├── models.py                  # SQLModel（会话/消息）
├── graph/
│   ├── __init__.py
│   ├── agent.py              # LangGraph Agent 定义
│   ├── nodes.py              # 节点函数
│   ├── state.py              # Agent State
│   └── edges.py              # 边定义
├── tools/
│   ├── __init__.py
│   ├── base.py               # Tool 基类
│   ├── user_tools.py         # 用户相关 Tool
│   ├── org_tools.py          # 组织架构 Tool
│   └── registry.py           # Tool 注册表
├── llm/
│   ├── __init__.py
│   ├── base.py               # LLM 接口
│   ├── openai.py             # OpenAI 实现
│   └── anthropic.py          # Anthropic 实现
├── memory/
│   ├── __init__.py
│   ├── buffer.py             # 对话记忆
│   └── store.py              # 会话存储
└── routers/
    ├── __init__.py
    ├── chat.py               # 对话路由
    ├── session.py            # 会话管理
    └── tools.py              # Tool 管理

alembic/versions/agent_module.py  # 迁移文件

api-contract-agent.md             # 接口契约
docs/agent-module-guide.md       # 接入指南
```

## Agent 工作流

```
用户输入 → Agent State 初始化
    ↓
LLM 生成思考 + Action
    ↓
Tool Executor 执行 Tool
    ↓
观察结果 → 返回 LLM
    ↓
LLM 生成最终回复 → 流式输出
    ↓
记忆存储（可选）
```

## Tool 定义示例

```python
from src.agent.tools import tool

@tool(description="获取用户信息", name="get_user_info")
def get_user_info(user_id: int = None) -> dict:
    """查询用户基本信息"""
    # 实现逻辑
    return {"id": 1, "username": "admin", "nickname": "管理员"}
```

## 接口契约

| 路径 | 说明 |
|------|------|
| `POST /api/agent/chat` | 流式对话 |
| `POST /api/agent/chat/sync` | 同步对话（非流式） |
| `GET /api/agent/sessions` | 会话列表 |
| `POST /api/agent/sessions` | 创建会话 |
| `DELETE /api/agent/sessions/{id}` | 删除会话 |
| `GET /api/agent/tools` | 可用工具列表 |
| `POST /api/agent/clear-memory` | 清除会话记忆 |

## 生成流程

1. 确认已存在 FastAPI 骨架 + Auth 模块。
2. 询问用户模型选择、内置 Tool、记忆轮数。
3. 按模板生成 `agent/` 下全部源码。
4. 生成 `api-contract-agent.md` 与 `docs/agent-module-guide.md`。
5. 提示用户安装依赖：`pip install langgraph langchain langchain-openai` 等。

## 依赖安装

```bash
pip install langgraph langchain langchain-openai langchain-anthropic
```

## 红线

1. 不重复生成 FastAPI 骨架和 Auth 模块。
2. Tool 定义使用声明式，自动参数解析。
3. 对话历史默认保留 20 轮，可配置。
4. 流式输出使用 SSE。
5. 所有注释、文档用中文。

## 与 java-agent-module-skill 对齐

后续版本将保持接口与字段命名一致，方便前端跨语言复用。

## 后续迭代

- 支持 LangChain LCEL 表达式
- 支持 RAG 知识库
- 支持自定义 Agent 节点
- 与 `java-agent-module-skill` 字段对齐

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**

## 触发关键词

```
FastAPI AI Agent、LangGraph Agent、AI 对话模块、FastAPI Tool、
帮我加一个 AI 对话模块、Agent 模块、LLM 对话、LangChain
```
