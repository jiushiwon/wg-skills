# ai-chat-skill

AI 聊天（带记忆）模块生成器：在已有后端项目（或经 backend-generate-skill 生成的骨架）上长出对接大模型的聊天能力——会话管理、消息持久化、短期/长期记忆、SSE 流式输出、token 用量记录。

## 功能

- 对接大模型（OpenAI 兼容协议为默认，可切换 Claude/通义/DeepSeek 等，只改配置）
- 会话管理：创建、分页列表、改标题、归档、删除（级联删消息）
- 消息持久化：append-only，按会话重建上下文
- 短期记忆：滑动窗口（最近 N 条 + token 预算）服务端裁剪，禁止全量塞给模型
- 长期记忆：后台异步抽取用户事实，按 user_id 注入 system prompt（条数/长度上限）
- SSE 流式输出：delta / done / error 事件，断流兜底落库（partial）
- token 用量记录、单会话限流、输入长度上限

## 使用方式

```
帮我加一个 AI 聊天模块，要流式输出和会话记忆
现有 Go 项目里接入大模型对话，带长期记忆，必须登录
做一个带记忆的 AI 助手，SSE 流式，接 DeepSeek
```

技能会先确认模型供应商、是否必须登录、是否需要长期记忆等关键决策（都有默认值），然后产出表结构、接口契约增量和目标语言实现。

## 产出物

| 产出 | 内容 |
|------|------|
| 表结构 | `wg_ai_session`、`wg_ai_message`、`wg_ai_memory`，含索引、唯一约束与状态机 |
| 接口契约 | 8 个接口：sessions CRUD（5 个）、completions（SSE 流式）、memories（2 个） |
| 实现 | 按项目技术栈展开 Java/Go/Python/Node 对应实现要点为可运行代码 |

## 目录说明

```
ai-chat-skill/
├── SKILL.md                  # 触发词、生成流程、问答清单、模块红线
├── README.md                 # 本文件
└── references/
    ├── domain-model.md       # 领域模型、表结构 DDL、状态机、Redis 键约定、流式时序
    ├── api-contract.md       # 接口契约增量（追加进项目 api-contract.md）
    ├── java.md               # Spring Boot（WebFlux/SseEmitter）实现要点
    ├── go.md                 # Gin（net/http + Flusher）实现要点
    ├── python.md             # FastAPI（openai SDK + StreamingResponse）实现要点
    └── nodejs.md             # Express/NestJS（openai SDK + 流式响应）实现要点
```

## 模块红线（摘要）

LLM API Key 只走环境变量；会话归属必须校验（越权 -1003）；流式断开必须兜底落库 partial；上下文裁剪在服务端做（禁止全量历史）；长期记忆注入设条数/长度上限且只作背景不当指令；输入长度上限 + 单会话限流；错误码用闭集（-2000 模型调用失败不泄露 key）。完整红线见 SKILL.md。

## 依赖

- 规范：backend-convention-skill（响应信封、错误码、JWT、契约模板，引用不复制）。
- 当前用户：auth-skill（会话归属用户）。无 auth 时允许匿名会话（问答项，默认必须登录），用设备指纹/临时 token 隔离。
- 关系：本模块与 org-permission-skill 同为 auth-skill 的下游。
