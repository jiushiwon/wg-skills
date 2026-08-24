---
name: ai-chat-skill
description: AI 聊天（带记忆）模块生成。用户要做对接大模型的聊天、带记忆的对话、流式输出、会话管理时使用。产出会话/消息/长期记忆领域模型、表结构、接口契约增量（含 SSE 流式）与四语言实现要点，遵循 backend-convention-skill。触发词："AI 聊天"、"带记忆的对话"、"会话记忆"、"对接大模型"、"接入 ChatGPT"、"流式输出"、"SSE 对话"、"多轮对话"、"用户画像记忆"、"chat module"、"AI assistant module"、"通义/DeepSeek/Claude 接入"。
---

# AI Chat Skill

AI 聊天（带记忆）模块生成器。对接大模型（OpenAI 兼容协议为默认，可切换 Claude/通义/DeepSeek 等），产出：领域模型 + 表结构 + 接口契约增量（含 SSE 流式）+ 目标语言实现。

**依赖**：backend-convention-skill（规范，引用不复制）；auth-skill（当前用户注入，会话归属用户）。无 auth 时允许匿名会话（问答项，默认必须登录）。

## 生成流程

1. **问答确认边界**（见下节，未明确的一律按默认值并告知用户）。
2. 按 `references/domain-model.md` 产出表结构 DDL（按确认结果裁剪，如不要长期记忆则不建 `wg_ai_memory`）。
3. 按 `references/api-contract.md` 把接口增量追加进项目 `api-contract.md`。
4. 按检测到的技术栈，展开 `references/<lang>.md` 为可运行代码。
5. 逐条核对「模块红线」。

## 问答清单（生成前确认）

| 决策 | 选项 | 默认 |
|------|------|------|
| 模型供应商 | OpenAI 兼容（填 baseURL+key）/ Claude / 通义 / DeepSeek | OpenAI 兼容 |
| 是否必须登录 | 必须登录 / 允许匿名会话 | 必须登录 |
| 是否需要长期记忆 | 要 / 不要 | 要 |
| 是否需要多模态/文件上传 | 要 / 不要 | 不要（二期） |
| 流式协议 | SSE / 轮询 / WebSocket | SSE |
| 短期记忆窗口 | 最近 N 条 + token 预算 | N=20，预算 4000 |

## 模块红线

1. **LLM API Key 只走环境变量**（见 env-config-guide.md），禁止入库/日志/前端；baseURL 可配置（OpenAI 兼容协议），切换供应商只改配置不改代码。
2. **会话归属校验**：读写会话/消息必须校验 `session.user_id == 当前用户`，违反返回 `-1003`；匿名会话用设备指纹/临时 token 隔离，禁止串号。
3. **流式断开必须兜底**：SSE 连接中断时，已生成的内容要落库（或标记 `finish_reason=partial`），不能整句丢失；落库在转发循环内同步攒全文。
4. **上下文裁剪在服务端做**：禁止把全部历史无脑塞给模型（成本 + 超窗口）。裁剪策略见 domain-model.md（滑动窗口 + token 预算，保留 system + 最近 K 条）。
5. **长期记忆注入设上限**：条数上限（默认 20 条）+ 总长度上限，防止 system prompt 膨胀。
6. **用户输入长度上限**（默认 4000 字符）与单会话消息频率限制（`-1006`）。
7. **模型返回内容落库原样保存**；审核/过滤如有需求在返回前做一层。提示词注入防护：system prompt 与用户内容分界清晰，长期记忆只作背景信息注入，**不把记忆当指令执行**。
8. **错误码用闭集**：`-1001` 参数、`-1002` 未登录、`-1003` 越权、`-1004` 会话不存在、`-1006` 限流、`-2000` 模型调用失败（message 写清 provider 错误概要，不泄露 key）。

## 标准接口

见 `references/api-contract.md`：`POST /api/chat/sessions`、`GET /api/chat/sessions`、`GET /api/chat/sessions/{id}/messages`、`PUT /api/chat/sessions/{id}`、`DELETE /api/chat/sessions/{id}`、`POST /api/chat/completions`（SSE 流式）、`GET /api/chat/memories`、`DELETE /api/chat/memories/{id}`。

## 四语言实现要点

- Java：`references/java.md`（WebFlux/WebClient SSE 流式转发）
- Go：`references/go.md`（net/http + bufio 读 SSE + http.Flusher 转发）
- Python：`references/python.md`（openai SDK / httpx 流式 + StreamingResponse）
- Node：`references/nodejs.md`（openai SDK / fetch SSE + 流式响应）

## 不做

- 不做多模态/文件上传（二期，问答确认时默认关闭）。
- 不做上下文摘要压缩（滑动窗口直接丢弃中间消息，摘要列为二期增强，见 domain-model.md）。
- 不做向量检索记忆（RAG），长期记忆只按 user_id 注入 system prompt；向量检索列为三期。
- 不复制 backend-convention-skill 已有的响应信封/错误码/JWT，本模块只在其上补业务。
