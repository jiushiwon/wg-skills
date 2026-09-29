# 常见问题排查

## 数据库锁定问题

### 症状

- 报错 `SQLITE_BUSY` 或 `database is locked`
- 应用写入操作间歇性失败
- 日志中出现锁超时信息

### 排查步骤

```sql
-- 1. 检查是否启用 WAL 模式
PRAGMA journal_mode;
-- 如果返回 "delete"，建议切换到 WAL

-- 2. 检查 busy_timeout 设置
PRAGMA busy_timeout;
-- 如果返回 0，表示遇到锁立即失败

-- 3. 检查是否有未完成的事务
-- Linux/Mac
fuser myapp.db
lsof myapp.db

-- Windows
handle.exe myapp.db  # Sysinternals 工具
```

### 解决方案

**方案一：启用 WAL 模式 + busy_timeout**

```python
conn.execute("PRAGMA journal_mode=WAL")
conn.execute("PRAGMA busy_timeout=5000")  # 等待 5 秒
```

**方案二：缩短事务持有时间**

```python
# 错误：长事务
def bad_example():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM large_table").fetchall()
        process_data(rows)  # 耗时操作
        conn.execute("UPDATE ...")  # 此时事务已持有很久

# 正确：先处理数据，再开事务写入
def good_example():
    rows = query("SELECT * FROM large_table")  # 独立查询
    process_data(rows)
    with get_conn() as conn:
        conn.execute("UPDATE ...")  # 事务极短
```

**方案三：应用层重试**

```python
import time

def execute_with_retry(sql, params=(), max_retries=3):
    for attempt in range(max_retries):
        try:
            return execute(sql, params)
        except sqlite3.OperationalError as e:
            if "locked" in str(e) and attempt < max_retries - 1:
                time.sleep(0.1 * (attempt + 1))  # 指数退避
                continue
            raise
```

---

## 数据库损坏修复

### 症状

- 报错 `database disk image is malformed`
- 查询返回意外数据或报错
- `PRAGMA integrity_check` 返回错误

### 诊断

```sql
-- 完整性检查
PRAGMA integrity_check;
-- 正常返回: ok
-- 异常返回: 具体错误行

-- 快速检查（只检查关键结构）
PRAGMA quick_check;

-- 查看数据库信息
PRAGMA database_list;
```

### 修复方案

**方案一：导出再导入（推荐）**

```bash
# 导出为 SQL
sqlite3 corrupted.db ".dump" > backup.sql

# 创建新数据库
sqlite3 new.db < backup.sql

# 替换原文件
mv corrupted.db corrupted.db.bak
mv new.db corrupted.db
```

**方案二：Python 代码修复**

```python
import sqlite3

def repair_database(corrupted_path: str, repaired_path: str):
    """从损坏的数据库中恢复数据"""
    try:
        # 尝试以只读模式打开
        src = sqlite3.connect(f"file:{corrupted_path}?mode=ro", uri=True)
        dst = sqlite3.connect(repaired_path)

        # 导出表结构和数据
        for line in src.iterdump():
            try:
                dst.execute(line)
            except sqlite3.OperationalError as e:
                print(f"跳过: {line[:80]}... 错误: {e}")

        dst.commit()
        print(f"修复完成，数据已保存到 {repaired_path}")
    finally:
        src.close()
        dst.close()
```

**方案三：备份恢复**

```python
# 在线备份（SQLite 3.8.7+）
def backup_database(src_path: str, dst_path: str):
    src = sqlite3.connect(src_path)
    dst = sqlite3.connect(dst_path)
    src.backup(dst)  # 原子性备份
    src.close()
    dst.close()
```

### 预防措施

```python
# 定期备份
import shutil
from datetime import datetime

def daily_backup(db_path: str, backup_dir: str):
    today = datetime.now().strftime("%Y%m%d")
    shutil.copy2(db_path, f"{backup_dir}/app_{today}.db")
```

---

## 性能下降排查

### 排查流程

```sql
-- 1. 检查数据库大小
PRAGMA page_count;     -- 总页数
PRAGMA page_size;      -- 每页大小(字节)
-- 总大小 = page_count * page_size

-- 2. 检查索引使用情况
EXPLAIN QUERY PLAN SELECT * FROM users WHERE username = 'test';
-- 如果出现 "SCAN TABLE" 而不是 "SEARCH TABLE USING INDEX"，说明索引未命中

-- 3. 检查碎片率
PRAGMA freelist_count;  -- 空闲页数量
-- 碎片率 = freelist_count / page_count
-- 超过 10% 建议 VACUUM

-- 4. 检查 WAL 文件大小
-- 如果 .db-wal 文件过大（>100MB），可能影响性能
```

### 常见原因及解决

| 原因 | 诊断方式 | 解决方案 |
|------|---------|---------|
| 缺少索引 | EXPLAIN QUERY PLAN | 添加合适索引 |
| 表碎片化 | freelist_count 过高 | 执行 VACUUM |
| WAL 文件过大 | 检查 .db-wal 大小 | 手动检查点 PRAGMA wal_checkpoint(TRUNCATE) |
| 查询未优化 | 检查 SQL 执行计划 | 重写查询，使用 LIMIT |
| 同步模式过高 | PRAGMA synchronous | 改为 NORMAL（WAL 下安全） |

```sql
-- 手动触发 WAL 检查点
PRAGMA wal_checkpoint(TRUNCATE);

-- 查看同步模式
PRAGMA synchronous;
-- 0=OFF, 1=NORMAL, 2=FULL(默认)
```

---

## 并发写入冲突

### 症状

- 多线程/多进程写入时出现 `SQLITE_BUSY`
- 写入操作延迟明显增加
- 偶发性写入失败

### 解决方案

**方案一：写入队列（推荐）**

```python
import queue
import threading

class SQLiteWriter:
    """单线程写入器，避免锁竞争"""
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._queue = queue.Queue()
        self._thread = threading.Thread(target=self._worker, daemon=True)
        self._thread.start()

    def _worker(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA journal_mode=WAL")
        while True:
            sql, params, result_event, result_holder = self._queue.get()
            try:
                cursor = conn.execute(sql, params)
                conn.commit()
                result_holder['result'] = cursor.lastrowid
            except Exception as e:
                result_holder['error'] = e
            finally:
                result_event.set()

    def write(self, sql: str, params: tuple = ()):
        event = threading.Event()
        result = {}
        self._queue.put((sql, params, event, result))
        event.wait()
        if 'error' in result:
            raise result['error']
        return result['result']
```

**方案二：Go 串行写入**

```go
// 已通过 SetMaxOpenConns(1) 实现串行写入
// Go 的 database/sql 会自动排队等待连接
db.SetMaxOpenConns(1)
```

**方案三：批量写入减少冲突**

```python
def batch_insert(table: str, records: list[dict]):
    """将多次写入合并为一次事务"""
    if not records:
        return
    columns = records[0].keys()
    placeholders = ", ".join(["?"] * len(columns))
    sql = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders})"
    values = [tuple(r.values()) for r in records]

    with get_conn() as conn:
        conn.executemany(sql, values)  # 单事务批量插入
```

---

## 迁移到 MySQL/PG

当 SQLite 无法满足需求时，应考虑迁移。

### 何时迁移

| 指标 | SQLite 阈值 | 建议 |
|------|------------|------|
| 数据库大小 | > 1GB | 考虑迁移 |
| 并发连接 | > 10 写/秒 | 考虑迁移 |
| 部署方式 | 多实例/微服务 | 必须迁移 |
| 数据重要性 | 核心业务数据 | 建议迁移 |

### 迁移步骤

```python
import sqlite3
import csv

def export_to_csv(sqlite_path: str, table: str, csv_path: str):
    """导出表数据为 CSV"""
    conn = sqlite3.connect(sqlite_path)
    cursor = conn.execute(f"SELECT * FROM {table}")
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([desc[0] for desc in cursor.description])
        writer.writerows(cursor.fetchall())
    conn.close()
```

### 数据类型映射

| SQLite | MySQL | PostgreSQL |
|--------|-------|------------|
| INTEGER | BIGINT | BIGINT |
| TEXT | VARCHAR(255) 或 TEXT | VARCHAR(255) 或 TEXT |
| REAL | DOUBLE | DOUBLE PRECISION |
| BLOB | LONGBLOB | BYTEA |
| BOOLEAN (0/1) | TINYINT(1) | BOOLEAN |

```python
# 表结构转换示例
def convert_create_table(sqlite_ddl: str) -> str:
    """SQLite DDL -> MySQL DDL"""
    mysql_ddl = sqlite_ddl
    mysql_ddl = mysql_ddl.replace("AUTOINCREMENT", "AUTO_INCREMENT")
    mysql_ddl = mysql_ddl.replace("datetime('now')", "CURRENT_TIMESTAMP")
    mysql_ddl = mysql_ddl.replace("INTEGER PRIMARY KEY", "BIGINT PRIMARY KEY")
    return mysql_ddl
```

### 迁移工具推荐

- **SQLite -> MySQL**: `sqlite3-to-mysql`（Python 包）
- **SQLite -> PostgreSQL**: `sqlite3-to-postgresql`（Python 包）
- **通用**: 手动导出 CSV 再导入
