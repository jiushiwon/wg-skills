---
name: fastapi-agent-module-skill
description: FastAPI AI Agent 模块。基于 LangGraph 实现对话 Agent，支持 Tool 扩展、模型接入、上下文记忆、多轮对话、限流、审计、Pydantic 参数校验、tenacity 重试。面向已安装 fastapi-init-skill + fastapi-auth-module-skill 的项目。触发词："FastAPI AI Agent"、"LangGraph Agent"、"AI 对话模块"、"FastAPI Tool"、"帮我加一个 AI 对话模块"。
---

# FastAPI Agent Module Skill

为 FastAPI 项目**叠加**一套 AI Agent 能力，基于 LangGraph 框架实现。

## 定位

- 目标：在已有 `fastapi-init-skill` 骨架 + `fastapi-auth-module-skill` 鉴权模块上，添加 AI Agent 对话能力。
- 核心：LangGraph 工作流 + Tool 扩展 + 模型接入 + 上下文记忆 + 安全防护。
- 输出：Agent 核心、Tool 定义、路由、数据库模型、接口契约、测试用例。

## 骨架依赖

> 本模块依赖 `fastapi-init-skill` 骨架 + `fastapi-auth-module-skill` 鉴权模块。

**使用前必须满足：**
1. ✅ 已安装 `fastapi-init-skill`（项目骨架）
2. ✅ 已安装 `fastapi-auth-module-skill`（用户鉴权）
3. ✅ 骨架包含：JWT、统一响应（EnvelopeRoute）、SQLModel、分页、异常处理（BusinessException）

**对接规范（必须遵循）：**
1. ✅ 使用骨架的 `app.config.settings` 配置系统，不单独定义配置
2. ✅ 使用骨架的 `app.response.EnvelopeRoute` 统一响应
3. ✅ 使用骨架的 `app.exceptions.BusinessException` 异常处理
4. ✅ 使用骨架的 `settings.db_prefix` 表前缀
5. ✅ 使用骨架的 `database.get_session` 数据库连接
6. ✅ 使用骨架的 `auth.dependencies.get_current_user` 鉴权
7. ✅ lifespan 中初始化 `AgentContainer`，通过 `app.state.agent` 注入

## 用户问题（最多 3 个）

```
1. 用什么模型？（默认 OpenAI gpt-4o-mini，可选 Claude/Anthropic/本地模型）
2. 需要哪些内置 Tool？（默认：查用户信息、查角色、查菜单、查组织）
3. 是否开启历史消息？（默认开启，保留 20 轮）
```

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **LangGraph Agent** | 基于 LangGraph 的对话 Agent，支持节点扩展 |
| 2 | **Tool 系统** | 声明式 Tool 定义，Pydantic 参数校验，自动权限注入 |
| 3 | **模型接入** | 统一模型接口，支持 OpenAI/Claude，tenacity 退避重试 |
| 4 | **多轮对话** | 支持上下文记忆，会话级别历史，LRU 内存缓冲 |
| 5 | **对话管理** | 创建/查询/删除/清除会话 |
| 6 | **租户隔离** | org_tools 全部按 tenant 过滤，多租户安全 |
| 7 | **流式输出** | SSE 流式返回 token，含断连检测 + 代理缓冲禁用 |
| 8 | **Rate Limiting** | slowapi 实现，每用户 10 次/分钟（防 LLM 财务风险） |
| 9 | **审计日志** | 结构化审计 logger，记录 user/tool/token/失败事件 |
| 10 | **异常脱敏** | 客户端仅收到固定话术，真实异常写入服务端日志 |
| 11 | **数据库索引** | migration 自动创建关键索引（user_id / session_id / created_at） |
| 12 | **事务一致性** | chat() 单事务写入用户/助手消息，无幽灵消息 |
| 13 | **测试基建** | tests/ 目录提供 20+ 安全/一致性/性能测试 |

## 内置 Tools（全部带 current_user_id 强制注入）

| Tool | 功能 | 参数 | 权限 |
|------|------|------|------|
| `get_user_info` | 查询当前用户基本信息（脱敏） | current_user_id（系统注入） | 仅查自己 |
| `get_user_roles` | 查询当前用户角色 | current_user_id（系统注入） | 仅查自己 |
| `get_user_menus` | 查询当前用户菜单 | current_user_id（系统注入） | 仅查自己 |
| `search_users` | 搜索用户（脱敏：ID/用户名/昵称） | keyword?, limit ∈ [1,50] | 限流 |
| `get_org_tree` | 查询当前租户组织架构树 | current_user_id | 租户隔离 |
| `get_org_detail` | 查询当前租户部门详情 | org_id, current_user_id | 租户隔离 |
| `get_post_list` | 查询当前租户岗位（分页） | current_user_id, status?, page?, page_size ∈ [1,50] | 租户隔离 |
| `get_tenant_info` | 查询当前用户所属租户 | current_user_id | 仅查自己 |
| `safe_read_file` | 读取项目内受限文本文件（编程助手） | path, max_size?, current_user_id | 路径白名单 + 大小限制 + UTF-8 + 审计 |
| `safe_write_file` | 写入项目内文件（编程助手） | path, new_content, confirm, current_user_id | diff 预览 + 路径白名单 + 大小限制 + 审计 |

### 文件操作 Tools（编程助手场景标准实现）

`safe_read_file` / `safe_write_file` 是编程助手场景（DeepSeek/Cursor 风格）的**标准安全实现**，提供四重防护：

| 防护维度 | 实现 |
|----------|------|
| **路径白名单** | 仅允许访问 `PROJECT_ROOT` 下的文件，拦截 `/etc` `/root` `~/.ssh` `/var/log` 等敏感目录 |
| **大小限制** | 读默认 100KB、写默认 1MB（可通过参数覆盖） |
| **编码限制** | 仅支持 UTF-8 文本（防二进制崩溃/越权读二进制配置） |
| **审计日志** | 每次读写均记录 user_id / path / size / success |

**写文件流程（必须两步调用）**：
```
1. confirm=False → 返回 diff 预览，不写盘
2. confirm=True  → 二次调用（带相同 path+new_content）才真正落盘
```

**使用前必须配置 PROJECT_ROOT**：
```bash
# 必须设置环境变量，限定文件操作 Tool 的访问范围
export PROJECT_ROOT=/path/to/your/project
# 容器化部署建议：
#   docker run -e PROJECT_ROOT=/app -v $(pwd):/app your-image
# 不设置则默认当前工作目录（开发模式）
```

> ⚠️ **严禁** 把 `PROJECT_ROOT` 设置为 `/`、`/home` 等宽泛目录，否则任何 `path` 都能访问。

## 生成的模块结构

```
src/agent/
├── __init__.py                # 导出核心组件
├── audit.py                   # ✅ 结构化审计日志
├── rate_limiter.py            # ✅ slowapi 限流 + 降级 token bucket
├── schemas.py                 # Pydantic 模型
├── models.py                  # SQLModel（会话/消息）
├── migration.py               # ✅ Alembic 迁移（含 5 个关键索引）
├── database.py                # 数据库适配层（兼容 3 级 import 路径）
├── graph/
│   ├── __init__.py
│   ├── agent.py              # ✅ AgentContainer（DI 容器）+ 加锁懒加载
│   ├── nodes.py              # ✅ Tool 并发执行 + XML 标签隔离 Prompt Injection
│   └── state.py              # Agent State
├── tools/
│   ├── __init__.py
│   ├── base.py               # ✅ Pydantic 校验 + 异常脱敏 + 审计
│   ├── user_tools.py         # ✅ current_user_id 必需参数
│   ├── org_tools.py          # ✅ 多租户隔离
│   ├── file_tools.py         # ✅ 编程助手场景：路径白名单 + diff 预览 + 审计
│   └── registry.py           # 线程安全注册表
├── llm/
│   ├── __init__.py
│   ├── base.py               # LLM 接口
│   ├── openai.py             # ✅ tenacity 重试 + timeout
│   └── anthropic.py          # ✅ tenacity 重试 + timeout
├── memory/
│   ├── __init__.py
│   ├── buffer.py             # 对话记忆（deque 自动裁剪）
│   └── store.py              # ✅ DI 工厂 + LRU + 显式清空
└── routers/
    ├── __init__.py
    ├── chat.py               # ✅ Rate Limit + SSE 断连检测
    ├── session.py            # ✅ Rate Limit + 分页边界 + clear-memory
    └── tools.py              # Tool 管理

tests/                          # ✅ 测试基建
    test_tool_validation.py     # Pydantic / 参数安全
    test_message_security.py     # 注入防护 / 事务 / 限流 / 索引

api-contract-agent.md           # 接口契约（含 SSE Tool 限制说明）
docs/deployment-guide.md       # 多 Worker 部署指南
```

## Agent 工作流

```
用户输入 → Agent State 初始化（user_id 注入）
    ↓
LLM 生成思考 + Tool Call
    ↓
并发执行 Tools（asyncio.gather，user_id 强制注入防越权）
    ↓
Tool 结果用 <tool_result> XML 标签包裹（防 Prompt Injection）
    ↓
LLM 总结 → 流式返回（含断连检测）
    ↓
单事务持久化用户消息 + 助手消息（保证一致性）
```

## 安全特性（v2 - P0 修复后）

### 1. 会话归属校验
- 每个 session_id 操作都校验 `user_id == session.user_id`
- 跨用户访问返回 `-1001`
- 历史消息加载使用 SQL JOIN 同时校验归属

### 2. Tool 权限注入
- LLM 无法通过 `arguments` 篡改 `current_user_id`
- 系统通过 `Tool.execute(user_id=...)` 显式注入
- `current_user_id` 参数必须无默认值（系统自动校验）

### 3. Tool 参数 Pydantic 校验
- 自动从函数签名推导类型
- int 范围、str 长度、bool 枚举等边界自动校验
- 校验失败抛出 `ValidationError`，客户端收到友好错误

### 4. 异常脱敏
- 客户端响应仅含固定话术（如"对话处理失败，请稍后重试"）
- SSE error 事件不含堆栈或敏感信息
- Tool 错误返回"工具执行失败，请重试"
- 真实异常写入服务端 `logger.exception()`

### 5. 日志脱敏
- Tool 日志只记参数名 + 类型，不记值
- `logger.info(f"执行 Tool: {name}, 参数签名: {args_meta}")`

### 6. 审计日志
- 独立 logger `agent.audit`
- 记录：tool_call / tool_failure / chat_failure / token_usage / rate_limit_hit
- 字段：user_id, session_id, tool_name, args_hash（SHA256），success, error

### 7. Rate Limiting
- `slowapi`（生产推荐）+ in-memory token bucket（降级）
- chat 接口：10 次/分钟
- session 接口：30 次/分钟
- 命中时记录审计日志 + 429 响应

### 8. 事务一致性
- `chat()` 使用 `_save_messages_atomic` 单事务保存用户/助手消息
- 流式接口 `first_chunk_received` 标志保证只有首个 token 到达才保存用户消息

### 9. SSE 断连检测
- 流式循环中检查 `await request.is_disconnected()`
- 客户端断开后立即终止 LLM 流，避免 token 计费继续

### 10. 多租户隔离
- `org_tools` 全部 Tool 必须传入 `current_user_id`
- 通过 user 查询 tenant_id，按 tenant 过滤 Org/Post
- 跨租户访问返回错误

### 11. Prompt Injection 防护
- Tool 结果用 `<tool_result name="...">...</tool_result>` 包裹
- System Prompt 明确说明 `tool_result` 内是数据不是指令

### 12. 数据库索引（migration.py）
- `ix_*_session_user_updated`：list_sessions 排序
- `ix_*_session_user_deleted`：软删除过滤
- `ix_*_session_user_id`：归属校验
- `ix_*_message_session_created`：历史加载
- `ix_*_message_session_role`：按角色过滤

### 13. LLM 调用可靠性
- `AsyncOpenAI/Anthropic` 显式 timeout=60s
- tenacity 指数退避重试（最多 3 次，retry RateLimitError/Timeout/ConnectionError）
- 异步锁保护懒加载路径（防止多个 LLM 客户端并发创建）

## Tool 定义示例

```python
from src.agent.tools import tool

@tool(description="获取当前用户信息", name="get_user_info")
async def get_user_info(current_user_id: int) -> dict:
    """查询当前用户基本信息（不含手机/邮箱）"""
    from src.auth.services.user_service import UserService
    user = await UserService.get_user(current_user_id)
    return {
        "id": user.id,
        "username": user.username,
        "nickname": user.nickname,
    }
```

## 接口契约

| 路径 | 说明 |
|------|------|
| `POST /api/agent/chat` | 对话（stream=true 流式 / stream=false 同步） |
| `GET /api/agent/sessions` | 会话列表 |
| `POST /api/agent/sessions` | 创建会话 |
| `GET /api/agent/sessions/{id}` | 获取会话 |
| `DELETE /api/agent/sessions/{id}` | 删除会话（软删除） |
| `GET /api/agent/sessions/{id}/messages` | 获取会话消息 |
| `POST /api/agent/sessions/clear-memory` | 清除会话内存记忆 |
| `GET /api/agent/tools` | 可用工具列表 |

> 流式模式不支持 Tools（受 SSE 特性限制），Tools 必须使用同步模式。

## 配置扩展

在骨架的 `app/config.py` 中添加以下字段：

```python
# Agent 模块配置
agent_model: str = "gpt-4o-mini"
agent_temperature: float = 0.7
agent_max_tokens: int = 2048
agent_memory_turns: int = 20
agent_system_prompt: str | None = None  # 自定义 System Prompt

# LLM API 配置
openai_api_key: str | None = None
openai_base_url: str | None = None
anthropic_api_key: str | None = None
```

## 生成流程

1. 确认已存在 FastAPI 骨架 + Auth 模块。
2. 询问用户模型选择、内置 Tool、记忆轮数。
3. 在骨架的 `app/config.py` 中扩展 Agent 配置字段。
4. 按模板生成 `agent/` 下全部源码（含 audit.py / rate_limiter.py）。
5. 生成 `tests/` 测试文件（覆盖 P0 安全约束）。
6. 生成 `api-contract-agent.md` 与 `docs/deployment-guide.md`。
7. 提示用户安装依赖：`pip install langgraph langchain langchain-openai langchain-anthropic tenacity slowapi` 等。

## 依赖安装

```bash
pip install langgraph langchain langchain-openai langchain-anthropic tenacity slowapi
```

## lifespan 集成示例

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.agent.graph.agent import AgentContainer, init_llm, init_agent_graph
from src.agent.memory.store import MemoryStore

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ✅ 启动：初始化依赖容器
    container = AgentContainer()
    container.init_llm()
    container.init_graph()
    app.state.agent = container
    app.state.memory_store = MemoryStore()
    yield
    # 关闭：清理资源（如 Redis 连接、线程池）

app = FastAPI(lifespan=lifespan)
```

## 红线

1. 不重复生成 FastAPI 骨架和 Auth 模块。
2. 使用骨架的 `EnvelopeRoute` 统一响应，不手动包装 `{ code, message, data }`。
3. 使用骨架的 `BusinessException` 异常处理，不返回原始 dict 错误。
4. 使用骨架的 `settings.db_prefix` 表前缀，不硬编码。
5. 使用骨架的 `settings` 配置系统，不单独定义 `AgentSettings`。
6. Tool 定义使用 `@tool` 装饰器 + `current_user_id` 必需参数。
7. 对话历史默认保留 20 轮，可配置。
8. 流式输出使用 SSE，含代理缓冲禁用头。
9. 所有注释、文档用中文。
10. Tool 不在 `arguments` 中传 `current_user_id`，由系统统一注入。
11. 异常不在客户端返回原始堆栈，必须用 `logger.exception()` + 固定话术。
12. Tool/对话失败必须写审计日志（`audit_logger`）。

## 后续迭代

## v2.1 增强（P1 修复）

#### P1-S2 模型白名单
- `ALLOWED_MODELS = Literal["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "claude-3-haiku-20240307", "claude-3-sonnet-20240229", "claude-3-5-sonnet-20241022"]`
- 客户端无法指定白名单外模型（防财务/审计风险）

#### P1-S4 PII 加密模块
- `src/agent/pii.py` 提供 `pii_encrypt` / `pii_decrypt` / `mask_pii` / `is_pii_field` / `safe_log_args`
- Fernet 对称加密（AES-128-CBC + HMAC-SHA256）
- 通过 `PII_ENCRYPTION_KEY` 环境变量配置密钥
- Tool 日志自动调用 `safe_log_args` 脱敏 PII 字段（password/token/email/phone）

#### P1-S8 配置驱动历史消息 limit
- `_get_session_limit()` 从 `settings.agent_memory_turns` 读取
- 默认 20 轮（limit=40），可配置

#### P1-P7 ToolRegistry 去锁
- 移除 `threading.Lock`（阻塞事件循环）
- 改为模块加载时一次性注册（启动期同步调用）

#### P1-P21 MemoryBuffer 改用 deque
- `collections.deque(maxlen=max_turns*2)` 实现 O(1) 自动裁剪
- 系统消息单独 deque（不受 max_turns 影响）

#### P1-P15 chat 同步总超时
- `asyncio.wait_for(coro, timeout=120)` 包裹 `_chat_inner`
- 超时返回 `ChatErrorCode.TIMEOUT = -5003` + 友好话术

#### P1-P9 response_content 硬截断
- `MAX_RESPONSE_CHARS = 50000`（防内存峰值）
- 流式循环中检查长度并 break

#### P1-P22 list_sessions 单查询
- `func.count().over()` 窗口函数
- items + total 一次往返（替代两次 DB round-trip）

#### P1-U 错误码标准化
- `ChatErrorCode` IntEnum（0/-1/-1001/-1002/-429/-5001/-5002/-5003/-5000）
- SSE 错误事件包含 `error_code` 字段

#### P2-2 / P2-6 兼容性
- `title` 加 `max_length=200`（Pydantic 入参层）
- `datetime.now(UTC)` 替代 deprecated `datetime.utcnow()`

## v2.2 清理（P2 修复）

#### P2-1 会话消息级联清理
- `migration.py` FK 加 `ondelete='CASCADE'`
- `SessionService.delete_session(hard_delete=True)` 支持级联删除 messages
- Router 通过 `?hard=true` query 参数触发
- 避免软删除导致存储膨胀

#### P2-7 依赖版本固定
- 新增 `requirements-agent.txt`
- 锁定最低版本：`openai>=1.40`、`anthropic>=0.34`、`langchain>=0.3`、`tenacity>=8.3`、`slowapi>=0.1.9`、`cryptography>=42.0`
- 防止引入 CVE 版本

#### P2-11 安全响应头
- 新增 `SecurityHeadersMiddleware`
- 默认响应头：`X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、`X-XSS-Protection`、`Referrer-Policy`、`Permissions-Policy`
- 防止点击劫持 + MIME 嗅探 + XSS

#### P2-13 trace_id 关联日志
- 新增 `src/agent/trace.py`
- 使用 `contextvars` 注入 trace_id 到所有日志
- `TraceIdMiddleware` 自动从 `X-Trace-Id` 请求头读取/写入响应头
- 跨服务追踪支持

#### P2-19 / P2-25 死代码清理
- 移除 `agent.py` 中 `"end": "respond"` 死代码映射
- `AgentContainer.init_graph` 幂等保护

## 后续迭代

- 支持 LangChain LCEL 表达式
- 支持 RAG 知识库
- 支持自定义 Agent 节点
- 与 `java-agent-module-skill` 字段对齐
- Langfuse/LangSmith 可观测性集成
- 多 Worker 部署的 Redis MemoryStore 适配器

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**

## 触发关键词

```
FastAPI AI Agent、LangGraph Agent、AI 对话模块、FastAPI Tool、
帮我加一个 AI 对话模块、Agent 模块、LLM 对话、LangChain
```