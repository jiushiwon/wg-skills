# ai-chat-skill — 领域模型与表结构

语言无关。表前缀默认 `wg`（可覆盖），DDL 以 PostgreSQL 为准，MySQL 差异在注释中标注。

## 实体关系

```
wg_user（用户，来自 auth-skill） 1 ──── n wg_ai_session（会话）
wg_ai_session（会话）           1 ──── n wg_ai_message（消息，append-only）
wg_user（用户）                 1 ──── n wg_ai_memory（长期记忆）
断线重连缓冲：走 Redis，不建表
```

`wg_ai_session.user_id` 可空：为空表示匿名会话（问答确认允许匿名时）。

## 表结构

### wg_ai_session — 会话

```sql
CREATE TABLE wg_ai_session (
  id            BIGSERIAL PRIMARY KEY,          -- MySQL: BIGINT AUTO_INCREMENT
  user_id       BIGINT,                         -- 可空=匿名会话；非空时 REFERENCES wg_user(id)
  title         VARCHAR(128) NOT NULL DEFAULT '', -- 首条消息自动截取生成
  model         VARCHAR(64) NOT NULL DEFAULT '',  -- 模型名，如 gpt-4o-mini（可配置）
  system_prompt TEXT,                           -- 可空，会话级覆盖默认 system prompt
  status        SMALLINT NOT NULL DEFAULT 1,    -- 1 正常 0 归档
  message_count INTEGER NOT NULL DEFAULT 0,
  total_tokens  BIGINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),  -- MySQL: DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_session_user ON wg_ai_session(user_id, updated_at DESC);
```

设计要点：
- `user_id` 可空支撑匿名会话；归属校验见 SKILL.md 红线 2。
- `title` 由首条 user 消息截取（默认前 30 字）生成，也可后续调 `PUT` 修改。
- `message_count` / `total_tokens` 冗余计数，消息落库时同事务累加，避免每次 COUNT/SUM。

### wg_ai_message — 消息

```sql
CREATE TABLE wg_ai_message (
  id            BIGSERIAL PRIMARY KEY,
  session_id    BIGINT NOT NULL REFERENCES wg_ai_session(id) ON DELETE CASCADE,
  role          VARCHAR(16) NOT NULL,           -- system / user / assistant
  content       TEXT NOT NULL,
  tokens        INTEGER NOT NULL DEFAULT 0,     -- 本条消息 token 数（assistant 用 usage 回填）
  finish_reason VARCHAR(16),                    -- stop / length / partial（断流兜底）
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_msg_session ON wg_ai_message(session_id, id);
```

设计要点：
- **append-only**：消息不可变，只增不改不删（删会话走级联）。
- 上下文重建直接 `WHERE session_id=? ORDER BY id DESC LIMIT N` 再反转，无需额外字段。
- `finish_reason=partial` 标记断流时已落库的不完整消息，前端可提示「内容可能不完整」。

### wg_ai_memory — 长期记忆

```sql
CREATE TABLE wg_ai_memory (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL,            -- REFERENCES wg_user(id)
  kind              VARCHAR(16) NOT NULL,       -- profile 画像 / fact 事实 / preference 偏好
  content           TEXT NOT NULL,
  content_hash      VARCHAR(64) NOT NULL,       -- content 的 SHA-256，去重靠它
  source_session_id BIGINT,                     -- 抽取出处的会话，可空
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, content_hash)
);
CREATE INDEX idx_memory_user ON wg_ai_memory(user_id, updated_at DESC);
```

设计要点：
- 记忆由**后台异步**从对话中抽取，不在聊天主链路阻塞。抽取设计要点：把一段对话丢给 LLM，用专门 prompt 让它输出「值得长期记住的用户事实」列表（如「用户对花生过敏」「用户偏好简洁回答」），逐条算 `content_hash` 入库，唯一约束天然去重。
- 聊天时按 `user_id` 取最近 N 条（默认 20）注入 system prompt 作为背景信息，**不当作指令执行**（提示词注入防护，见 SKILL.md 红线 7）。

## 短期记忆策略（上下文窗口）

服务端重建上下文时做裁剪，**禁止把全部历史塞给模型**：

```
1. 取 system prompt（默认 + 会话级覆盖 + 长期记忆注入）。
2. 取最近 N 条消息（默认 20），ORDER BY id DESC LIMIT N 再反转。
3. 估算 token；超预算（默认 4000）时，保留 system + 最近 K 条，丢弃中间。
```

- 不做摘要压缩：超窗直接丢弃中间消息，实现简单、成本可控。
- **摘要列为二期增强**：可对被丢弃的中间消息生成摘要作为一条 system 消息插入，平衡上下文连贯性与成本。

## 状态机

### 会话状态

```
[正常 1] ──归档──▶ [归档 0]    归档后：列表默认不展示，仍可查看消息
[归档 0] ──恢复──▶ [正常 1]
```

### 消息生命周期

```
生成 ──▶ append-only（不可变，只增不改）
        └──删会话──▶ 级联删除（ON DELETE CASCADE）
```

## Redis 键约定（可选实现）

| 键 | 值 | TTL | 用途 |
|----|----|----|------|
| `chat:stream:{sessionId}` | 本次流式已生成的增量片段列表 | 会话活跃期 | 断线重连缓冲：SSE 断开后客户端重连，把已生成内容补推，避免重复生成 |
| `chat:limit:{sessionId}` | 计数 | 60s | 单会话消息频率限制（`-1006`） |

无 Redis 的降级：断线重连缓冲取消（断流仅落库 partial，不补推）；限流改内存计数（单实例有效，多实例需 Redis）。

## 核心时序：流式聊天

```
客户端                    服务端                          LLM Provider
  │ POST /completions      │                                │
  │ { sessionId, content } │                                │
  │ ─────────────────────▶ │ 归属校验 + 限流 + 落 user 消息   │
  │                        │ 重建上下文（裁剪+记忆注入）       │
  │                        │ 调 LLM 流式接口 ─────────────▶  │
  │  text/event-stream     │ ◀────── delta ────────────────  │
  │ ◀── delta ──────────── │ 转发 delta + 攒全文              │
  │ ◀── delta ──────────── │ 转发 delta + 攒全文              │
  │                        │ ◀────── done ─────────────────  │
  │ ◀── done ───────────── │ 落 assistant 消息 + 累加 tokens  │
  │                        │ （异步）抽取长期记忆             │
```

断流兜底：转发循环内同步攒全文，连接中断时把已攒内容落库并标 `finish_reason=partial`（SKILL.md 红线 3）。
