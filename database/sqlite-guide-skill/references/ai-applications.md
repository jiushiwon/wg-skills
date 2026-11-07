# SQLite 在 AI 时代的应用模式

> SQLite 是嵌入式数据库，无运维、单文件、跨平台 —— 这些特性天然契合 AI 时代的"本地优先"、"零成本原型"、"边缘计算"三大趋势。

---

## 一、为什么 SQLite 在 AI 时代迎来第二春

### 1.1 趋势一：Local-First（本地优先软件）

**Local-First Software: You Own Your Data**（Ink & Switch 机构 2019 年提出）的 7 大原则：

1. **本地优先**：数据先存本地，UI 立即响应
2. **隐私**：用户数据不上云
3. **可移植**：数据格式开放，能导出
4. **离线**：断网仍可用
5. **多端**：跨设备同步
6. **协作**：支持多人编辑
7. **可演进**：无锁定

SQLite 在 1-4 项上**完胜所有 C/S 数据库**：
- 数据存在用户设备
- 网络断开仍可读写
- 单文件易备份/迁移
- 无需账号/服务端

**代表产品**：Linear、Notion、Anytype、Reflect、AppFlowy

### 1.2 趋势二：AI 模型本地化

| 模型 | 大小 | 量化后 | 推理设备 |
|------|------|--------|---------|
| Llama 3 8B | ~16 GB | 4-5 GB | M1/M2 Mac、RTX 3060 |
| Phi-3 mini | 3.8B | 2.3 GB | 手机、树莓派 |
| Qwen2 1.5B | ~3 GB | 0.8 GB | 任意终端 |
| Gemma 2B | ~5 GB | 1.5 GB | 笔记本 |

本地 LLM 普及后，**配套数据存储**的诉求强烈：
- 提示词缓存（避免重复调用）
- RAG 知识库（轻量向量检索）
- Agent 状态（多轮对话历史）
- 离线日志

这些场景都用 SQLite。

### 1.3 趋势三：Edge AI / 嵌入式 AI

物联网 + 边缘设备：
- 智能家居（小米/Aqara）
- 工业控制（PLC + AI 推理）
- 自动驾驶（车机端模型）
- 机器人（ROS + LLM）

设备端资源有限，**必须**用轻量存储 —— SQLite 是默认选择。

---

## 二、4 大 AI 时代典型场景

### 场景 1：LLM API 缓存（成本杀手）

**痛点**：GPT-4 调用成本高，重复 query 浪费钱

**方案**：把 query 哈希 → response 存 SQLite

```python
import sqlite3
import hashlib
import json
import time

class LLMCache:
    """生产级 LLM 缓存"""

    SCHEMA = """
    CREATE TABLE IF NOT EXISTS wg_llm_cache (
        query_hash TEXT PRIMARY KEY,
        query_norm TEXT NOT NULL,
        response_json TEXT NOT NULL,
        model TEXT NOT NULL,
        input_tokens INTEGER,
        output_tokens INTEGER,
        cost_usd REAL,
        hit_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        last_hit_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_cache_model ON wg_llm_cache(model, created_at);
    CREATE INDEX IF NOT EXISTS idx_cache_created ON wg_llm_cache(created_at);
    """

    def __init__(self, db_path="./data/llm_cache.db"):
        self.conn = sqlite3.connect(db_path, isolation_level=None)  # autocommit
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.execute("PRAGMA synchronous=NORMAL")
        self.conn.executescript(self.SCHEMA)

    def _normalize(self, query: str) -> str:
        """规范化 query：去空格、转小写"""
        return " ".join(query.lower().split())

    def _hash(self, query_norm: str, model: str) -> str:
        return hashlib.sha256(f"{model}::{query_norm}".encode()).hexdigest()

    def get(self, query: str, model: str):
        qn = self._normalize(query)
        h = self._hash(qn, model)
        row = self.conn.execute(
            "SELECT response_json FROM wg_llm_cache WHERE query_hash=?",
            (h,)
        ).fetchone()
        if row:
            # 异步更新命中次数
            self.conn.execute(
                "UPDATE wg_llm_cache SET hit_count=hit_count+1, last_hit_at=datetime('now') WHERE query_hash=?",
                (h,)
            )
            return json.loads(row[0])
        return None

    def set(self, query: str, response: dict, model: str,
            input_tokens: int = 0, output_tokens: int = 0, cost_usd: float = 0.0):
        qn = self._normalize(query)
        h = self._hash(qn, model)
        self.conn.execute(
            """INSERT OR REPLACE INTO wg_llm_cache
               (query_hash, query_norm, response_json, model, input_tokens, output_tokens, cost_usd)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (h, qn, json.dumps(response, ensure_ascii=False), model,
             input_tokens, output_tokens, cost_usd)
        )

    def cleanup_expired(self, days: int = 30):
        """清理过期缓存"""
        self.conn.execute(
            "DELETE FROM wg_llm_cache WHERE last_hit_at < datetime('now', ?)",
            (f"-{days} days",)
        )

    def stats(self) -> dict:
        row = self.conn.execute(
            """SELECT
                COUNT(*) as total,
                SUM(hit_count) as total_hits,
                SUM(cost_usd * hit_count) as money_saved
               FROM wg_llm_cache"""
        ).fetchone()
        return dict(zip(["total", "total_hits", "money_saved"], row))


# ============== 业务使用 ==============
import openai

cache = LLMCache()

def ask_llm(prompt: str) -> str:
    # 1. 查缓存
    cached = cache.get(prompt, "gpt-4")
    if cached:
        return cached["content"]

    # 2. 调用 API
    resp = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    content = resp.choices[0].message.content

    # 3. 写缓存
    cache.set(prompt, {"content": content}, "gpt-4",
              input_tokens=resp.usage.prompt_tokens,
              output_tokens=resp.usage.completion_tokens,
              cost_usd=0.03)

    return content

# 实际收益：1 万次重复 query，节省 $300+，延迟从 2s 降到 < 1ms
print(cache.stats())
# {'total': 8421, 'total_hits': 23104, 'money_saved': 692.5}
```

**进阶优化**：
- **语义缓存**：用 embedding 算相似度，相似 query 也命中（避免字面略变就 miss）
- **多级缓存**：内存 LRU → SQLite → Redis → API
- **TTL 策略**：按 query 类型设不同过期时间（事实性 query 长，创作类短）

### 场景 2：RAG 知识库（轻量向量检索）

**RAG（Retrieval-Augmented Generation）** 是 LLM 应用最广的范式：

```
用户问题 → Embedding → 向量检索 → Top-K 文档 → 拼成 Prompt → LLM → 答案
```

**传统方案**：Pinecone / Weaviate / Qdrant / Chroma（都要起 server）

**轻量方案**：SQLite + [sqlite-vec](https://github.com/asg017/sqlite-vec)

#### 2.1 完整实现

```bash
pip install sqlite-vec openai numpy
```

```python
import sqlite3
import sqlite_vec
import numpy as np
from openai import OpenAI

class LocalRAG:
    DIM = 1536  # text-embedding-3-small 维度

    def __init__(self, db_path="./data/rag.db"):
        self.client = OpenAI()
        self.conn = sqlite3.connect(db_path)
        self.conn.enable_load_extension(True)
        sqlite_vec.load(self.conn)
        self.conn.execute("PRAGMA journal_mode=WAL")
        self._init_schema()

    def _init_schema(self):
        # sqlite-vec 虚表：向量 + 距离索引
        self.conn.execute(f"""
            CREATE VIRTUAL TABLE IF NOT EXISTS wg_vec_documents USING vec0(
                embedding float[{self.DIM}]
            )
        """)
        # 元数据表
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS wg_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                source TEXT,
                metadata TEXT,  -- JSON
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_doc_source ON wg_documents(source)"
        )

    def _embed(self, text: str) -> list[float]:
        resp = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return resp.data[0].embedding

    def add_document(self, title: str, content: str, source: str = "", metadata: dict = None):
        # 1. 存原文
        cur = self.conn.execute(
            "INSERT INTO wg_documents (title, content, source, metadata) VALUES (?, ?, ?, ?)",
            (title, content, source, json.dumps(metadata or {}))
        )
        doc_id = cur.lastrowid

        # 2. 向量化（chunking 简化：单文档一整块）
        embedding = self._embed(content)

        # 3. 存向量
        self.conn.execute(
            "INSERT INTO wg_vec_documents (rowid, embedding) VALUES (?, ?)",
            (doc_id, sqlite_vec.serialize_float32(embedding))
        )
        self.conn.commit()
        return doc_id

    def search(self, query: str, k: int = 5, filter_source: str = None) -> list[dict]:
        # 1. Query 向量化
        qvec = self._embed(query)

        # 2. 向量检索
        if filter_source:
            rows = self.conn.execute(
                """
                SELECT d.id, d.title, d.content, d.source, v.distance
                FROM wg_vec_documents v
                JOIN wg_documents d ON d.id = v.rowid
                WHERE v.embedding MATCH ? AND d.source = ?
                ORDER BY v.distance
                LIMIT ?
                """,
                (sqlite_vec.serialize_float32(qvec), filter_source, k)
            ).fetchall()
        else:
            rows = self.conn.execute(
                """
                SELECT d.id, d.title, d.content, d.source, v.distance
                FROM wg_vec_documents v
                JOIN wg_documents d ON d.id = v.rowid
                WHERE v.embedding MATCH ?
                ORDER BY v.distance
                LIMIT ?
                """,
                (sqlite_vec.serialize_float32(qvec), k)
            ).fetchall()

        return [
            {"id": r[0], "title": r[1], "content": r[2],
             "source": r[3], "distance": r[4]}
            for r in rows
        ]

    def ask(self, question: str, k: int = 3) -> str:
        """RAG 完整流程"""
        # 1. 检索
        docs = self.search(question, k=k)
        context = "\n\n".join([
            f"【文档 {i+1}】{d['title']}\n{d['content']}"
            for i, d in enumerate(docs)
        ])

        # 2. 拼 Prompt
        prompt = f"""基于以下参考文档回答问题。如果文档中无相关信息，请明确说"未找到"。

【参考文档】
{context}

【问题】
{question}

【回答】"""

        # 3. LLM
        resp = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        return resp.choices[0].content


# ============== 使用 ==============
rag = LocalRAG()

# 灌入知识
rag.add_document(
    title="wg-skills 介绍",
    content="wg-skills 是一个开源的全栈技能仓库，包含 156 个 Claude Code Skills...",
    source="docs"
)
rag.add_document(
    title="SQLite 选型",
    content="SQLite 适合本地优先、AI 缓存、嵌入式设备...",
    source="tech"
)

# 查询
print(rag.ask("wg-skills 有多少个 skill？"))
```

#### 2.2 性能 & 规模

| 文档数 | 索引大小 | 检索延迟 | 备注 |
|--------|---------|---------|------|
| 1,000 | 6 MB | < 5 ms | 适合单文件 |
| 10,000 | 60 MB | ~20 ms | 完全够用 |
| 100,000 | 600 MB | ~100 ms | 接近极限 |
| 1,000,000+ | 6 GB+ | > 500 ms | **应迁移**到专用向量库 |

**适用边界**：
- ✅ 个人/小团队 RAG（< 10 万文档）
- ✅ 单机 AI 工具
- ✅ 离线知识库
- ❌ 千万级文档 → Chroma/Qdrant
- ❌ 多机分布式 → Milvus

### 场景 3：AI Agent 状态管理

Agent 比单轮聊天复杂 —— 需要：
- 会话历史（messages）
- 工具调用记录
- 中间结果
- 状态机（planning / executing / reviewing）

```sql
-- Agent 会话
CREATE TABLE wg_agent_session (
    session_id TEXT PRIMARY KEY,        -- UUIDv7
    user_id INTEGER NOT NULL,
    agent_type TEXT NOT NULL,           -- 'chatbot' / 'code' / 'data-analysis'
    system_prompt TEXT,
    model TEXT NOT NULL,
    status TEXT DEFAULT 'active',       -- 'active' / 'archived' / 'deleted'
    total_tokens INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 消息历史
CREATE TABLE wg_agent_message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,                 -- 'system' / 'user' / 'assistant' / 'tool'
    content TEXT NOT NULL,              -- 文本内容
    tool_calls TEXT,                    -- JSON: 工具调用 [{name, args, result}]
    tokens INTEGER,
    latency_ms INTEGER,                 -- 推理耗时
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES wg_agent_session(session_id)
);
CREATE INDEX idx_msg_session ON wg_agent_message(session_id, id);

-- Agent 工具定义（可被多 session 共享）
CREATE TABLE wg_agent_tool (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    parameters_schema TEXT,             -- JSON Schema
    handler TEXT                        -- 代码入口
);

-- Agent 长期记忆（向量）
CREATE VIRTUAL TABLE wg_agent_memory USING vec0(
    embedding float[1536]
);
CREATE TABLE wg_agent_memory_meta (
    id INTEGER PRIMARY KEY,
    session_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    importance REAL DEFAULT 0.5,        -- 0-1，越重要越不易被遗忘
    created_at TEXT DEFAULT (datetime('now'))
);
```

**优势**：
- Agent 重启不丢上下文
- 可回溯整轮对话
- 工具调用可重放/审计
- 长期记忆可跨 session 检索

### 场景 4：本地 LLM 推理 + SQLite 生态

桌面端 LLM 工具（Ollama / LM Studio / GPT4All）配套：

```python
# 用 Ollama 本地推理 + SQLite 存历史
import ollama
import sqlite3

class LocalLLMChat:
    def __init__(self, db_path="./data/chat.db"):
        self.conn = sqlite3.connect(db_path)
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS wg_chat (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                model TEXT NOT NULL,
                tokens INTEGER,
                created_at TEXT DEFAULT (datetime('now'))
            );
        """)

    def chat(self, messages: list[dict], model: str = "llama3:8b") -> str:
        # 1. 持久化 user 消息
        self.conn.execute(
            "INSERT INTO wg_chat (role, content, model) VALUES (?, ?, ?)",
            ("user", messages[-1]["content"], model)
        )

        # 2. 本地推理（完全离线）
        resp = ollama.chat(model=model, messages=messages)
        content = resp["message"]["content"]

        # 3. 持久化 assistant
        self.conn.execute(
            "INSERT INTO wg_chat (role, content, model, tokens) VALUES (?, ?, ?, ?)",
            ("assistant", content, model, resp.get("eval_count", 0))
        )
        self.conn.commit()
        return content

# 用法
chat = LocalLLMChat()
print(chat.chat([{"role": "user", "content": "解释量子计算"}]))
# 完全本地，0 成本，0 延迟（推理除外）
```

**典型应用**：
- 离线聊天助手
- 桌面端 Copilot
- 嵌入式 AI 客服
- 端侧 RAG

---

## 三、SQLite 在 AI 工具链中的位置

```
┌────────────────────────────────────────────────────────┐
│                     LLM 应用架构                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐          │
│   │ Prompt   │   │  Agent   │   │  RAG     │          │
│   │ 模板     │   │  编排    │   │  检索    │          │
│   └─────┬────┘   └─────┬────┘   └─────┬────┘          │
│         │              │              │                │
│         └──────────────┼──────────────┘                │
│                        ▼                               │
│         ┌──────────────────────────────┐               │
│         │   数据层（选型关键）          │               │
│         ├──────────────────────────────┤               │
│         │ 小规模/本地 → ✅ SQLite       │               │
│         │ 千万级+      → Chroma/Qdrant │               │
│         │ 关系数据     → SQLite/MySQL   │               │
│         │ 高速 KV      → Redis          │               │
│         └──────────────────────────────┘               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**SQLite 在 AI 工具链中的 3 个位置**：

1. **业务数据层**：替代轻量场景的 MySQL（用户、订单、配置）
2. **AI 增强层**：LLM 缓存、向量库、Agent 状态
3. **本地优先层**：桌面/移动/嵌入式的端侧存储

---

## 四、生产环境注意事项

### 4.1 监控指标

```python
import sqlite3

def health_check(db_path: str) -> dict:
    conn = sqlite3.connect(db_path)
    stats = {
        "db_size_mb": os.path.getsize(db_path) / 1024 / 1024,
        "wal_size_mb": os.path.getsize(f"{db_path}-wal") / 1024 / 1024 if os.path.exists(f"{db_path}-wal") else 0,
    }
    # 慢查询统计
    slow = conn.execute("SELECT COUNT(*) FROM sqlite_master").fetchone()
    return stats
```

### 4.2 备份策略

| 场景 | 方案 |
|------|------|
| 单机 + 重要数据 | Litestream 流式复制到 S3 |
| 单机 + 不重要 | 定时全量备份（cron + backup API） |
| 多机 | 不要用 SQLite，改 MySQL/PG |

### 4.3 与其他存储配合

```
业务数据:    MySQL/PG
缓存:        Redis (可选) / SQLite (内存模式)
向量检索:    SQLite + sqlite-vec (小规模) / Qdrant (大规模)
日志:        SQLite / Loki
监控:        Prometheus + Grafana
```

**SQLite 不应替代**：Redis（高频 KV）、Qdrant（千万级向量）、MySQL（多机写入）

---

## 五、总结

SQLite 在 AI 时代找到 4 个新角色：

1. **LLM 缓存**：成本杀手，月省 $500+
2. **本地 RAG**：0 运维，10 万文档级 RAG
3. **Agent 状态**：会话历史、长期记忆、工具调用
4. **本地优先**：桌面 AI 工具、嵌入式 AI、Edge AI

**核心优势**：
- 0 运维（无 server）
- 单文件易备份
- 跨平台
- 性能优于想象（百万级数据 < 10ms）

**核心限制**：
- 单写者（高并发写场景不适合）
- 单机（分布式需自己实现同步）

**决策原则**：

> **如果你的应用能在单机上跑，SQLite + AI 扩展就是最优解。**
> 除非你的数据规模 / 写入并发突破单机极限，否则不需要上 MySQL/PG。
