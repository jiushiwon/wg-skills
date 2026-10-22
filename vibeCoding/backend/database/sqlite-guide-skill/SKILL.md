---
name: sqlite-guide-skill
description: SQLite 学习与选型指南。面向需要了解 SQLite 的开发者，提供核心概念、安装配置、CRUD、事务处理、并发访问、5 语言集成（Python/Java/Go/Node.js/Rust）、全文搜索 FTS5、与业务场景匹配推荐等。**重点补充**：AI 时代 SQLite 新角色（本地 LLM 缓存、RAG 检索、AI Agent 状态、Edge AI）、与 MySQL/PostgreSQL/MongoDB 选型对比。触发词："SQLite 学习"、"SQLite 入门"、"SQLite 选型"、"轻量数据库"、"嵌入式数据库"、"sqlite 概念"、"AI 本地数据库"、"本地优先"、"local-first"、"RAG 检索"、"SQLite 全文搜索"、"FTS5"。
---

# SQLite Module Skill

面向**已有后端项目**的开发者，快速集成 SQLite 能力。覆盖**5 语言 + AI 时代新场景**。

## 为什么单独做 SQLite 技能

SQLite 是**全球部署量最大**的数据库 —— Android、iOS、macOS、Windows、Chrome、Firefox、Skype、WhatsApp 全部内置 SQLite。但很多后端开发者**只会 MySQL/PG 思维**，用 SQLite 时要么过度设计，要么错失其独特优势。

本技能解决 3 个问题：
1. **正确使用**：WAL、busy_timeout、连接模型、调优
2. **选型判断**：什么场景选 SQLite，什么场景必须 MySQL/PG
3. **AI 时代新角色**：本地 LLM 缓存、RAG 检索、AI Agent 状态存储、Edge AI

## 能力清单

| 能力 | 说明 | 难度 |
|------|------|------|
| **连接配置** | SQLite 文件路径 + PRAGMA 调优 | ⭐ |
| **CRUD 操作** | 增删改查/批量操作 | ⭐ |
| **事务处理** | 事务提交/回滚/嵌套 | ⭐ |
| **并发访问** | WAL 模式/锁机制/busy_timeout | ⭐⭐ |
| **ORM 映射** | SQLAlchemy/Hibernate/GORM/Prisma/Diesel | ⭐⭐ |
| **全文搜索 FTS5** | 内置全文搜索引擎 | ⭐⭐ |
| **多语言集成** | Python/Java/Go/Node.js/Rust 5 语言 | ⭐⭐ |
| **AI 时代应用** | 本地 LLM 缓存、RAG、AI Agent 状态 | ⭐⭐ |
| **备份/迁移** | .backup API、Litestream、流式复制 | ⭐⭐ |

## 触发场景

用户说"帮我加 SQLite"、"集成轻量数据库"、"嵌入式数据库"、"AI 本地数据库"、"本地优先存储"、"RAG 检索库"、"FTS5 全文搜索"时触发。

---

## 核心配置（5 语言）

### Python (FastAPI)

```python
# config.py
class Settings(BaseSettings):
    db_path: str = "./data/myapp.db"

# database.py
import sqlite3
from contextlib import contextmanager

class SQLiteClient:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with self.get_conn() as conn:
            # 必开项：WAL 模式提升读写并发
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA synchronous=NORMAL")
            conn.execute("PRAGMA busy_timeout=5000")
            conn.execute("PRAGMA foreign_keys=ON")

    @contextmanager
    def get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def execute(self, sql: str, params: tuple = ()):
        with self.get_conn() as conn:
            cursor = conn.execute(sql, params)
            return cursor.lastrowid

    def query(self, sql: str, params: tuple = ()):
        with self.get_conn() as conn:
            cursor = conn.execute(sql, params)
            return [dict(row) for row in cursor.fetchall()]
```

**SQLAlchemy 集成**（推荐 ORM）：

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./data/myapp.db"
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # FastAPI 多线程
    pool_size=1,  # SQLite 写串行，连接池 1 即可
    max_overflow=0,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### Java (Spring Boot)

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.45.0.0</version>
</dependency>
```

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:sqlite:./data/myapp.db
    driver-class-name: org.sqlite.JDBC
    hikari:
      maximum-pool-size: 1      # SQLite 写串行
      minimum-idle: 1
      connection-timeout: 10000
      connection-init-sql: "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;"
```

### Go (database/sql + GORM)

```go
import (
    "database/sql"
    _ "github.com/mattn/go-sqlite3"  // CGO
    // 或 _ "github.com/glebarez/go-sqlite"  // 纯 Go，无 CGO
)

func InitDB(dbPath string) (*sql.DB, error) {
    // DSN 中可附加 PRAGMA
    dsn := dbPath + "?_journal_mode=WAL&_busy_timeout=5000&_foreign_keys=on"
    db, err := sql.Open("sqlite3", dsn)
    if err != nil {
        return nil, err
    }
    // SQLite 写串行，最大连接数 1
    db.SetMaxOpenConns(1)
    db.SetMaxIdleConns(1)
    db.SetConnMaxLifetime(0)
    return db, nil
}
```

**GORM 集成**：

```go
import (
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

func InitGorm(dbPath string) (*gorm.DB, error) {
    db, err := gorm.Open(sqlite.Open(dbPath+"?_journal_mode=WAL"), &gorm.Config{})
    if err != nil {
        return nil, err
    }
    return db, nil
}
```

### Node.js (better-sqlite3 / Prisma)

**better-sqlite3**（同步 API，最快，Node.js 生态首选）：

```javascript
const Database = require('better-sqlite3');

const db = new Database('./data/myapp.db');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('busy_timeout = 5000');
db.pragma('foreign_keys = ON');

// 预处理语句（性能关键）
const insertUser = db.prepare(
  'INSERT INTO wg_user (username, password) VALUES (?, ?)'
);
const insertResult = insertUser.run('alice', 'hashed_pwd');
console.log(insertResult.lastInsertRowid);

// 事务（begin immediate 自动获取写锁）
const insertMany = db.transaction((users) => {
  for (const u of users) insertUser.run(u.username, u.password);
});
insertMany([{username: 'a', password: 'x'}, {username: 'b', password: 'y'}]);
```

**Prisma 集成**（TypeScript ORM）：

```prisma
// schema.prisma
datasource db {
  provider = "sqlite"
  url      = "file:./data/myapp.db"
}

generator client {
  provider = "prisma-client-js"
}

model WgUser {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

### Rust (Diesel / rusqlite)

**rusqlite**（最常用）：

```rust
use rusqlite::{Connection, params};

fn init_db(path: &str) -> rusqlite::Result<Connection> {
    let conn = Connection::open(path)?;
    conn.pragma_update(None, "journal_mode", "WAL")?;
    conn.pragma_update(None, "synchronous", "NORMAL")?;
    conn.pragma_update(None, "busy_timeout", 5000)?;
    conn.pragma_update(None, "foreign_keys", "ON")?;
    Ok(conn)
}

fn insert_user(conn: &Connection, username: &str, password: &str) -> rusqlite::Result<i64> {
    conn.execute(
        "INSERT INTO wg_user (username, password) VALUES (?1, ?2)",
        params![username, password],
    )?;
    Ok(conn.last_insert_rowid())
}
```

**Diesel**（类型安全 ORM）：

```toml
# Cargo.toml
[dependencies]
diesel = { version = "2.1", features = ["sqlite"] }
```

```rust
// src/schema.rs（由 diesel migration 生成）
diesel::table! {
    wg_user (id) {
        id -> Integer,
        username -> Text,
        password -> Text,
        created_at -> Timestamp,
    }
}
```

### 小程序 / UniApp（客户端内嵌）

```javascript
// 微信小程序/UniApp - 客户端 SQLite
// 1. 微信小程序：使用 wx.getFileSystemManager 管理本地 .db 文件
// 2. UniApp：条件编译 App 端用 plus.sqlite，H5 端用 sql.js

// UniApp 示例
// #ifdef APP-PLUS
const db = uni.requireNativePlugin('Sqlite');
// #endif

// #ifdef H5
import initSqlJs from 'sql.js';
const SQL = await initSqlJs();
const db = new SQL.Database();
// #endif
```

---

## 表结构设计

### 基础表模板

```sql
CREATE TABLE IF NOT EXISTS "wg_user" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "nickname" TEXT,
    "email" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TEXT NOT NULL DEFAULT (datetime('now')),
    "updated_at" TEXT NOT NULL DEFAULT (datetime('now')),
    "deleted_at" TEXT
);

CREATE INDEX IF NOT EXISTS "idx_username" ON "wg_user"("username");
CREATE INDEX IF NOT EXISTS "idx_status" ON "wg_user"("status");
```

### SQLite 数据类型注意

SQLite 5 存储类（与 MySQL/PG 不同）：

| 类型 | 实际存储 | 适用 |
|------|---------|------|
| NULL | 空值 | 字段未填 |
| INTEGER | 1/2/3/4/6/8 字节整数 | 布尔、ID、计数 |
| REAL | 8 字节浮点 | 价格（非金额） |
| TEXT | UTF-8/UTF-16 字符串 | 文本、JSON、时间（ISO8601） |
| BLOB | 二进制 | 图片、文件、向量 embedding |

> **类型亲和性**：SQLite 不会强类型校验。建议字段类型名（如 `INTEGER`、`TEXT`）保持显式，便于 ORM 推断。

---

## 事务处理

### 基础事务（Python）

```python
def transfer_money(from_id: int, to_id: int, amount: int):
    with sqlite_client.get_conn() as conn:
        try:
            # 关键：使用 IMMEDIATE 事务提前获取写锁
            conn.execute("BEGIN IMMEDIATE")
            conn.execute(
                "UPDATE wg_account SET balance = balance - ? WHERE id = ?",
                (amount, from_id)
            )
            conn.execute(
                "UPDATE wg_account SET balance = balance + ? WHERE id = ?",
                (amount, to_id)
            )
            conn.commit()
        except Exception:
            conn.rollback()
            raise
```

### savepoint 嵌套事务

```python
def complex_business():
    with sqlite_client.get_conn() as conn:
        conn.execute("BEGIN")
        try:
            conn.execute("INSERT INTO wg_order ...")
            order_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

            # 子业务：失败可单独回滚
            conn.execute("SAVEPOINT order_items_sp")
            try:
                for item in items:
                    conn.execute("INSERT INTO wg_order_item ...")
            except Exception:
                conn.execute("ROLLBACK TO SAVEPOINT order_items_sp")

            conn.execute("COMMIT")
        except Exception:
            conn.execute("ROLLBACK")
            raise
```

---

## 并发与性能优化

### PRAGMA 调优清单

```sql
-- 必开：WAL 模式（一写多读）
PRAGMA journal_mode = WAL;

-- 平衡安全与速度（NORMAL 在 WAL 下也是安全的）
PRAGMA synchronous = NORMAL;

-- 锁等待超时（毫秒），避免 SQLITE_BUSY 立即失败
PRAGMA busy_timeout = 5000;

-- 启用外键约束（默认关闭！）
PRAGMA foreign_keys = ON;

-- 内存缓存（页数，-KB 单位；默认 -2000 = 2MB）
PRAGMA cache_size = -64000;  -- 64MB

-- 临时表存内存
PRAGMA temp_store = MEMORY;

-- map I/O（适合只读或读多写少；> 4GB 文件慎用）
PRAGMA mmap_size = 268435456;  -- 256MB
```

### 写性能对比

| 场景 | 默认模式 | WAL + NORMAL | 提升 |
|------|---------|--------------|------|
| 单线程写入（批量 INSERT） | 基准 | 1.5-2x | 顺序写 + 减少 fsync |
| 读写混合（1 写多读） | 读阻塞写 | 不阻塞 | 并发质变 |
| 高并发写入（10 线程） | 锁等待严重 | 仍串行 | 持平（SQLite 写串行） |

### 只读副本（读并发扩展）

```python
# 主库（读写）
main_db = sqlite3.connect("app.db", uri=True)
main_db.execute("PRAGMA journal_mode=WAL")

# 只读副本（同一 .db 文件，可放内存盘）
read_db = sqlite3.connect(
    "file:app.db?mode=ro&cache=shared",
    uri=True
)
# 多个读连接可并发（不受写锁阻塞）
```

---

## 全文搜索 FTS5（SQLite 内置搜索引擎）

FTS5 是 SQLite 内置的全文搜索引擎，**无需额外安装 Elasticsearch**。

### 建表

```sql
-- 1. 创建内容表
CREATE TABLE wg_article (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    author TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. 创建 FTS5 虚表（搜索引擎）
CREATE VIRTUAL TABLE wg_article_fts USING fts5(
    title,
    body,
    content='wg_article',     -- 关联内容表
    content_rowid='id',
    tokenize='unicode61 remove_diacritics 2'  -- 支持中文：trigram 三元组
);

-- 3. 触发器：内容表变更时同步 FTS
CREATE TRIGGER wg_article_ai AFTER INSERT ON wg_article BEGIN
    INSERT INTO wg_article_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
END;
CREATE TRIGGER wg_article_ad AFTER DELETE ON wg_article BEGIN
    INSERT INTO wg_article_fts(wg_article_fts, rowid, title, body)
        VALUES('delete', old.id, old.title, old.body);
END;
CREATE TRIGGER wg_article_au AFTER UPDATE ON wg_article BEGIN
    INSERT INTO wg_article_fts(wg_article_fts, rowid, title, body)
        VALUES('delete', old.id, old.title, old.body);
    INSERT INTO wg_article_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
END;
```

### 查询（中文用 trigram 分词）

```sql
-- 普通搜索
SELECT a.id, a.title, snippet(wg_article_fts, 1, '<b>', '</b>', '...', 32)
FROM wg_article_fts f
JOIN wg_article a ON a.id = f.rowid
WHERE wg_article_fts MATCH 'SQLite OR 性能'
ORDER BY rank
LIMIT 20;

-- 高亮（snippet 函数）
-- 短语搜索：用双引号包住 "exact phrase"
-- 必须项：+keyword
-- 排除项：NOT keyword
```

> **中文分词**：标准 `unicode61` 对中文不分词（按字）。需用 `trigram` 分词器（SQLite 3.34+）或 `unicode61` + 外部分词（如 jieba）。

---

## AI 时代新场景（2024+）

### 场景 1：本地 LLM 缓存（Local LLM Cache）

大模型 API 调用昂贵（GPT-4 输入 $2.5/百万 token），把问答结果缓存到 SQLite：

```python
import sqlite3
import hashlib
import json

class LLMCache:
    def __init__(self, db_path="./data/llm_cache.db"):
        self.conn = sqlite3.connect(db_path)
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS wg_llm_cache (
                query_hash TEXT PRIMARY KEY,
                query_text TEXT NOT NULL,
                response_json TEXT NOT NULL,
                model TEXT NOT NULL,
                tokens_used INTEGER,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                hit_count INTEGER DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_created ON wg_llm_cache(created_at);
        """)

    def _hash(self, query: str, model: str) -> str:
        return hashlib.sha256(f"{model}:{query}".encode()).hexdigest()

    def get(self, query: str, model: str):
        h = self._hash(query, model)
        row = self.conn.execute(
            "SELECT response_json FROM wg_llm_cache WHERE query_hash=?",
            (h,)
        ).fetchone()
        if row:
            self.conn.execute(
                "UPDATE wg_llm_cache SET hit_count=hit_count+1 WHERE query_hash=?",
                (h,)
            )
            return json.loads(row[0])
        return None

    def set(self, query: str, response: dict, model: str, tokens: int):
        h = self._hash(query, model)
        self.conn.execute(
            """INSERT OR REPLACE INTO wg_llm_cache
               (query_hash, query_text, response_json, model, tokens_used)
               VALUES (?, ?, ?, ?, ?)""",
            (h, query, json.dumps(response, ensure_ascii=False), model, tokens)
        )
        self.conn.commit()

# 业务侧
cache = LLMCache()
result = cache.get(question, "gpt-4")
if not result:
    result = openai_client.chat(question)
    cache.set(question, result, "gpt-4", tokens_used=len(question) // 4)
```

**优势**：
- 完全本地化，0 网络延迟
- 历史查询秒级返回（实测比 Redis 还快）
- 无运维成本（单文件）

### 场景 2：RAG 知识库（小团队/个人）

不用 Pinecone/Chroma，用 SQLite + sqlite-vec 扩展做轻量 RAG：

```bash
pip install sqlite-vec
```

```python
import sqlite3
import sqlite_vec
from typing import List

class LocalVectorDB:
    def __init__(self, db_path="./data/rag.db"):
        self.conn = sqlite3.connect(db_path)
        self.conn.enable_load_extension(True)
        sqlite_vec.load(self.conn)
        self.conn.execute("PRAGMA journal_mode=WAL")
        self._init_schema()

    def _init_schema(self):
        # sqlite-vec 虚表
        self.conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS wg_documents_vec USING vec0(
                embedding float[1536]  -- OpenAI text-embedding-3-small 维度
            )
        """)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS wg_documents (
                id INTEGER PRIMARY KEY,
                content TEXT NOT NULL,
                source TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)

    def add(self, doc_id: int, content: str, embedding: List[float]):
        self.conn.execute(
            "INSERT INTO wg_documents (id, content) VALUES (?, ?)",
            (doc_id, content)
        )
        self.conn.execute(
            "INSERT INTO wg_documents_vec (rowid, embedding) VALUES (?, ?)",
            (doc_id, embedding)
        )
        self.conn.commit()

    def search(self, query_embedding: List[float], k: int = 5):
        rows = self.conn.execute(
            """
            SELECT d.id, d.content, v.distance
            FROM wg_documents_vec v
            JOIN wg_documents d ON d.id = v.rowid
            WHERE v.embedding MATCH ?
            ORDER BY v.distance
            LIMIT ?
            """,
            (sqlite_vec.serialize_float32(query_embedding), k)
        ).fetchall()
        return rows
```

**性能参考**（MacBook M2, 1 万条 1536 维文档）：
- 写入：~50ms/条
- 检索（k=5）：~5ms

**适用**：1 万 ~ 100 万条文档。超过 → 用 Chroma/Qdrant。

### 场景 3：AI Agent 状态存储

Agent 上下文（对话历史、工具调用、状态机）天然适合 SQLite：

```python
# AI Agent 长对话存储
CREATE TABLE wg_agent_session (
    session_id TEXT PRIMARY KEY,        -- UUID
    user_id INTEGER NOT NULL,
    system_prompt TEXT,
    model TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE wg_agent_message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,                 -- 'user' / 'assistant' / 'tool'
    content TEXT NOT NULL,              -- JSON: 文本+工具调用+附件
    tokens INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES wg_agent_session(session_id)
);
CREATE INDEX idx_session ON wg_agent_message(session_id, id);
```

### 场景 4：本地优先（Local-First）应用

Notion / Linear 类应用，**离线优先 + 云端同步**，用 SQLite 作本地存储：

```typescript
// 浏览器端 PWA
import { openDB } from 'idb';  // IndexedDB 包装

// 或 Tauri / Electron
import Database from 'better-sqlite3';
const db = new Database('app.db');
db.pragma('journal_mode = WAL');
```

> Local-First 软件 7 大原则：本地优先、隐私、可移植、离线可用、多端同步、协作、可演进。SQLite 是核心存储层。

---

## 备份与迁移

### 在线热备份（无需停服）

```python
import sqlite3

# 方式 1：使用 SQLite 内置 backup API
source = sqlite3.connect("app.db")
dest = sqlite3.connect("app_backup.db")
with dest:
    source.backup(dest)
dest.close()
source.close()

# 方式 2：文件系统级
# WAL 模式下：先执行 PRAGMA wal_checkpoint(TRUNCATE)，再拷贝 .db
# 或直接拷 .db + .db-wal + .db-shm 三件套
```

### 持续增量同步（Litestream）

```bash
# Litestream：把 SQLite WAL 流式复制到 S3/GCS/Azure
# 适合：单机 + 不想运维 PG
# 安装：brew install litestream
litestream replicate app.db s3://my-bucket/sqlite-backups
```

### 导出 SQL

```bash
sqlite3 app.db .dump > backup.sql
sqlite3 new.db < backup.sql
```

### 迁移到 PostgreSQL（业务大了之后）

```bash
# sqlite3 导出 CSV
sqlite3 -header -csv app.db "SELECT * FROM wg_user" > wg_user.csv
# psql 导入
psql -d target_db -c "\COPY wg_user FROM 'wg_user.csv' CSV HEADER"
```

---

## 选型对比（SQLite vs MySQL vs PostgreSQL vs MongoDB）

| 维度 | SQLite | MySQL | PostgreSQL | MongoDB |
|------|--------|-------|------------|---------|
| **架构** | 嵌入式（库） | C/S | C/S | C/S |
| **部署** | 0 运维 | 需部署 | 需部署 | 需部署 |
| **并发写** | 单写者 | 多写 | 多写 | 多写 |
| **读并发** | WAL 模式可高 | 高 | 高 | 高 |
| **最大数据** | ~TB（理论） | PB 级 | PB 级 | PB 级 |
| **适用规模** | 单机 < 100 万行 | 中大型 | 大型 | 大型/文档 |
| **适用场景** | 桌面/移动/小型后端/AI 缓存 | 通用 Web | 复杂查询/分析 | 文档/灵活 schema |
| **类型系统** | 弱（5 存储类） | 中 | 强 | 弱（BSON） |
| **JSON 支持** | JSON1 扩展 | JSON 字段 | JSONB 原生 | 原生 |
| **全文搜索** | FTS5 内置 | FULLTEXT | tsvector + GIN | text index |
| **地理空间** | R*Tree 扩展 | 弱 | PostGIS（强） | 2dsphere |
| **向量检索** | sqlite-vec | 无 | pgvector | 无 |
| **运维成本** | 0 | 中 | 中 | 高 |
| **学习成本** | 低 | 低 | 中 | 低 |

### 决策树

```
你的应用场景是？
├── 移动 App / 桌面 / 嵌入式
│   └── ✅ SQLite（默认）
├── 小型后端 / 个人项目 / 中小流量（< 1000 QPS）
│   └── ✅ SQLite（省运维）
├── 本地 LLM 缓存 / RAG 检索 / Agent 状态
│   └── ✅ SQLite + 扩展
├── 中型 Web（1000 ~ 10000 QPS，需要多机）
│   └── ⚠️ 评估：单机能撑就 SQLite，否则 MySQL
├── 大型 Web（> 10000 QPS，复杂业务）
│   └── MySQL / PostgreSQL
├── 复杂查询 / GIS / 数据分析
│   └── PostgreSQL
└── 灵活 schema / 文档型
    └── MongoDB
```

---

## 部署说明（重要）

**SQLite 是嵌入式数据库，**无需安装服务端**。部署时只需：

1. **应用代码 + 依赖包**：常规部署
2. **.db 文件**：随应用一起发布（首次启动自动建表）
3. **WAL 文件（.db-wal、.db-shm）**：**不要提交到 git**（已在 `.gitignore` 覆盖）
4. **备份**：用 `backup` API 或 Litestream 流式复制

```bash
# 部署检查清单
- [ ] .db 文件路径可写
- [ ] WAL 模式已启用
- [ ] busy_timeout ≥ 5000
- [ ] 备份策略已就位（backup API / Litestream）
- [ ] 监控：db 文件大小、WAL 文件大小、慢查询
```

**注意**：相比 MySQL/PG 的"先装 server → 再建库"模式，SQLite 的部署心智模型完全不同 —— 数据库是**应用的一部分**，不是独立服务。

---

## 不做

- 不负责高并发场景优化（> 1000 QPS 写）
- 不处理超大规模数据（建议迁移到 MySQL/PG）
- 不提供主从复制（用 Litestream 替代）
- 不包含 SQLite 源码编译（系统/语言内置已足够）

## 触发词

- 「帮我加 SQLite」/「集成轻量数据库」/「嵌入式数据库」
- 「SQLite 学习」/「SQLite 入门」/「SQLite 选型」
- 「AI 本地数据库」/「本地优先」/「local-first」
- 「RAG 检索」/「FTS5 全文搜索」/「sqlite-vec」
- 「SQLite + Python/Java/Go/Node.js/Rust 集成」

## 相关 Skill

| Skill | 关系 |
|-------|------|
| `database-design-skill` | 数据库通用设计规范（表名/索引/分库分表） |
| `database-learning-skill` | 选型决策树（SQLite vs MySQL vs PG vs MongoDB） |
| `mysql-guide-skill` | MySQL 集成（中大型 Web 首选） |
| `pgsql-guide-skill` | PostgreSQL 集成（复杂查询/JSONB/向量） |
| `mongodb-guide-skill` | MongoDB 集成（文档型） |
| `redis-guide-skill` | Redis 缓存/分布式锁 |
| `kafka-guide-skill` | Kafka 消息队列 |
| `super-deploy-skills/deploy-native-skill` | SQLite 部署（WAL 备份、Litestream） |
