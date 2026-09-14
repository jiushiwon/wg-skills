---
name: sqlite-module-skill
description: SQLite 数据库模块集成技能。面向已有后端项目的开发者，提供 SQLite 连接配置、CRUD 操作、事务处理、并发访问等能力的快速集成。触发词："SQLite 集成"、"SQLite 配置"、"SQLite 连接"、"sqlite module"、"sqlite setup"、"轻量数据库"、"嵌入式数据库"。
---

# SQLite Module Skill

面向**已有后端项目**的开发者，快速集成 SQLite 能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **连接配置** | SQLite 连接/文件路径配置 |
| **CRUD 操作** | 增删改查/批量操作 |
| **事务处理** | 事务提交/回滚 |
| **并发访问** | WAL 模式/锁机制 |
| **ORM 映射** | 实体类/Repository |

## 触发场景

用户说"帮我加 SQLite"或"集成 SQLite"时触发。

## 核心配置

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
        # 启用 WAL 模式提升并发
        self._init_db()
    
    def _init_db(self):
        with self.get_conn() as conn:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA synchronous=NORMAL")
    
    @contextmanager
    def get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
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

### Go

```go
import (
    "database/sql"
    _ "github.com/mattn/go-sqlite3"
)

func InitDB(dbPath string) (*sql.DB, error) {
    db, err := sql.Open("sqlite3", dbPath)
    if err != nil {
        return nil, err
    }
    
    // 启用 WAL 模式
    db.Exec("PRAGMA journal_mode=WAL")
    db.Exec("PRAGMA synchronous=NORMAL")
    
    return db, nil
}
```

### Java

```java
// application.yml
spring:
  datasource:
    url: jdbc:sqlite:./data/myapp.db
    driver-class-name: org.sqlite.JDBC
```

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

## 事务处理

```python
def transfer_money(from_id: int, to_id: int, amount: float):
    with sqlite_client.get_conn() as conn:
        try:
            # 扣款
            conn.execute(
                "UPDATE wg_account SET balance = balance - ? WHERE id = ?",
                (amount, from_id)
            )
            # 加款
            conn.execute(
                "UPDATE wg_account SET balance = balance + ? WHERE id = ?",
                (amount, to_id)
            )
            conn.commit()
        except Exception:
            conn.rollback()
            raise
```

## 并发优化

```python
# WAL 模式：读写可以并发
conn.execute("PRAGMA journal_mode=WAL")

# 同步模式：平衡安全与性能
conn.execute("PRAGMA synchronous=NORMAL")  # 推荐

# 缓存大小（MB）
conn.execute("PRAGMA cache_size=10000")

# 临时文件内存
conn.execute("PRAGMA temp_store=MEMORY")
```

## 使用场景

| 场景 | 适用性 |
|------|--------|
| 单机工具 | ✅ 完美 |
| 小型应用 | ✅ 推荐 |
| 嵌入式设备 | ✅ 完美 |
| 高并发 Web | ❌ 不推荐 |
| 分布式系统 | ❌ 不推荐 |

## 不做

- 不负责高并发场景优化
- 不处理大规模数据（建议迁移到 MySQL/PG）
- 不提供主从复制
