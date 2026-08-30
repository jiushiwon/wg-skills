---
name: fastapi-ai-chat-module-skill
description: Python FastAPI AI 聊天模块技能。面向已有 FastAPI 项目的开发者，提供 AI 对话、会话管理、上下文记忆、流式输出、Token 统计等能力的快速集成。触发词："AI 聊天"、"对话模块"、"AI 对话"、"fastapi ai chat"、"带记忆的对话"、"会话管理"、"流式输出"。
---

# FastAPI AI Chat Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成 AI 聊天能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **会话管理** | 创建/查询/删除会话 |
| **消息管理** | 发送/接收消息 |
| **上下文记忆** | 会话上下文保存与恢复 |
| **流式输出** | Server-Sent Events 流式响应 |
| **Token 统计** | 消耗统计与限额控制 |
| **多模型支持** | OpenAI/Claude/本地模型 |

## 触发场景

用户说"帮我加 AI 聊天"或"集成 AI 对话"时触发。

## 核心实现

### 依赖配置

```bash
pip install openai anthropic httpx sse-starlette
```

### 配置

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4"
    
    # 会话配置
    chat_max_history: int = 10
    chat_max_tokens: int = 4000

settings = Settings()
```

### 数据模型

```python
# models.py
from sqlalchemy import Column, BigInteger, String, Text, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from database import Base
import enum

class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ChatModel(str, enum.Enum):
    GPT_3_5 = "gpt-3.5-turbo"
    GPT_4 = "gpt-4"
    CLAUDE = "claude-3"

class ChatSession(Base):
    __tablename__ = "wg_chat_session"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)
    title = Column(String(200))
    model = Column(SQLEnum(ChatModel), default=ChatModel.GPT_3_5)
    status = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class ChatMessage(Base):
    __tablename__ = "wg_chat_message"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(BigInteger, nullable=False, index=True)
    role = Column(SQLEnum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
```

### 服务层

```python
# services/chat_service.py
from openai import AsyncOpenAI
from typing import List, Optional
import json

class ChatService:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
    
    async def create_session(self, user_id: str, title: str, model: ChatModel) -> ChatSession:
        session = ChatSession(
            user_id=user_id,
            title=title,
            model=model
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
    
    async def send_message(self, session_id: int, content: str) -> str:
        # 1. 保存用户消息
        user_msg = ChatMessage(
            session_id=session_id,
            role=MessageRole.USER,
            content=content
        )
        db.add(user_msg)
        
        # 2. 构建上下文
        history = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at).all()
        
        messages = [{"role": m.role.value, "content": m.content} for m in history]
        messages.append({"role": "user", "content": content})
        
        # 3. 调用 AI
        response = await self.client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=0.7
        )
        
        answer = response.choices[0].message.content
        
        # 4. 保存 AI 回复
        assistant_msg = ChatMessage(
            session_id=session_id,
            role=MessageRole.ASSISTANT,
            content=answer
        )
        db.add(assistant_msg)
        db.commit()
        
        return answer
    
    async def send_message_stream(self, session_id: int, content: str):
        """流式输出"""
        # 保存用户消息
        # 构建上下文
        # 返回 AsyncGenerator[str]
```

### API 路由

```python
# routers/chat.py
from fastapi import APIRouter, Depends, BackgroundTasks
from sse_starlette import EventSourceResponse
from typing import List

router = APIRouter(prefix="/api/chat", tags=["AI聊天"])

@router.post("/session")
async def create_session(
    user_id: str,
    title: str,
    model: ChatModel = ChatModel.GPT_3_5
):
    session = await chat_service.create_session(user_id, title, model)
    return ApiResponse.ok(session)

@router.post("/message")
async def send_message(session_id: int, content: str):
    answer = await chat_service.send_message(session_id, content)
    return ApiResponse.ok(answer)

@router.get("/stream")
async def send_message_stream(session_id: int, content: str):
    async def generator():
        async for chunk in chat_service.send_message_stream(session_id, content):
            yield {"data": chunk}
    
    return EventSourceResponse(generator())
```

## 不做

- 不负责 AI API Key 配置
- 不处理复杂的对话策略
- 不提供 UI 相关代码
