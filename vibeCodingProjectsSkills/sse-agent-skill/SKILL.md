---
name: sse-agent-skill
description: SSE AI 对话 Agent 技能。组合前端（vue-base-skill）+ 后端（fastapi-init/springboot-init/go-gin-init）+ 数据库（database-design-skill）+ 鉴权（auth-module-skill），一键生成 SSE 流式输出的 AI 对话系统。不使用任何第三方 SDK，全部基于 wg-skills 技能矩阵。触发词："SSE 对话"、"AI 聊天"、"流式输出"、"ChatGPT 克隆"、"SSE chat"、"AI agent demo"。
---

# SSE Agent Skill

**项目级技能**：组合现有技能矩阵，一键生成 SSE 流式输出的 AI 对话系统。

## 核心理念

> **不使用任何第三方 SDK（openai / anthropic / sse-starlette 等），全部基于 wg-skills 技能矩阵。**

本技能是一个**编排器**，负责协调前端、后端、数据库、鉴权等技能，一次性生成完整的 AI 对话系统。

## 技能矩阵

### 前端层

| 技能 | 用途 | 生成内容 |
|------|------|----------|
| `vue-base-skill` | 基础组件 | 按钮、卡片、输入框、滚动容器 |
| `vue-form-skill` | 表单组件 | 消息输入框、快捷指令 |
| `vue-theme-skill` | 主题系统 | 暗黑模式、聊天主题 |
| `frontend-request-skill` | 请求层 | SSE 连接封装、错误处理 |

### 后端层（按语言选择）

| 语言 | 技能组合 |
|------|----------|
| **Python** | `fastapi-init-skill` + SSE 路由 |
| **Java** | `springboot-init-skill` + SseEmitter |
| **Go** | `go-gin-init-skill` + SSE 中间件 |

### 数据库层

| 技能 | 用途 |
|------|------|
| `database-design-skill` | 数据库设计规范 |
| `mysql-module-skill` / `pgsql-module-skill` | 会话存储 |
| `redis-module-skill` | 会话缓存（可选） |

### 鉴权层

| 技能 | 用途 |
|------|------|
| `auth-module-skill` | 用户认证 |
| `backend-convention-skill` | 接口规范 |

## 交互流程

```
1. 询问项目名称（默认 my-sse-agent）
2. 询问后端语言：Python / Java / Go
3. 询问数据库：MySQL / PostgreSQL
4. 询问 AI 模型接口：OpenAI 兼容 / 自定义接口
5. 依次调用各技能生成代码
6. 整合为完整项目
7. 输出项目结构和启动说明
```

## 生成内容

### 前端（Vue3）

```markdown
frontend/
├── src/
│   ├── components/          # 基础组件（来自 vue-base-skill）
│   │   ├── ChatBubble.vue   # 聊天气泡
│   │   ├── ChatInput.vue    # 消息输入框
│   │   ├── ChatList.vue     # 会话列表
│   │   └── ChatMessage.vue  # 消息展示
│   ├── views/
│   │   ├── ChatView.vue     # 聊天主页面
│   │   └── LoginView.vue    # 登录页
│   ├── api/
│   │   └── chat.ts          # SSE 连接封装
│   ├── store/
│   │   └── chat.ts          # 聊天状态管理
│   └── styles/
│       └── chat.scss        # 聊天样式
├── package.json
└── vite.config.ts
```

### 后端（以 Python 为例）

```markdown
backend/
├── src/
│   ├── routers/
│   │   ├── chat.py          # SSE 聊天路由
│   │   └── conversation.py  # 会话管理路由
│   ├── services/
│   │   ├── chat_service.py  # 聊天业务逻辑
│   │   └── ai_client.py     # AI 模型调用（HTTP 原生）
│   ├── models/
│   │   ├── conversation.py  # 会话模型
│   │   └── message.py       # 消息模型
│   └── config.py            # 配置
├── requirements.txt
└── .env.example
```

### 数据库

```markdown
database/
├── init.sql                 # 初始化脚本
│   ├── wg_conversation      # 会话表
│   ├── wg_message           # 消息表
│   └── wg_user              # 用户表（复用 auth 模块）
└── .env.example
```

## 核心功能模块

### 1. SSE 流式输出

后端 SSE 实现（不依赖第三方 SSE 库）：

```python
# Python FastAPI 原生 SSE
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

@app.post("/api/chat/stream")
async def chat_stream(request: Request):
    async def generate():
        async for chunk in ai_client.stream(message):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )
```

前端 SSE 接收（原生 fetch + ReadableStream）：

```javascript
// 原生 SSE 接收，不依赖第三方库
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userInput })
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const text = decoder.decode(value)
  const lines = text.split('\n')

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6)
      if (data === '[DONE]') break
      appendMessage(JSON.parse(data).content)
    }
  }
}
```

### 2. AI 模型调用

不依赖 openai SDK，使用原生 HTTP 调用：

```python
import httpx

class AIClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key

    async def stream(self, message: str):
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": message}],
                    "stream": True
                }
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]": break
                        chunk = json.loads(data)
                        yield chunk["choices"][0]["delta"].get("content", "")
```

### 3. 会话管理

- 会话列表（创建、删除、重命名）
- 消息历史（分页加载）
- 会话上下文（多轮对话）

### 4. 用户认证

复用 `auth-module-skill`：
- 登录/注册
- JWT Token 管理
- 用户隔离（每个用户独立会话）

## 支持的 AI 模型

| 模型 | 接口格式 | 说明 |
|------|----------|------|
| OpenAI GPT | OpenAI 兼容 | GPT-3.5 / GPT-4 |
| Claude | OpenAI 兼容 | Claude 3 |
| 阿里通义 | OpenAI 兼容 | qwen-turbo |
| 百度文心 | OpenAI 兼容 | ernie-bot |
| 智谱 GLM | OpenAI 兼容 | glm-4 |
| 本地模型 | OpenAI 兼容 | Ollama / vLLM |

> 所有模型统一使用 OpenAI 兼容接口格式，通过 `.env` 配置 `BASE_URL` 和 `API_KEY`。

## 生成示例

用户输入：

```markdown
/sse-agent-skill 帮我做一个 AI 聊天系统
```

AI 交互：

```markdown
1. 项目名称？（默认 my-sse-agent）
2. 后端语言？Python / Java / Go
3. 数据库？MySQL / PostgreSQL
4. AI 模型接口？（默认 OpenAI 兼容）
```

AI 输出：

```markdown
好的，我将为您生成一个完整的 AI 对话系统：
- 前端：Vue3 + vue-base-skill（聊天气泡、输入框、会话列表）
- 后端：FastAPI + SSE 流式输出
- 数据库：MySQL + database-design-skill
- 鉴权：JWT + auth-module-skill
- AI 调用：原生 HTTP（OpenAI 兼容接口）

正在生成项目...
```

## 不做

- 不使用任何第三方 SDK（openai / anthropic / sse-starlette 等）
- 不负责 AI 模型 API Key
- 不处理复杂的多轮 Tool Use
- 不负责模型部署（使用 super-deploy-skills）

## 依赖关系

```markdown
sse-agent-skill（编排器）
    │
    ├── 前端技能
    │   ├── vue-base-skill（基础组件）
    │   ├── vue-form-skill（输入框）
    │   ├── vue-theme-skill（主题）
    │   └── frontend-request-skill（SSE 封装）
    │
    ├── 后端技能（按语言）
    │   ├── fastapi-init-skill + SSE 路由
    │   ├── springboot-init-skill + SseEmitter
    │   └── go-gin-init-skill + SSE 中间件
    │
    ├── 数据库技能
    │   ├── database-design-skill
    │   ├── mysql-module-skill / pgsql-module-skill
    │   └── redis-module-skill（可选）
    │
    └── 鉴权技能
        ├── auth-module-skill
        └── backend-convention-skill
```
