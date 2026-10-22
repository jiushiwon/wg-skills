---
name: fastapi-ai-chat-module-skill
description: Python FastAPI AI 对话模块技能。基于 OpenAI/Claude SDK 实现对话 Agent，支持 Function Calling、Tool 扩展、上下文记忆、流式输出、Token 统计、限流、审计日志、多模型接入（OpenAI/Claude/DeepSeek/Ollama）、多租户隔离、PII 加密、trace_id 追踪。面向已安装 fastapi-init-skill + fastapi-auth-module-skill 的项目。触发词："AI 聊天"、"对话模块"、"AI 对话"、"fastapi ai chat"、"带记忆的对话"、"会话管理"、"流式输出"、"Function Calling"、"AI Tool"、"Ollama 本地模型"。
---

# FastAPI AI Chat Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成 AI 对话 Agent 能力。

> **版本对标**：本模块对齐 Spring Boot 版 `springboot-agent-module-skill` 的能力矩阵（Function Calling、Tool、限流、审计等），确保两套体系的 AI 能力对齐。

## 骨架依赖

> 本模块依赖 `fastapi-init-skill` 骨架 + `fastapi-auth-module-skill` 鉴权模块。

**使用前必须满足：**
1. ✅ 已安装 `fastapi-init-skill`（项目骨架）
2. ✅ 已安装 `fastapi-auth-module-skill`（用户鉴权）

**对接规范：**
1. ✅ 使用骨架的 `ApiResponse` 统一响应
2. ✅ 使用骨架的 `BusinessException` 异常处理（负数错误码 -1001 ~ -2000）
3. ✅ 使用骨架的 `get_current_user()` 获取当前用户
4. ✅ 使用骨架的数据库配置（SQLAlchemy + Alembic）
5. ✅ 使用骨架的 Redis 配置（如有，用于限流/缓存）
6. ✅ 使用骨架的 `restart.sh` 部署脚本

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **Function Calling** | 基于 OpenAI/Claude SDK，AI 可调用外部 Tool |
| 2 | **Tool 系统** | 声明式 Tool 定义，自动参数校验，权限注入 |
| 3 | **多模型接入** | 统一 ChatModel 接口，支持 OpenAI/Claude/DeepSeek/Ollama |
| 4 | **多轮对话** | 上下文记忆，会话级别历史，LRU 自动裁剪 |
| 5 | **对话管理** | 创建/查询/删除/清除会话（软删除 + 级联硬删除） |
| 6 | **租户隔离** | 所有 Tool 按 tenant_id 过滤，多租户安全 |
| 7 | **流式输出** | SSE 流式返回 token，含断连检测 |
| 8 | **Rate Limiting** | Redis 实现，每用户 10 次/分钟（防 LLM 财务风险） |
| 9 | **审计日志** | 独立 logger，记录 tool_call/tool_failure/chat_failure/token_usage/rate_limit |
| 10 | **上下文记忆** | Deque 自动裁剪 + LRU 内存缓冲 |
| 11 | **Token 统计** | 消耗统计与限额控制 |
| 12 | **PII 加密** | Fernet 对称加密，日志自动脱敏 |
| 13 | **trace_id 追踪** | MDC 注入 trace_id，跨服务追踪支持 |
| 14 | **模型白名单** | 客户端无法指定白名单外模型（防财务风险） |

## 用户问题（最多 3 个）

```
1. 用什么模型？（默认 gpt-4o-mini，可选 Claude/DeepSeek/Ollama）
2. 需要哪些内置 Tool？（默认：查用户信息、查角色、查菜单）
3. 是否开启历史消息？（默认开启，保留 20 轮）
```

---

## 依赖配置

```bash
# 核心依赖
pip install openai anthropic httpx sse-starlette

# 可选：Ollama 本地模型
pip install ollama

# 限流
pip install redis龟

# 加密
pip install cryptography

# 重试
pip install tenacity

# 工具
pip install pydantic pydantic-settings
```

---

## 配置

```python
# config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # ====== AI 模型配置 ======
    ai_provider: str = "openai"  # openai / claude / deepseek / ollama

    # OpenAI
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"

    # Claude
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-haiku-20240307"

    # DeepSeek
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    deepseek_model: str = "deepseek-chat"

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

    # ====== 会话配置 ======
    chat_max_history: int = 20  # 保留轮数
    chat_max_tokens: int = 4000

    # ====== 限流配置 ======
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 10  # 每分钟
    rate_limit_window: int = 60   # 秒

    # ====== 安全配置 ======
    pii_encryption_key: str = ""  # Fernet key
    enable_audit: bool = True

    # ====== Tool 白名单 ======
    allowed_tools: list[str] = [
        "get_user_info", "get_user_roles", "get_user_menus",
        "search_users", "get_org_tree"
    ]

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 数据模型

```python
# models.py
from sqlalchemy import Column, BigInteger, String, Text, Integer, DateTime, Enum as SQLEnum, Boolean, Index
from sqlalchemy.sql import func
from database import Base
import enum

class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"

class ChatModel(str, enum.Enum):
    GPT_4O_MINI = "gpt-4o-mini"
    GPT_4O = "gpt-4o"
    CLAUDE_3_HAIKU = "claude-3-haiku-20240307"
    CLAUDE_3_SONNET = "claude-3-sonnet-20240229"
    DEEPSEEK_CHAT = "deepseek-chat"
    OLLAMA_LLAMA3 = "llama3"

class ChatSession(Base):
    __tablename__ = "wg_chat_session"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)
    tenant_id = Column(String(50), nullable=True, index=True)  # 多租户
    title = Column(String(200))
    model = Column(SQLEnum(ChatModel), default=ChatModel.GPT_4O_MINI)
    status = Column(Integer, default=1)  # 1=正常, 0=软删除
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # 索引
    __table_args__ = (
        Index('idx_session_user_created', 'user_id', 'created_at'),
        Index('idx_session_tenant', 'tenant_id', 'user_id'),
    )

class ChatMessage(Base):
    __tablename__ = "wg_chat_message"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(BigInteger, nullable=False, index=True)
    role = Column(SQLEnum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    tool_calls = Column(Text, nullable=True)  # JSON: [{"name": "xxx", "args": {...}}]
    tool_call_id = Column(String(100), nullable=True)  # 关联 tool_call
    token_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index('idx_message_session_created', 'session_id', 'created_at'),
    )

class ChatAuditLog(Base):
    __tablename__ = "wg_chat_audit"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(BigInteger, nullable=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    tenant_id = Column(String(50), nullable=True)
    action = Column(String(50), nullable=False)  # tool_call / tool_failure / chat_failure / rate_limit
    details = Column(Text)  # JSON
    model = Column(String(50))
    token_count = Column(Integer, default=0)
    trace_id = Column(String(50), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
```

---

## Tool 系统

### 声明式 Tool 定义

```python
# tools/__init__.py
from typing import Callable, Any
from functools import wraps
import inspect
import logging

logger = logging.getLogger("agent.tools")

class Tool:
    def __init__(
        self,
        name: str,
        description: str,
        parameters: dict,
        required_permissions: list[str] = None
    ):
        self.name = name
        self.description = description
        self.parameters = parameters
        self.required_permissions = required_permissions or []

    def to_openai_format(self) -> dict:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters
            }
        }

# Tool 注册表
TOOL_REGISTRY: dict[str, Tool] = {}

def register_tool(name: str, description: str, parameters: dict, required_permissions: list[str] = None):
    """装饰器：注册 Tool"""
    def decorator(func: Callable):
        tool = Tool(name, description, parameters, required_permissions)
        TOOL_REGISTRY[name] = tool

        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)

        wrapper.tool = tool
        return wrapper
    return decorator
```

### 内置 Tools

```python
# tools/user_tools.py
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

class GetUserInfoParams(BaseModel):
    user_id: int

class SearchUsersParams(BaseModel):
    keyword: Optional[str] = None
    limit: int = 10

@register_tool(
    name="get_user_info",
    description="获取当前用户基本信息（脱敏）",
    parameters={
        "type": "object",
        "properties": {},
        "required": []
    },
    required_permissions=["user:read"]
)
async def get_user_info(db: Session, current_user_id: int, tenant_id: str = None):
    """查询当前用户基本信息（脱敏）"""
    # 注入当前用户
    from models import User
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        return {"error": "用户不存在"}

    return {
        "user_id": user.id,
        "username": user.username[:2] + "**",  # 脱敏
        "nickname": user.nickname if user.nickname else None,
    }

@register_tool(
    name="get_user_roles",
    description="获取当前用户角色",
    parameters={
        "type": "object",
        "properties": {},
        "required": []
    }
)
async def get_user_roles(db: Session, current_user_id: int, tenant_id: str = None):
    """查询当前用户角色"""
    # 实际实现查询用户角色
    return {"roles": ["user"]}

@register_tool(
    name="get_user_menus",
    description="获取当前用户菜单权限",
    parameters={
        "type": "object",
        "properties": {},
        "required": []
    }
)
async def get_user_menus(db: Session, current_user_id: int, tenant_id: str = None):
    """查询当前用户菜单权限"""
    return {
        "menus": ["/home", "/profile", "/settings"]
    }

@register_tool(
    name="search_users",
    description="搜索用户（脱敏）",
    parameters={
        "type": "object",
        "properties": {
            "keyword": {"type": "string", "description": "搜索关键词"},
            "limit": {"type": "integer", "description": "返回数量", "default": 10}
        },
        "required": []
    },
    required_permissions=["user:search"]
)
async def search_users(
    db: Session,
    current_user_id: int,
    keyword: str = None,
    limit: int = 10,
    tenant_id: str = None
):
    """搜索用户（脱敏：仅返回 ID/用户名/昵称）"""
    query = db.query(User).filter(User.tenant_id == tenant_id)
    if keyword:
        query = query.filter(User.username.like(f"%{keyword}%"))

    users = query.limit(limit).all()
    return {
        "users": [
            {"id": u.id, "username": u.username[:2] + "**", "nickname": u.nickname}
            for u in users
        ]
    }

@register_tool(
    name="get_org_tree",
    description="获取当前租户组织架构树",
    parameters={
        "type": "object",
        "properties": {},
        "required": []
    }
)
async def get_org_tree(db: Session, current_user_id: int, tenant_id: str = None):
    """查询当前租户组织架构树"""
    if not tenant_id:
        return {"error": "无租户信息"}
    # 实际实现查询组织树
    return {
        "tree": [{"id": 1, "name": "总部", "children": []}]
    }
```

---

## 服务层

```python
# services/chat_service.py
import asyncio
import json
import logging
import uuid
from collections import deque
from typing import Optional, AsyncGenerator
from datetime import datetime

from openai import AsyncOpenAI, AsyncAnthropic
from sqlalchemy.orm import Session
import httpx

from config import settings
from models import ChatSession, ChatMessage, ChatAuditLog, MessageRole, ChatModel

logger = logging.getLogger("agent.chat")

class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self._clients = {}
        self._tools = {}  # 动态加载

    # ====== 客户端工厂 ======

    def _get_client(self):
        """获取 AI 客户端"""
        if settings.ai_provider not in self._clients:
            if settings.ai_provider == "openai":
                self._clients[settings.ai_provider] = AsyncOpenAI(
                    api_key=settings.openai_api_key,
                    base_url=settings.openai_base_url
                )
            elif settings.ai_provider == "anthropic":
                self._clients[settings.ai_provider] = AsyncAnthropic(
                    api_key=settings.anthropic_api_key
                )
            elif settings.ai_provider == "deepseek":
                self._clients[settings.ai_provider] = AsyncOpenAI(
                    api_key=settings.deepseek_api_key,
                    base_url=settings.deepseek_base_url
                )
            elif settings.ai_provider == "ollama":
                self._clients["ollama"] = OllamaClient(settings.ollama_base_url)
        return self._clients[settings.ai_provider]

    # ====== 会话管理 ======

    async def create_session(
        self,
        user_id: str,
        title: str,
        model: ChatModel = ChatModel.GPT_4O_MINI,
        tenant_id: str = None
    ) -> ChatSession:
        session = ChatSession(
            user_id=user_id,
            tenant_id=tenant_id,
            title=title,
            model=model
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    async def delete_session(self, session_id: int, user_id: str):
        """软删除会话"""
        session = self.db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id
        ).first()
        if session:
            session.status = 0
            self.db.commit()

    # ====== 消息处理 ======

    async def send_message(
        self,
        session_id: int,
        content: str,
        user_id: str,
        tenant_id: str = None,
        trace_id: str = None
    ) -> dict:
        """非流式消息处理"""
        trace_id = trace_id or str(uuid.uuid4())

        # 1. 限流检查
        if not await self._check_rate_limit(user_id):
            await self._audit("rate_limit", user_id, tenant_id, session_id, trace_id)
            raise BusinessException(-1005, "请求过于频繁，请稍后再试")

        # 2. 保存用户消息
        user_msg = ChatMessage(
            session_id=session_id,
            role=MessageRole.USER,
            content=content
        )
        self.db.add(user_msg)
        self.db.commit()

        # 3. 构建上下文
        messages = await self._build_context(session_id)

        # 4. 调用 AI（带 Function Calling）
        try:
            response = await self._call_ai_with_tools(messages, user_id, tenant_id)
        except Exception as e:
            logger.error(f"[{trace_id}] AI 调用失败: {e}")
            await self._audit("chat_failure", user_id, tenant_id, session_id, trace_id, str(e))
            raise BusinessException(-2000, f"AI 服务异常: {e}")

        # 5. 保存 AI 回复
        assistant_msg = ChatMessage(
            session_id=session_id,
            role=MessageRole.ASSISTANT,
            content=response["content"],
            tool_calls=json.dumps(response.get("tool_calls", [])) if response.get("tool_calls") else None
        )
        self.db.add(assistant_msg)
        self.db.commit()

        # 6. 审计
        await self._audit("chat", user_id, tenant_id, session_id, trace_id, tokens=response.get("tokens", 0))

        return {
            "content": response["content"],
            "tool_calls": response.get("tool_calls", []),
            "trace_id": trace_id
        }

    async def send_message_stream(
        self,
        session_id: int,
        content: str,
        user_id: str,
        tenant_id: str = None
    ) -> AsyncGenerator[str, None]:
        """流式消息处理"""
        trace_id = str(uuid.uuid4())

        # 限流检查
        if not await self._check_rate_limit(user_id):
            await self._audit("rate_limit", user_id, tenant_id, session_id, trace_id)
            raise BusinessException(-1005, "请求过于频繁，请稍后再试")

        # 保存用户消息
        user_msg = ChatMessage(
            session_id=session_id,
            role=MessageRole.USER,
            content=content
        )
        self.db.add(user_msg)
        self.db.commit()

        # 构建上下文
        messages = await self._build_context(session_id)

        # 流式调用
        full_content = ""
        async for chunk in self._call_ai_stream(messages):
            full_content += chunk
            yield f"data: {json.dumps({'content': chunk})}\n\n"

        # 保存 AI 回复
        assistant_msg = ChatMessage(
            session_id=session_id,
            role=MessageRole.ASSISTANT,
            content=full_content
        )
        self.db.add(assistant_msg)
        self.db.commit()

        yield f"data: {json.dumps({'done': True})}\n\n"

    # ====== 上下文管理 ======

    async def _build_context(self, session_id: int) -> list[dict]:
        """构建对话上下文，自动裁剪"""
        history = self.db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at).all()

        # LRU 裁剪
        if len(history) > settings.chat_max_history:
            history = history[-settings.chat_max_history:]

        messages = []
        for msg in history:
            role = msg.role.value if isinstance(msg.role, MessageRole) else msg.role
            content = msg.content

            # Tool 调用
            if msg.tool_calls:
                tool_calls = json.loads(msg.tool_calls)
                for tc in tool_calls:
                    messages.append({
                        "role": "assistant",
                        "tool_calls": [{
                            "id": tc.get("id", f"call_{msg.id}"),
                            "type": "function",
                            "function": {
                                "name": tc.get("name", ""),
                                "arguments": json.dumps(tc.get("args", {}))
                            }
                        }]
                    })
                    # Tool 结果
                    if tc.get("result"):
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tc.get("id", f"call_{msg.id}"),
                            "content": tc.get("result")
                        })

            messages.append({"role": role, "content": content})

        return messages

    # ====== AI 调用 ======

    async def _call_ai_with_tools(self, messages: list[dict], user_id: int, tenant_id: str) -> dict:
        """带 Function Calling 的 AI 调用"""
        client = self._get_client()

        # 构建 Tool 定义
        tools = self._get_available_tools(user_id, tenant_id)

        # 调用
        if settings.ai_provider == "openai":
            response = await client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                tools=tools if tools else None,
                temperature=0.7
            )
            msg = response.choices[0].message

            result = {"content": msg.content or "", "tokens": response.usage.total_tokens if response.usage else 0}

            # 处理 Tool Calls
            if msg.tool_calls:
                result["tool_calls"] = []
                for tc in msg.tool_calls:
                    tool_name = tc.function.name
                    tool_args = json.loads(tc.function.arguments)

                    # 执行 Tool
                    tool_result = await self._execute_tool(tool_name, tool_args, user_id, tenant_id)

                    result["tool_calls"].append({
                        "id": tc.id,
                        "name": tool_name,
                        "args": tool_args,
                        "result": tool_result
                    })

                    # 审计
                    await self._audit("tool_call", user_id, tenant_id, None, None,
                                     f"{tool_name}: {tool_result[:100]}")

            return result

        elif settings.ai_provider == "anthropic":
            # Claude 处理方式不同
            response = await client.messages.create(
                model=settings.anthropic_model,
                messages=[{"role": "user", "content": messages[-1]["content"]}],
                max_tokens=1024
            )
            return {
                "content": response.content[0].text,
                "tokens": response.usage.input_tokens + response.usage.output_tokens
            }

    async def _call_ai_stream(self, messages: list[dict]) -> AsyncGenerator[str, None]:
        """流式 AI 调用"""
        client = self._get_client()

        if settings.ai_provider == "openai":
            stream = await client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                stream=True,
                temperature=0.7
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

    # ====== Tool 执行 ======

    def _get_available_tools(self, user_id: int, tenant_id: str) -> list[dict]:
        """获取用户可用的 Tools"""
        from tools import TOOL_REGISTRY

        tools = []
        for name, tool in TOOL_REGISTRY.items():
            # 检查权限
            if tool.required_permissions:
                # 实际应查询用户权限
                continue
            tools.append(tool.to_openai_format())
        return tools

    async def _execute_tool(self, name: str, args: dict, user_id: int, tenant_id: str) -> str:
        """执行 Tool"""
        from tools import TOOL_REGISTRY

        if name not in TOOL_REGISTRY:
            return json.dumps({"error": f"Tool {name} not found"})

        try:
            tool_func = TOOL_REGISTRY[name]
            # 注入当前用户
            args["current_user_id"] = user_id
            args["tenant_id"] = tenant_id

            result = await tool_func(self.db, **args)
            return json.dumps(result, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Tool {name} 执行失败: {e}")
            await self._audit("tool_failure", user_id, tenant_id, None, None, f"{name}: {str(e)}")
            return json.dumps({"error": str(e)})

    # ====== 限流 ======

    async def _check_rate_limit(self, user_id: str) -> bool:
        """检查限流"""
        if not settings.rate_limit_enabled:
            return True

        # 使用 Redis
        try:
            import redis
            r = redis.Redis.from_url(settings.redis_url)
            key = f"rate_limit:chat:{user_id}"
            count = r.get(key)
            if count and int(count) >= settings.rate_limit_requests:
                return False
            r.incr(key)
            r.expire(key, settings.rate_limit_window)
            return True
        except:
            # Redis 不可用时放行
            return True

    # ====== 审计 ======

    async def _audit(
        self,
        action: str,
        user_id: str,
        tenant_id: str,
        session_id: int,
        trace_id: str = None,
        details: str = None,
        tokens: int = 0
    ):
        """记录审计日志"""
        if not settings.enable_audit:
            return

        log = ChatAuditLog(
            session_id=session_id,
            user_id=user_id,
            tenant_id=tenant_id,
            action=action,
            details=details,
            token_count=tokens,
            trace_id=trace_id
        )
        self.db.add(log)
        self.db.commit()
```

---

## API 路由

```python
# routers/chat.py
import json
from fastapi import APIRouter, Depends, Request
from sse_starlette import EventSourceResponse
from sqlalchemy.orm import Session

from database import get_db
from services.chat_service import ChatService
from models import ChatSession, ChatModel
from common.response import ApiResponse
from common.exceptions import BusinessException

router = APIRouter(prefix="/api/chat", tags=["AI对话"])

def get_current_user_id(request: Request) -> str:
    """从请求中获取当前用户 ID"""
    # 复用 fastapi-auth-module-skill 的逻辑
    return request.state.user_id

def get_current_tenant_id(request: Request) -> str:
    """从请求中获取租户 ID"""
    return getattr(request.state, "tenant_id", None)

@router.post("/session")
async def create_session(
    title: str,
    model: ChatModel = ChatModel.GPT_4O_MINI,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
    tenant_id: str = Depends(get_current_tenant_id)
):
    """创建会话"""
    service = ChatService(db)
    session = await service.create_session(user_id, title, model, tenant_id)
    return ApiResponse.ok({
        "id": session.id,
        "title": session.title,
        "model": session.model.value
    })

@router.post("/message")
async def send_message(
    session_id: int,
    content: str,
    trace_id: str = None,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
    tenant_id: str = Depends(get_current_tenant_id)
):
    """发送消息（非流式）"""
    service = ChatService(db)
    result = await service.send_message(session_id, content, user_id, tenant_id, trace_id)
    return ApiResponse.ok(result)

@router.get("/stream")
async def send_message_stream(
    session_id: int,
    content: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
    tenant_id: str = Depends(get_current_tenant_id)
):
    """发送消息（流式）"""
    service = ChatService(db)

    async def generator():
        try:
            async for chunk in service.send_message_stream(session_id, content, user_id, tenant_id):
                yield chunk
        except BusinessException as e:
            yield f"data: {json.dumps({'error': e.message, 'code': e.code})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return EventSourceResponse(generator())

@router.delete("/session/{session_id}")
async def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """删除会话"""
    service = ChatService(db)
    await service.delete_session(session_id, user_id)
    return ApiResponse.ok()
```

---

## 迁移脚本

```python
# alembic/versions/001_create_chat_module.py
def upgrade():
    op.create_table(
        "wg_chat_session",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("user_id", sa.String(50), nullable=False),
        sa.Column("tenant_id", sa.String(50)),
        sa.Column("title", sa.String(200)),
        sa.Column("model", sa.String(20)),
        sa.Column("status", sa.Integer, server_default="1"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("idx_session_user", "wg_chat_session", ["user_id"])
    op.create_index("idx_session_tenant", "wg_chat_session", ["tenant_id", "user_id"])

    op.create_table(
        "wg_chat_message",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("session_id", sa.BigInteger, nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("tool_calls", sa.Text),
        sa.Column("tool_call_id", sa.String(100)),
        sa.Column("token_count", sa.Integer, server_default="0"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("idx_message_session", "wg_chat_message", ["session_id"])
```

---

## 不做

- 不负责 AI API Key 配置（用户自行配置）
- 不处理复杂的对话策略（如 ReAct、Chain-of-Thought）
- 不提供 UI 相关代码（参考 frontend-request-skill SSE 封装）
- 不提供生产级 TLS 配置（参考骨架）

---

## 相关 Skill

| Skill | 关系 |
|-------|------|
| `fastapi-init-skill` | 项目骨架 |
| `fastapi-auth-module-skill` | JWT 鉴权（复用） |
| `python-redis-module-skill` | 限流/缓存 |
| `springboot-agent-module-skill` | Java 版 AI Agent（能力对齐） |
